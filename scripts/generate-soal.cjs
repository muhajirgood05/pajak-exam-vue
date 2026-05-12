const fs = require('fs');
const path = require('path');

// Model fallback list - jika model pertama gagal, coba berikutnya
const MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash'
];

// Retry helper with exponential backoff
async function fetchWithRetry(url, options, maxRetries = 4) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 2 menit timeout
      
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      
      // Jika rate limited (429) atau server error (5xx), retry
      if (response.status === 429 || response.status >= 500) {
        const waitTime = Math.min(3000 * Math.pow(2, attempt - 1), 90000);
        console.log(`  Attempt ${attempt}/${maxRetries} failed with status ${response.status}. Retrying in ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) throw err;
      const waitTime = Math.min(3000 * Math.pow(2, attempt - 1), 90000);
      console.log(`  Attempt ${attempt}/${maxRetries} error: ${err.message}. Retrying in ${waitTime / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw lastError || new Error(`All ${maxRetries} attempts failed.`);
}

// Coba panggil API dengan fallback model
async function callGeminiWithFallback(apiKey, prompt) {
  for (const model of MODELS) {
    console.log(`Mencoba model: ${model}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json'
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error(`Model ${model} API Error (${response.status}):`, JSON.stringify(data).substring(0, 500));
        continue; // Coba model berikutnya
      }

      // Cek apakah response punya content
      if (!data.candidates || !data.candidates[0]) {
        console.error(`Model ${model}: No candidates in response.`);
        continue;
      }

      const candidate = data.candidates[0];
      
      // Cek finish reason
      if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
        console.error(`Model ${model}: Blocked by safety filter. Reason: ${candidate.finishReason}`);
        continue;
      }

      if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0].text) {
        console.error(`Model ${model}: Response missing text content.`);
        continue;
      }

      return { model, text: candidate.content.parts[0].text.trim() };
    } catch (err) {
      console.error(`Model ${model} failed completely: ${err.message}`);
      continue; // Coba model berikutnya
    }
  }
  
  throw new Error('Semua model gagal. Tidak bisa generate soal.');
}

async function generateSoal() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not set.');
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

  if (countSesi1 < 60) {
    targetSesi = 'sesi1';
    numToGenerate = Math.min(3, 60 - countSesi1); // Dikurangi jadi 3 supaya response tidak terlalu panjang
    
    const sSoal = currentData.sesi1 || [];
    startId = sSoal.length > 0 ? Math.max(...sSoal.map(s => s.id || 0)) + 1 : 1;

    fullPrompt = `Buat ${numToGenerate} soal pilihan ganda PPh [BADAN/OP/POTPUT/PPN/KUP] tingkat SEDANG untuk Pemeriksa Pajak DJP.

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
  } else if (countSesi2 < 20) {
    targetSesi = 'sesi2';
    numToGenerate = Math.min(4, 20 - countSesi2); // Dikurangi jadi 4
    
    const sSoal = currentData.sesi2 || [];
    startId = sSoal.length > 0 ? Math.max(...sSoal.map(s => s.id || 0)) + 1 : 1;

    fullPrompt = `Buat 1 studi kasus kompleks dan ${numToGenerate} soal pilihan ganda tingkat SULIT untuk Uji Kompetensi Pemeriksa Pajak.

KETENTUAN:
- 1 skenario perusahaan dengan data singkat (maks 5 baris data keuangan dalam tabel HTML).
- ${numToGenerate} soal SALING BERKAITAN dengan skenario yang sama
- Setiap soal: 4 pilihan jawaban (A-D), 1 jawaban benar
- Distractor masuk akal secara hukum
- Angka konsisten antar soal, simpel (hindari desimal panjang)
- Dasar hukum spesifik (pasal, UU, PMK, PP) termasuk UU HPP
- MATERI MERUJUK PADA: UU (KUP/PPh/PPN/PBB/BM), PP 50/2022, PP 9/2022, PP 44/2022, PMK 60/2022, PMK 71/2022, PMK 131/2024, PMK 11/2025, PMK 141/2015, PMK 191/2015, PMK 192/2018, PMK 66/2023, PMK 168/2023, PMK 79/2024, PMK 15/2025, PMK 112/2025

TOPIK (variasikan): Transfer pricing, Restrukturisasi/merger, BUT, e-commerce/PMSE, Properti, Pertambangan, Pelayaran/penerbangan, Transaksi afiliasi

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
    const result = await callGeminiWithFallback(apiKey, fullPrompt);
    console.log(`Berhasil dengan model: ${result.model}`);
    
    const text = result.text;
    
    // Ekstrak JSON array
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
      console.error('No valid JSON array found in response.');
      console.error('Raw text (first 1000 chars):', text.substring(0, 1000));
      process.exit(1);
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
