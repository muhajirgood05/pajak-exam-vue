const fs = require('fs');
const path = require('path');

async function generateSoal() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not set.');
    process.exit(1);
  }

  const paketDir = path.join(__dirname, '../src/data/paket');
  
  // 1. Cari nomor paket berikutnya
  const files = fs.readdirSync(paketDir);
  let maxNum = 0;
  files.forEach(file => {
    const match = file.match(/^(\d+)-/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) maxNum = num;
    }
  });
  
  const nextNum = maxNum + 1;
  const nextNumStr = nextNum.toString().padStart(2, '0');
  const newFileName = `${nextNumStr}-Paket-${nextNum}.json`;
  const newFilePath = path.join(paketDir, newFileName);

  console.log(`Generating soal for ${newFileName}...`);

  // 2. Siapkan Prompt Master
  const prompt = `
Anda adalah konsultan pajak senior dan instruktur BPSDM DJP.
Buat 1 studi kasus kompleks dan 5 soal pilihan ganda tingkat SULIT
untuk Uji Kompetensi Teknis Pemeriksa Pajak.

KETENTUAN:
- 1 skenario perusahaan dengan data lengkap (nama, bidang usaha, tahun pajak, data keuangan, transaksi)
- 5 soal yang SALING BERKAITAN dengan skenario yang sama
- Setiap soal menguji aspek berbeda: (1) PPh Badan, (2) PPh Potput, (3) PPN, (4) KUP/Pemeriksaan, (5) Bebas pilih
- Setiap soal memiliki 4 pilihan jawaban (A–D), jawaban benar cukup 1
- Pilihan pengecoh (distractors) harus masuk akal secara hukum, bukan asal salah
- Angka-angka harus konsisten antar soal
- Cantumkan dasar hukum spesifik (pasal, UU, PMK, PP)

FORMAT OUTPUT (Harus berupa valid JSON object seperti ini, jangan ada teks lain di luar JSON):
{
  "sesi1": [],
  "sesi2": [
    {
      "id": 1,
      "kategori": "[KATEGORI]",
      "skenario": "[isi skenario yang sama untuk semua soal]",
      "soal": "[pertanyaan]",
      "opsi": ["A...", "B...", "C...", "D..."],
      "jawaban": [0-3],
      "pembahasan": "[penjelasan lengkap perhitungan]",
      "dasar": "[pasal dan regulasi]"
    },
    ... (total 5 soal dengan skenario yang sama)
  ]
}

PENTING: Berikan output HANYA berupa JSON yang valid. Jangan gunakan markdown block seperti \`\`\`json ... \`\`\`. Langsung mulai dengan { dan akhiri dengan }.
`;

  // 3. Panggil API Gemini
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('API Error:', data);
    process.exit(1);
  }

  try {
    const text = data.candidates[0].content.parts[0].text.trim();
    
    // Kadang AI tetap memberikan backticks markdown, kita bersihkan jika ada
    const jsonStr = text.replace(/^```json/, '').replace(/```$/, '').trim();
    
    const parsedData = JSON.parse(jsonStr);
    
    // Simpan ke file
    fs.writeFileSync(newFilePath, JSON.stringify(parsedData, null, 2), 'utf8');
    console.log(`Success! File created at ${newFilePath}`);
  } catch (e) {
    console.error('Failed to parse JSON from AI response or write file:', e.message);
    console.error('Raw Response was:', data.candidates[0].content.parts[0].text);
    process.exit(1);
  }
}

generateSoal();
