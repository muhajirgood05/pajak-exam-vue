const fs = require('fs');
const path = require('path');

async function generateSoal() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not set.');
    process.exit(1);
  }

  const paketDir = path.join(__dirname, '../src/data/paket');
  
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
    // Semua paket penuh atau belum ada paket, buat baru
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
    numToGenerate = Math.min(10, 60 - countSesi1);
    
    // Hitung startId untuk sesi1
    const sSoal = currentData.sesi1 || [];
    startId = sSoal.length > 0 ? Math.max(...sSoal.map(s => s.id || 0)) + 1 : 1;

    fullPrompt = `
Buat ${numToGenerate} soal pilihan ganda PPh [BADAN/OP/POTPUT/PPN/KUP] tingkat SEDANG
untuk Pemeriksa Pajak DJP.

Syarat:
- Skenario kasus nyata, angka realistis dalam Rupiah. Angka perhitungan harus dibuat simpel dan tidak menghasilkan angka keriting (hindari pembagian yang menghasilkan desimal panjang).
- 4 pilihan jawaban, distractor plausible (masuk akal)
- Pembahasan dengan perhitungan step-by-step
- Dasar hukum spesifik (termasuk aturan terbaru UU HPP)
- Jika terdapat data keuangan atau rincian transaksi, buatlah dalam bentuk HTML Table (<table>, <tr>, <th>, <td>) agar tampil rapi di frontend.

Format JSON (langsung berupa array objek):
[
  {
    "id": [Mulai dari ${startId}],
    "kategori": "[pph-badan/pph-potput/ppn/kup]",
    "skenario": "...",
    "soal": "...",
    "opsi": ["A...", "B...", "C...", "D..."],
    "jawaban": [0-3],
    "pembahasan": "...",
    "dasar": "..."
  }
]

PENTING: Berikan output HANYA berupa JSON array yang valid. Jangan gunakan markdown block seperti \`\`\`json ... \`\`\`. Langsung mulai dengan [ dan akhiri dengan ].
`;
  } else if (countSesi2 < 20) {
    targetSesi = 'sesi2';
    numToGenerate = Math.min(5, 20 - countSesi2);
    
    // Hitung startId untuk sesi2
    const sSoal = currentData.sesi2 || [];
    startId = sSoal.length > 0 ? Math.max(...sSoal.map(s => s.id || 0)) + 1 : 1;

    fullPrompt = `
Anda adalah konsultan pajak senior dan instruktur BPSDM DJP.
Buat 1 studi kasus kompleks dan ${numToGenerate} soal pilihan ganda tingkat SULIT
untuk Uji Kompetensi Teknis Pemeriksa Pajak.

KETENTUAN:
- 1 skenario perusahaan dengan data unik dan singkat (maksimal 5-7 baris data keuangan/transaksi dalam tabel).
- ${numToGenerate} soal yang SALING BERKAITAN dengan skenario yang sama
- Setiap soal menguji aspek yang relevan dengan skenario (tidak harus mencakup semua jenis pajak, fokus pada 1-2 topik saja agar tidak terlalu rumit).
- Setiap soal memiliki 4 pilihan jawaban (A–D), jawaban benar cukup 1
- Pilihan pengecoh (distractors) harus masuk akal secara hukum, bukan asal salah
- Angka-angka harus konsisten antar soal. Angka perhitungan harus dibuat simpel dan tidak menghasilkan angka keriting (hindari pembagian yang menghasilkan desimal panjang).
- Cantumkan dasar hukum spesifik (pasal, UU, PMK, PP) termasuk aturan terbaru UU HPP.
- Jika terdapat data keuangan atau rincian transaksi, buatlah dalam bentuk HTML Table (<table>, <tr>, <th>, <td>) agar tampil rapi di frontend.

TOPIK YANG BOLEH DIPILIH (variasikan setiap kali):
- Transfer pricing / hubungan istimewa
- Restrukturisasi / merger / akuisisi
- BUT (Bentuk Usaha Tetap)
- Pengusaha e-commerce / PMSE
- Perusahaan properti (PPJB, KPR, BPHTB)
- Industri pertambangan (royalti, IUP)
- Perusahaan pelayaran / penerbangan
- Kelompok usaha dengan transaksi afiliasi

FORMAT OUTPUT (JSON siap pakai):
[
  {
    "id": [Mulai dari ${startId}],
    "kategori": "[KATEGORI]",
    "skenario": "[STUDI KASUS X — Soal Y] [isi skenario]",
    "soal": "[STUDI KASUS X — Soal Y] [pertanyaan]",
    "opsi": ["A...", "B...", "C...", "D..."],
    "jawaban": [0-3],
    "pembahasan": "[penjelasan lengkap perhitungan]",
    "dasar": "[pasal dan regulasi]"
  }
]

PENTING: Berikan output HANYA berupa JSON array yang valid. Jangan gunakan markdown block seperti \`\`\`json ... \`\`\`. Langsung mulai dengan [ dan akhiri dengan ].
`;
  }

  console.log(`Akan generate soal untuk ${targetSesi} di file ${targetFile}...`);

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
    
    // Kita tetap assign ID di sini untuk memastikan konsistensi jika AI salah paham
    let currentId = startId;
    newSoal.forEach(s => {
      s.id = currentId++;
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
