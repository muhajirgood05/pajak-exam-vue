const fs = require('fs');
const path = require('path');
const { resolveAiSettings, callAiWithFallback } = require('./ai-client.cjs');

async function validateAndCorrect() {
  let aiSettings;
  try {
    aiSettings = resolveAiSettings();
  } catch (err) {
    console.error(`Error konfigurasi AI: ${err.message}`);
    process.exit(1);
  }
  console.log(`Provider AI validasi: ${aiSettings.provider}. Total model fallback: ${aiSettings.models.length}`);

  const paketDir = path.join(__dirname, '../src/data/paket');
  const files = fs.readdirSync(paketDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('Tidak ada file paket untuk divalidasi.');
    process.exit(0);
  }

  // Hanya validasi file terbaru (yang baru saja digenerate)
  const paketInfos = files.map(file => {
    const match = file.match(/^(\d+)-/);
    return { name: file, num: match ? parseInt(match[1]) : 0 };
  }).sort((a, b) => b.num - a.num);

  // Ambil file terakhir saja untuk validasi (hemat quota)
  const latestFile = paketInfos[0].name;
  const filePath = path.join(paketDir, latestFile);
  
  console.log(`\n=========================================`);
  console.log(`Memvalidasi file terbaru: ${latestFile}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    console.error(`Gagal parse JSON file ${latestFile}.`);
    process.exit(0);
  }

  // Gabungkan semua soal
  const allSoal = [];
  if (data.sesi1) data.sesi1.forEach(s => allSoal.push({ sesi: 'sesi1', data: s }));
  if (data.sesi2) data.sesi2.forEach(s => allSoal.push({ sesi: 'sesi2', data: s }));

  if (allSoal.length === 0) {
    console.log(`Tidak ada soal di ${latestFile}.`);
    process.exit(0);
  }

  // Validasi hanya 5 soal terakhir (yang baru ditambahkan)
  const recentSoal = allSoal.slice(-5);
  console.log(`Memvalidasi ${recentSoal.length} soal terakhir...`);

  const promptSoalList = recentSoal.map(b => b.data);

  const fullPrompt = `Anda adalah Auditor Pajak Senior. Review soal-soal ujian berikut.
Periksa:
1. Penerapan aturan perpajakan sudah benar (UU HPP, PMK terbaru)
2. Perhitungan angka benar dan tidak rumit
3. INGAT: Katering adalah objek Pajak Daerah (PBJT), BUKAN PPN

Soal:
${JSON.stringify(promptSoalList, null, 2)}

Format Output JSON array:
[{"id": 1, "status": "VALID"}, {"id": 2, "status": "INVALID", "reason": "...", "corrected_soal": {"id": 2, "kategori": "...", "skenario": "...", "soal": "...", "opsi": ["...", "...", "...", "..."], "jawaban": 0, "pembahasan": "...", "dasar": "..."}}]

Output HANYA JSON array valid. Mulai dengan [ akhiri dengan ].`;

  let result;
  try {
    result = await callAiWithFallback(aiSettings, fullPrompt, { temperature: 0.3, maxOutputTokens: 8192 });
    console.log(`Validasi berhasil dengan provider/model: ${result.provider}/${result.model}`);
  } catch (err) {
    console.error(`Validasi AI gagal: ${err.message}`);
    result = null;
  }
  const rawText = result ? result.text : null;
  
  if (!rawText) {
    console.log('Validasi gagal (semua model error). Soal tetap disimpan tanpa validasi.');
    process.exit(0); // Jangan gagalkan workflow, soal tetap tersimpan
  }

  try {
    const startIdx = rawText.indexOf('[');
    const endIdx = rawText.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
      console.log('Response validasi tidak mengandung JSON valid. Skip validasi.');
      process.exit(0);
    }
    
    const jsonStr = rawText.substring(startIdx, endIdx + 1);
    let results;
    try {
      results = JSON.parse(jsonStr);
    } catch (parseErr) {
      const cleaned = jsonStr.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
      results = JSON.parse(cleaned);
    }

    let correctedCount = 0;
    results.forEach(res => {
      if (res.status === 'INVALID' && res.corrected_soal) {
        console.log(`❌ Soal ID ${res.id} INVALID: ${res.reason}`);
        console.log(`   -> Menerapkan perbaikan...`);
        
        const batchItem = recentSoal.find(b => b.data.id === res.id);
        if (batchItem) {
          const targetSesi = batchItem.sesi;
          const index = data[targetSesi].findIndex(s => s.id === res.id);
          if (index !== -1) {
            data[targetSesi][index] = res.corrected_soal;
            correctedCount++;
          }
        }
      } else {
        console.log(`✅ Soal ID ${res.id} VALID`);
      }
    });

    // Simpan file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`\nSelesai. ${correctedCount} soal diperbaiki.`);
  } catch (e) {
    console.log(`Gagal parse hasil validasi: ${e.message}. Skip validasi.`);
    process.exit(0); // Jangan gagalkan workflow
  }
}

validateAndCorrect();
