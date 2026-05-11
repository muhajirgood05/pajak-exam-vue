const fs = require('fs');
const path = require('path');

// Retry helper with exponential backoff
async function fetchWithRetry(url, options, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Jika rate limited (429) atau server error (5xx), retry
      if (response.status === 429 || response.status >= 500) {
        const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 60000); // max 60s
        console.log(`Attempt ${attempt}/${maxRetries} failed with status ${response.status}. Retrying in ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (err) {
      // Network error, timeout, dll
      if (attempt === maxRetries) throw err;
      const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 60000);
      console.log(`Attempt ${attempt}/${maxRetries} network error: ${err.message}. Retrying in ${waitTime / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error(`All ${maxRetries} attempts failed.`);
}

async function validateAndCorrect() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not set.');
    process.exit(1);
  }

  const paketDir = path.join(__dirname, '../src/data/paket');
  const files = fs.readdirSync(paketDir).filter(f => f.endsWith('.json'));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  for (const file of files) {
    const filePath = path.join(paketDir, file);
    console.log(`\n=========================================`);
    console.log(`Memeriksa file: ${file}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      console.error(`Gagal parse JSON file ${file}, skip.`);
      continue;
    }

    // Gabungkan semua soal untuk divalidasi per batch
    const allSoal = [];
    if (data.sesi1) data.sesi1.forEach(s => allSoal.push({ sesi: 'sesi1', data: s }));
    if (data.sesi2) data.sesi2.forEach(s => allSoal.push({ sesi: 'sesi2', data: s }));

    if (allSoal.length === 0) {
      console.log(`Tidak ada soal di ${file}.`);
      continue;
    }

    // Proses per batch isi 5 soal
    const batchSize = 5;
    for (let i = 0; i < allSoal.length; i += batchSize) {
      const batch = allSoal.slice(i, i + batchSize);
      console.log(`Memeriksa batch soal ${i + 1} sampai ${Math.min(i + batchSize, allSoal.length)}...`);

      const promptSoalList = batch.map(b => b.data);

      const fullPrompt = `
Anda adalah Auditor Pajak Senior dan Instruktur BPSDM DJP.
Tugas Anda adalah me-review soal-soal ujian kompetensi Pemeriksa Pajak berikut.
Periksa:
1. Apakah penerapan aturan perpajakan sudah benar sesuai dengan peraturan terbaru (UU HPP, PMK 66/2023 tentang Natura, PMK 71/2022 tentang JKP Tertentu, PP 9/2022 tentang Jasa Konstruksi, PMK 168/2023 tentang TER, dll).
   *INGAT*: Jasa penyediaan makan minum (katering) adalah objek Pajak Daerah (PBJT), BUKAN PPN, dan tidak diatur dalam PMK 71/2022.
2. Apakah perhitungan angkanya sudah benar dan tidak menghasilkan angka keriting yang rumit.

Soal-soal yang harus di-review:
${JSON.stringify(promptSoalList, null, 2)}

Format Output yang Anda berikan HARUS berupa JSON array dengan struktur berikut untuk SETIAP soal:
[
  {
    "id": 1,
    "status": "VALID"
  },
  {
    "id": 2,
    "status": "INVALID",
    "reason": "Alasan mengapa tidak valid (aturan salah atau hitungan salah)",
    "corrected_soal": {
      // Objek soal lengkap yang sudah diperbaiki dengan skema yang sama persis
      "id": 2,
      "kategori": "...",
      "skenario": "...",
      "soal": "...",
      "opsi": ["...", "...", "...", "..."],
      "jawaban": 0,
      "pembahasan": "...",
      "dasar": "..."
    }
  }
]

Berikan output HANYA berupa JSON array yang valid. Jangan gunakan markdown block seperti \`\`\`json ... \`\`\`. Langsung mulai dengan [ dan akhiri dengan ].
`;

      try {
        const response = await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8192
            }
          })
        });

        const resData = await response.json();
        
        if (!response.ok) {
          console.error('API Error:', resData);
          continue;
        }

        if (!resData.candidates || !resData.candidates[0].content || !resData.candidates[0].content.parts) {
          console.error('API Response missing content. Full response:', JSON.stringify(resData, null, 2));
          continue;
        }

        const rawText = resData.candidates[0].content.parts[0].text.trim();
        
        // Ekstrak JSON array dengan mencari [ dan ] terluar
        const startIdx = rawText.indexOf('[');
        const endIdx = rawText.lastIndexOf(']');
        
        if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
          console.error('No valid JSON array found in response. Raw text:', rawText);
          continue;
        }
        
        const jsonStr = rawText.substring(startIdx, endIdx + 1);
        const results = JSON.parse(jsonStr);

        // Terapkan perbaikan jika ada
        results.forEach(res => {
          if (res.status === 'INVALID' && res.corrected_soal) {
            console.log(`❌ Soal ID ${res.id} INVALID. Alasan: ${res.reason}`);
            console.log(`   -> Menerapkan perbaikan otomatis...`);
            
            // Cari dan ganti di data asli
            const batchItem = batch.find(b => b.data.id === res.id);
            if (batchItem) {
              const targetSesi = batchItem.sesi;
              const index = data[targetSesi].findIndex(s => s.id === res.id);
              if (index !== -1) {
                data[targetSesi][index] = res.corrected_soal;
              }
            }
          } else {
            console.log(`✅ Soal ID ${res.id} VALID.`);
          }
        });

      } catch (e) {
        console.error('Gagal memproses batch atau parse hasil review:', e.message);
      }

      // Delay antar batch untuk menghindari rate limit
      if (i + batchSize < allSoal.length) {
        console.log('Menunggu 5 detik sebelum batch berikutnya...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Simpan kembali file yang sudah diperbaiki
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Selesai memeriksa ${file}. File diperbarui.`);
  }
}

validateAndCorrect();
