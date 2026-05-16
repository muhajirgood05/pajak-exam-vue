const fs = require('fs');
const path = require('path');
const { callAIWithFallback, resolveProviderConfig } = require('./ai-client.cjs');

async function generateSoal() {
  const providerConfig = resolveProviderConfig();
  if (!providerConfig.provider || !providerConfig.apiKey) {
    console.error('Error: AI API key is not set. Configure GEMINI_API_KEY or OPENROUTER_API_KEY.');
    process.exit(1);
  }

  const paketDir = path.join(__dirname, '../src/data/paket');
  
  // Pastikan directory ada
  if (!fs.existsSync(paketDir)) {
    fs.mkdirSync(paketDir, { recursive: true });
  }
  
  // 1. Cari paket yang belum lengkap
  const files = fs.readdirSync(paketDir).filter(f => f.endsWith('.json'));
  
  // Parse file info and sort by number
  const paketInfos = files.map(file => {
    const match = file.match(/^(\d+)-/);
    return {
      name: file,
      num: match ? parseInt(match[1]) : 0,
      path: path.join(paketDir, file)
    };
  }).sort((a, b) => a.num - b.num);

  let targetFile = '';
  let currentData = { sesi1: [], sesi2: [] };
  let maxNum = 0;

  for (const info of paketInfos) {
    if (info.num > maxNum) maxNum = info.num;
    
    const content = fs.readFileSync(info.path, 'utf8');
    try {
      const data = JSON.parse(content);
      const c1 = data.sesi1 ? data.sesi1.length : 0;
      const c2 = data.sesi2 ? data.sesi2.length : 0;
      
      if (c1 < 60 || c2 < 20) {
        targetFile = info.name;
        currentData = data;
        console.log(`Menemukan paket belum lengkap: ${targetFile} (Sesi1: ${c1}/60, Sesi2: ${c2}/20)`);
        break;
      }
    } catch (e) {
      console.error(`Failed to parse ${info.name}, skipping.`);
    }
  }

  let filePath = '';
  const countSesi1 = currentData.sesi1 ? currentData.sesi1.length : 0;
  const countSesi2 = currentData.sesi2 ? currentData.sesi2.length : 0;

  if (!targetFile) {
    const nextNum = maxNum + 1;
    const nextNumStr = nextNum.toString().padStart(2, '0');
    targetFile = `${nextNumStr}-Paket-${nextNum}.json`;
    filePath = path.join(paketDir, targetFile);
    currentData = { sesi1: [], sesi2: [] };
    console.log(`Semua paket penuh atau belum ada. Membuat paket baru: ${targetFile}`);
  } else {
    filePath = path.join(paketDir, targetFile);
  }

  let targetSesi = '';
  let numToGenerate = 0;
  let fullPrompt = '';
  let startId = 1;

  const needsSesi1 = countSesi1 < 60;
  const needsSesi2 = countSesi2 < 20;

  if (needsSesi1 && needsSesi2) {
    // Jika keduanya belum lengkap, pilih secara acak namun prioritaskan sesi2 jika masih sangat sedikit
    targetSesi = (Math.random() < 0.6 || countSesi2 < 5) ? 'sesi2' : 'sesi1';
  } else if (needsSesi1) {
    targetSesi = 'sesi1';
  } else if (needsSesi2) {
    targetSesi = 'sesi2';
  }

  if (targetSesi === 'sesi1') {
    targetSesi = 'sesi1';
    numToGenerate = Math.min(3, 60 - countSesi1); // Dikurangi jadi 3 supaya response tidak terlalu panjang
    
    const sSoal = currentData.sesi1 || [];
    startId = sSoal.length > 0 ? Math.max(...sSoal.map(s => s.id || 0)) + 1 : 1;
    
    const existingTopics = sSoal.slice(-15).map(s => `- ${s.skenario.substring(0, 100).replace(/\n/g, ' ')}...`).join('\n');

    fullPrompt = `Buat ${numToGenerate} soal pilihan ganda PPh [BADAN/OP/POTPUT/PPN/KUP] tingkat SEDANG untuk Pemeriksa Pajak DJP.
    
PENTING: JANGAN MENGULANGI skenario, topik, atau perhitungan yang sudah dibuat sebelumnya. Berikut adalah contoh 15 soal terakhir yang SUDAH ADA (hindari membuat soal yang mirip dengan ini):
${existingTopics}
Buatlah variasi kasus baru, pasal yang berbeda, atau jenis pajak lain agar bank soal sangat kaya dan beragam!

Syarat:
- Skenario kasus nyata, angka realistis dalam Rupiah. Angka perhitungan harus dibuat simpel (hindari desimal panjang).
- 4 pilihan jawaban, distractor plausible
- Pembahasan dengan perhitungan step-by-step
- Dasar hukum spesifik (termasuk aturan terbaru UU HPP)
- MATERI SOAL WAJIB MERUJUK PADA SALAH SATU PERATURAN BERIKUT:
  * UU (KUP, PPh, PPN, PBB, BM)
  * PP 50/2022, PP 9/2022, PP 44/2022
  * PMK 41/2020, PMK 60/2022, PMK 71/2022, PMK 131/2024, PMK 11/2025
  * PMK 141/2015, PMK 191/2015, PMK 192/2018
  * PMK 66/2023, PMK 168/2023, PMK 79/2024, PMK 15/2025, PMK 112/2025
- Jika ada data keuangan, gunakan HTML Table.

Format JSON array:
[{"id": ${startId}, "kategori": "pph-badan", "skenario": "...", "soal": "...", "opsi": ["A...", "B...", "C...", "D..."], "jawaban": 0, "pembahasan": "...", "dasar": "..."}]

PENTING: Output HANYA JSON array valid. Mulai dengan [ akhiri dengan ].`;
  } else if (targetSesi === 'sesi2') {
    targetSesi = 'sesi2';
    numToGenerate = Math.min(2, 20 - countSesi2); // Dikurangi jadi 2 agar tidak terpotong (token limit)
    
    const sSoal = currentData.sesi2 || [];
    startId = sSoal.length > 0 ? Math.max(...sSoal.map(s => s.id || 0)) + 1 : 1;
    
    // Ambil topik dari 2 studi kasus terakhir (kira-kira 8 soal terakhir)
    const existingTopics = sSoal.slice(-8).map(s => `- ${s.skenario.substring(0, 100).replace(/\n/g, ' ')}...`).join('\n');

    fullPrompt = `Buat 1 studi kasus kompleks dan ${numToGenerate} soal pilihan ganda tingkat SANGAT SULIT (setara Uji Kompetensi Pemeriksa Pajak / FPP).

PENTING: JANGAN MENGULANGI skenario atau studi kasus yang sudah dibuat sebelumnya. Berikut adalah potongan kasus yang SUDAH ADA:
${existingTopics}
Buatlah skenario studi kasus BARU dengan industri atau permasalahan perpajakan yang sangat berbeda!

KETENTUAN SKENARIO (HARUS MIRIP KASUS AUDIT NYATA):
- 1 skenario perusahaan dengan narasi profesional dan "Temuan Pemeriksa" (Audit Findings) yang spesifik (contoh: biaya tanpa daftar nominatif, DER melebihi batas 4:1, metode TP tidak sesuai, dll).
- Gunakan angka/skala realistis perusahaan besar (Miliaran/Triliunan Rupiah) dalam tabel HTML.
- Skenario harus mencakup kompleksitas lintas-pajak (PPh Badan, Pemotongan/Pemungutan/Unifikasi, PPN, dan sanksi KUP).
- Industri yang disarankan: Konstruksi (termasuk aspek PPh Final Proporsional), Ekspor-Impor, Pertambangan, atau Perusahaan Multinasional.

KETENTUAN SOAL:
- ${numToGenerate} soal SALING BERKAITAN dengan skenario yang sama.
- Setiap soal: 4 pilihan jawaban (A-D), 1 jawaban benar. Distractor harus plausible secara hukum.
- Soal harus menuntut perhitungan multi-step (bukan sekadar hafalan).
- Angka konsisten antar soal (hindari desimal panjang).
- Dasar hukum HARUS sangat spesifik (sebutkan Pasal, Ayat, dari UU, PP, atau PMK yang berlaku).

MATERI MERUJUK PADA: 
UU (KUP/PPh/PPN), PP 50/2022, PP 9/2022 (terkait DER & Dividen), PP 44/2022, PMK 60/2022, PMK 71/2022, PMK 131/2024, PMK 11/2025, PMK 141/2015, PMK 168/2023, PMK 112/2025, dll.

Format JSON array:
[{"id": ${startId}, "kategori": "pph-badan", "skenario": "[STUDI KASUS] ...", "soal": "[STUDI KASUS - Soal 1] ...", "opsi": ["A...", "B...", "C...", "D..."], "jawaban": 0, "pembahasan": "...", "dasar": "..."}]

PENTING: Output HANYA JSON array valid. Mulai dengan [ akhiri dengan ].`;
  }

  if (!targetSesi) {
    console.log('Semua paket sudah lengkap. Tidak ada yang perlu digenerate.');
    process.exit(0);
  }

  console.log(`\nAkan generate ${numToGenerate} soal untuk ${targetSesi} di file ${targetFile}...`);

  try {
    const result = await callAIWithFallback(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    });
    console.log(`Berhasil dengan provider ${result.provider}, model: ${result.model}`);
    
    const text = result.text;
    
    // Ekstrak JSON array
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
      console.error('No valid JSON array found in response.');
      console.error('Raw text (first 1000 chars):', text.substring(0, 1000));
      process.exit(0); // Exit 0 agar workflow tetap sukses dan mencoba lagi di jadwal berikutnya
    }
    
    const jsonStr = text.substring(startIdx, endIdx + 1);
    
    let newSoal;
    try {
      newSoal = JSON.parse(jsonStr);
    } catch (parseErr) {
      // Coba bersihkan common issues
      const cleaned = jsonStr
        .replace(/,\s*]/g, ']')  // trailing comma
        .replace(/,\s*}/g, '}') // trailing comma in object
        .replace(/[\x00-\x1F\x7F]/g, ' '); // control characters
      newSoal = JSON.parse(cleaned);
    }
    
    if (!Array.isArray(newSoal) || newSoal.length === 0) {
      console.error('Parsed result is not a valid array or is empty.');
      process.exit(1);
    }
    
    // Assign ID untuk konsistensi
    let currentId = startId;
    newSoal.forEach(s => {
      s.id = currentId++;
      if (!currentData[targetSesi]) currentData[targetSesi] = [];
      currentData[targetSesi].push(s);
    });

    // Simpan ke file
    if (currentData.sesi1 && currentData.sesi1.length > 60) {
      currentData.sesi1 = currentData.sesi1.slice(0, 60);
    }
    if (currentData.sesi2 && currentData.sesi2.length > 20) {
      currentData.sesi2 = currentData.sesi2.slice(0, 20);
    }
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8');
    console.log(`\nSukses! File ${targetFile} diupdate dengan ${newSoal.length} soal baru.`);
    console.log(`Total sekarang - Sesi1: ${(currentData.sesi1 || []).length}/60, Sesi2: ${(currentData.sesi2 || []).length}/20`);
  } catch (e) {
    console.error('\nGagal generate soal:', e.message);
    console.error('Response AI mungkin terpotong. Akan dicoba lagi pada jadwal berikutnya.');
    process.exit(0); // Exit 0 agar workflow tidak dianggap gagal
  }
}

generateSoal();
