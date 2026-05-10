const fs = require('fs');
const path = require('path');

async function generateSoal() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not set.');
    process.exit(1);
  }

  const paketDir = path.join(__dirname, '../src/data/paket');
  
  // 1. Cari paket terakhir
  const files = fs.readdirSync(paketDir).filter(f => f.endsWith('.json'));
  let maxNum = 0;
  let targetFile = '';
  
  files.forEach(file => {
    const match = file.match(/^(\d+)-/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) {
        maxNum = num;
        targetFile = file;
      }
    }
  });

  let currentData = { sesi1: [], sesi2: [] };
  let isNewPaket = false;
  let filePath = '';

  if (targetFile) {
    filePath = path.join(paketDir, targetFile);
    const content = fs.readFileSync(filePath, 'utf8');
    try {
      currentData = JSON.parse(content);
    } catch (e) {
      console.error(`Failed to parse ${targetFile}, creating new.`);
      isNewPaket = true;
    }
  } else {
    isNewPaket = true;
  }

  const countSesi1 = currentData.sesi1 ? currentData.sesi1.length : 0;
  const countSesi2 = currentData.sesi2 ? currentData.sesi2.length : 0;

  console.log(`Paket Saat Ini: ${targetFile || 'Baru'}`);
  console.log(`Jumlah Sesi 1 (PG Sedang): ${countSesi1}/60`);
  console.log(`Jumlah Sesi 2 (Kasus Sulit): ${countSesi2}/20`);

  let targetSesi = '';
  let numToGenerate = 0;
  let difficulty = '';
  let prompt = '';

  if (countSesi1 < 60) {
    targetSesi = 'sesi1';
    numToGenerate = Math.min(10, 60 - countSesi1);
    difficulty = 'SEDANG';
    prompt = `Buat ${numToGenerate} soal pilihan ganda tingkat kesulitan ${difficulty} untuk Uji Kompetensi Pemeriksa Pajak.`;
  } else if (countSesi2 < 20) {
    targetSesi = 'sesi2';
    numToGenerate = Math.min(5, 20 - countSesi2);
    difficulty = 'SULIT (Studi Kasus)';
    prompt = `Buat 1 studi kasus dan ${numToGenerate} soal yang berkaitan dengan studi kasus tersebut (tingkat kesulitan SULIT) untuk Uji Kompetensi Pemeriksa Pajak.`;
  } else {
    // Paket penuh, buat paket baru
    isNewPaket = true;
    maxNum++;
    const nextNumStr = maxNum.toString().padStart(2, '0');
    targetFile = `${nextNumStr}-Paket-${maxNum}.json`;
    filePath = path.join(paketDir, targetFile);
    currentData = { sesi1: [], sesi2: [] };
    
    targetSesi = 'sesi1';
    numToGenerate = 10;
    difficulty = 'SEDANG';
    prompt = `Buat ${numToGenerate} soal pilihan ganda tingkat kesulitan ${difficulty} untuk Uji Kompetensi Pemeriksa Pajak.`;
  }

  console.log(`Akan generate ${numToGenerate} soal untuk ${targetSesi} (${difficulty})...`);

  // Lengkapi prompt dengan instruksi detail
  const fullPrompt = `
Anda adalah konsultan pajak senior dan instruktur BPSDM DJP.
${prompt}

KETENTUAN:
- Soal harus menguji pemahaman konsep dan aturan (bukan sekadar hafalan).
- Kategori soal mencakup: PPh Badan, PPh Potput, PPN, KUP/Pemeriksaan.
- Setiap soal memiliki 4 pilihan jawaban (A–D), jawaban benar cukup 1.
- Pilihan pengecoh (distractors) harus masuk akal secara hukum.
- Cantumkan dasar hukum spesifik (pasal, UU, PMK, PP) termasuk aturan terbaru UU HPP.
- Jika terdapat data keuangan, rincian transaksi, atau data panjang lainnya dalam skenario atau pembahasan, buatlah dalam bentuk **HTML Table** (menggunakan tag <table>, <tr>, <th>, <td>) agar tampil rapi di frontend.

FORMAT OUTPUT (Harus berupa valid JSON array dari objek soal, jangan ada teks lain di luar JSON):
[
  {
    "kategori": "pph-badan", // atau pph-potput, ppn, kup
    "skenario": "[isi skenario jika ada, atau kosongkan jika soal mandiri]",
    "soal": "[pertanyaan]",
    "opsi": ["A...", "B...", "C...", "D..."],
    "jawaban": [0-3],
    "pembahasan": "[penjelasan lengkap perhitungan]",
    "dasar": "[pasal dan regulasi]"
  },
  ...
]

PENTING: Berikan output HANYA berupa JSON array yang valid. Jangan gunakan markdown block seperti \`\`\`json ... \`\`\`. Langsung mulai dengan [ dan akhiri dengan ].
`;

  // Panggil API Gemini
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }]
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('API Error:', data);
    process.exit(1);
  }

  try {
    const text = data.candidates[0].content.parts[0].text.trim();
    const jsonStr = text.replace(/^```json/, '').replace(/```$/, '').trim();
    const newSoal = JSON.parse(jsonStr);
    
    // Assign ID baru
    let startId = 1;
    const allSoal = [...(currentData.sesi1 || []), ...(currentData.sesi2 || [])];
    if (allSoal.length > 0) {
      startId = Math.max(...allSoal.map(s => s.id || 0)) + 1;
    }

    newSoal.forEach(s => {
      s.id = startId++;
      if (!currentData[targetSesi]) currentData[targetSesi] = [];
      currentData[targetSesi].push(s);
    });

    // Simpan ke file
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8');
    console.log(`Success! Updated ${filePath} with ${newSoal.length} new questions.`);
  } catch (e) {
    console.error('Failed to parse JSON or write file:', e.message);
    console.error('Raw Response was:', data.candidates[0].content.parts[0].text);
    process.exit(1);
  }
}

generateSoal();
