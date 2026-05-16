const fs = require('fs');

const p5 = 'src/data/paket/05-Paket-5.json';
const d5 = JSON.parse(fs.readFileSync(p5));

// 1. Lengkapi Case Study 1 (Pertambangan)
const scenario1 = `[STUDI KASUS PERTAMBANGAN] PT Tambang Mulia adalah pemegang IUP (Izin Usaha Pertambangan) Batubara. Data tahun 2024:<br>1. Penjualan batubara: Rp 500 Miliar.<br>2. Royalti (Iuran Produksi) yang dibayar ke kas negara: Rp 50 Miliar.<br>3. Biaya reklamasi yang dicadangkan: Rp 10 Miliar.<br>4. Biaya eksplorasi tahun berjalan: Rp 20 Miliar.`;

const questions1 = [
  {
    "id": 3,
    "kategori": "pph-badan",
    "skenario": scenario1,
    "soal": "[Soal 3/5] Terkait biaya eksplorasi sebesar Rp 20 Miliar, bagaimanakah pembebanannya jika eksplorasi tersebut menghasilkan penemuan cadangan baru yang ekonomis?",
    "opsi": [
      "A. Harus langsung dibebankan seluruhnya di tahun berjalan",
      "B. Harus dikapitalisasi dan diamortisasi menggunakan metode satuan produksi",
      "C. Tidak dapat dibiayakan karena merupakan investasi aset tetap",
      "D. Dikapitalisasi dan diamortisasi selama 20 tahun garis lurus"
    ],
    "jawaban": 1,
    "pembahasan": "Biaya eksplorasi di bidang pertambangan yang memiliki masa manfaat lebih dari satu tahun dikapitalisasi dan diamortisasi dengan metode satuan produksi (unit of production).",
    "dasar": "Pasal 11A ayat (4) UU PPh."
  },
  {
    "id": 4,
    "kategori": "ppn",
    "skenario": scenario1,
    "soal": "[Soal 4/5] PT Tambang Mulia menjual batubara ke PLN (BUMN). Bagaimanakah mekanisme pemungutan PPN atas transaksi tersebut sesuai aturan terbaru?",
    "opsi": [
      "A. PPN dipungut oleh PT Tambang Mulia",
      "B. PPN dipungut oleh PLN sebagai Pemungut PPN (WAPU)",
      "C. Penjualan batubara dibebaskan dari PPN",
      "D. Penjualan batubara dikenakan PPN 0%"
    ],
    "jawaban": 1,
    "pembahasan": "PLN merupakan instansi pemerintah/BUMN yang ditunjuk sebagai pemungut PPN. Namun perlu diingat batubara kini menjadi objek PPN sesuai UU HPP.",
    "dasar": "PMK No. 8/PMK.03/2021 dan UU HPP."
  },
  {
    "id": 5,
    "kategori": "kup",
    "skenario": scenario1,
    "soal": "[Soal 5/5] Jika dalam pemeriksaan ditemukan bahwa PT Tambang Mulia belum membayar Iuran Tetap (Deadrent), apakah sanksi administrasi tersebut dapat dikurangkan sebagai biaya secara fiskal?",
    "opsi": [
      "A. Dapat, karena berkaitan dengan operasional tambang",
      "B. Tidak dapat, karena sanksi administrasi perpajakan/negara bukan pengurang penghasilan",
      "C. Dapat, asalkan nilainya di bawah 5% omzet",
      "D. Dapat, jika dibayar tepat waktu"
    ],
    "jawaban": 1,
    "pembahasan": "Sanksi administrasi berupa bunga, denda, dan kenaikan yang timbul dari ketentuan perundang-undangan di bidang perpajakan tidak dapat dikurangkan dari penghasilan bruto.",
    "dasar": "Pasal 9 ayat (1) huruf k UU PPh."
  }
];

// 2. Tambah Case Study 2 (E-commerce / PMSE)
const scenario2 = `[STUDI KASUS PMSE] GlobalStream Ltd adalah perusahaan penyedia layanan streaming film yang berkedudukan di Inggris dan tidak memiliki BUT di Indonesia. Sepanjang tahun 2024, GlobalStream memiliki data sebagai berikut:<br>1. Jumlah pelanggan aktif di Indonesia: 200.000 user.<br>2. Total pembayaran dari pelanggan Indonesia: Rp 30 Miliar/tahun.<br>3. Perusahaan telah ditunjuk oleh DJP sebagai Pemungut PPN PMSE.`;

const questions2 = [
  {
    "id": 6,
    "kategori": "ppn",
    "skenario": scenario2,
    "soal": "[Soal 1/5] Berapakah PPN PMSE yang harus dipungut dan disetorkan oleh GlobalStream Ltd atas total pembayaran pelanggan sebesar Rp 30 Miliar tersebut?",
    "opsi": [
      "A. Rp 3.000.000.000",
      "B. Rp 3.300.000.000",
      "C. Rp 0 (Karena perusahaan luar negeri)",
      "D. Rp 300.000.000"
    ],
    "jawaban": 1,
    "pembahasan": "PPN PMSE = 11% x Rp 30 Miliar = Rp 3,3 Miliar. (Tarif PPN 11% sesuai UU HPP).",
    "dasar": "UU PPN Pasal 7 dan PMK No. 60/PMK.03/2022."
  },
  {
    "id": 7,
    "kategori": "pph-potput",
    "skenario": scenario2,
    "soal": "[Soal 2/5] Jika Indonesia menerapkan Pajak Digital (Electronic Transaction Tax) karena belum tercapainya konsensus global Pillar 1, GlobalStream akan dikenakan pajak atas:",
    "opsi": [
      "A. Seluruh penghasilan globalnya",
      "B. Penghasilan yang bersumber dari Indonesia (Significant Economic Presence)",
      "C. Hanya aset fisiknya di Indonesia",
      "D. Jumlah karyawannya di Indonesia"
    ],
    "jawaban": 1,
    "pembahasan": "Konsep Significant Economic Presence (SEP) memungkinkan negara sumber memajaki laba perusahaan digital luar negeri tanpa kehadiran fisik (BUT).",
    "dasar": "Pasal 6 UU No. 2 Tahun 2020."
  },
  {
    "id": 8,
    "kategori": "pph-badan",
    "skenario": scenario2,
    "soal": "[Soal 3/5] Manakah kriteria yang membuat GlobalStream Ltd WAJIB ditunjuk sebagai pemungut PPN PMSE di Indonesia?",
    "opsi": [
      "A. Memiliki kantor perwakilan di Jakarta",
      "B. Nilai transaksi di Indonesia melebihi Rp 600 juta/tahun atau traffic melebihi 12.000/tahun",
      "C. Memiliki server fisik di Indonesia",
      "D. Sudah beroperasi lebih dari 10 tahun"
    ],
    "jawaban": 1,
    "pembahasan": "Kriteria penunjukan pemungut PPN PMSE adalah nilai transaksi > Rp 600 juta/tahun ATAU jumlah traffic/pengakses > 12.000/tahun.",
    "dasar": "Peraturan Direktur Jenderal Pajak No. PER-12/PJ/2020."
  },
  {
    "id": 9,
    "kategori": "kup",
    "skenario": scenario2,
    "soal": "[Soal 4/5] Kapan batas waktu penyetoran PPN PMSE yang telah dipungut oleh GlobalStream Ltd?",
    "opsi": [
      "A. Tanggal 10 bulan berikutnya",
      "B. Tanggal 15 bulan berikutnya",
      "C. Paling lama akhir bulan berikutnya setelah masa pajak berakhir",
      "D. Akhir tahun pajak"
    ],
    "jawaban": 2,
    "pembahasan": "Penyetoran PPN yang dipungut dilakukan paling lama akhir bulan berikutnya setelah masa pajak berakhir.",
    "dasar": "PMK No. 60/PMK.03/2022."
  },
  {
    "id": 10,
    "kategori": "ppn",
    "skenario": scenario2,
    "soal": "[Soal 5/5] Jika GlobalStream Ltd tidak memungut PPN dari pelanggan Indonesia namun sudah ditunjuk sebagai pemungut, apakah sanksi yang dapat dikenakan?",
    "opsi": [
      "A. Pemblokiran akses (traffic) oleh Kominfo atas permintaan DJP",
      "B. Denda 1000% dari nilai transaksi",
      "C. Penyitaan aset di negara asal",
      "D. Penutupan akun bank di luar negeri"
    ],
    "jawaban": 0,
    "pembahasan": "Salah satu sanksi bagi PMSE yang tidak patuh setelah dilakukan teguran adalah pemutusan akses (pemblokiran) oleh Menteri Kominfo.",
    "dasar": "Pasal 18 PMK No. 60/PMK.03/2022."
  }
];

d5.sesi2.push(...questions1);
d5.sesi2.push(...questions2);
d5.totalSoal = d5.sesi1.length + d5.sesi2.length;

fs.writeFileSync(p5, JSON.stringify(d5, null, 2));
console.log('Successfully added more case study questions to Paket 5.');
