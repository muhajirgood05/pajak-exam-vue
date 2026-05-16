const fs = require('fs');
const path = require('path');

const paket5Path = 'src/data/paket/05-Paket-5.json';
const data = {
  "id": "paket-5",
  "title": "Paket Latihan 5 (Pertambangan & UU HPP)",
  "totalSoal": 10,
  "sesi1": [
    {
      "id": 1,
      "kategori": "pph-badan",
      "skenario": "PT Selalu Laba membagikan dividen kepada pemegang sahamnya pada tahun 2024. Salah satu pemegang saham adalah PT Investama (Badan Dalam Negeri) dengan kepemilikan 20%.",
      "soal": "Bagaimanakah perlakuan PPh atas dividen yang diterima oleh PT Investama tersebut sesuai dengan ketentuan UU HPP?",
      "opsi": [
        "A. Objek PPh Pasal 23 dengan tarif 15%",
        "B. Objek PPh Final Pasal 4 ayat (2) dengan tarif 10%",
        "C. Dikecualikan dari objek pajak tanpa syarat investasi",
        "D. Dikecualikan dari objek pajak asalkan diinvestasikan kembali"
      ],
      "jawaban": 2,
      "pembahasan": "Sesuai UU No. 7 Tahun 2021 (UU HPP) dan UU Cipta Kerja, dividen yang berasal dari dalam negeri yang diterima oleh Wajib Pajak Badan Dalam Negeri dikecualikan dari objek Pajak Penghasilan.",
      "dasar": "Pasal 4 ayat (3) huruf f UU PPh sttd UU HPP."
    },
    {
      "id": 2,
      "kategori": "pph-potput",
      "skenario": "Perusahaan memberikan fasilitas apartemen kepada Direktur Utamanya pada tahun 2024. Biaya sewa apartemen tersebut adalah Rp 500.000.000 per tahun.",
      "soal": "Bagaimanakah perlakuan pembebanan biaya (deductibility) atas fasilitas apartemen tersebut bagi perusahaan?",
      "opsi": [
        "A. Non-deductible karena merupakan kenikmatan",
        "B. Deductible (dapat dibiayakan) seluruhnya bagi perusahaan",
        "C. Deductible maksimal Rp 50.000.000 saja",
        "D. Deductible asalkan perusahaan sedang tidak rugi"
      ],
      "jawaban": 1,
      "pembahasan": "Berdasarkan UU HPP dan PMK 66/2023, biaya penggantian atau imbalan dalam bentuk natura dan/atau kenikmatan dapat dikurangkan dari penghasilan bruto (deductible) bagi pemberi kerja.",
      "dasar": "Pasal 6 ayat (1) huruf n UU PPh sttd UU HPP."
    }
  ],
  "sesi2": [
    {
      "id": 1,
      "kategori": "pph-badan",
      "skenario": "[STUDI KASUS PERTAMBANGAN] PT Tambang Mulia adalah pemegang IUP (Izin Usaha Pertambangan) Batubara. Data tahun 2024:<br>1. Penjualan batubara: Rp 500 Miliar.<br>2. Royalti (Iuran Produksi) yang dibayar ke kas negara: Rp 50 Miliar.<br>3. Biaya reklamasi yang dicadangkan: Rp 10 Miliar.<br>4. Biaya eksplorasi tahun berjalan: Rp 20 Miliar.",
      "soal": "[Soal 1/5] Apakah biaya royalti (Iuran Produksi) sebesar Rp 50 Miliar tersebut dapat dikurangkan dari penghasilan bruto (deductible) dalam menghitung PPh Badan?",
      "opsi": [
        "A. Tidak dapat karena merupakan pungutan negara",
        "B. Dapat dikurangkan seluruhnya",
        "C. Hanya dapat dikurangkan sebesar 50%",
        "D. Harus dikapitalisasi sebagai aset tak berwujud"
      ],
      "jawaban": 1,
      "pembahasan": "Royalti atau iuran produksi yang dibayarkan kepada pemerintah atas pemanfaatan sumber daya alam merupakan biaya yang dapat dikurangkan dari penghasilan bruto.",
      "dasar": "Pasal 6 ayat (1) UU PPh."
    },
    {
      "id": 2,
      "kategori": "pph-badan",
      "skenario": "[STUDI KASUS PERTAMBANGAN] PT Tambang Mulia...",
      "soal": "[Soal 2/5] Terkait cadangan biaya reklamasi sebesar Rp 10 Miliar, kapankah biaya tersebut dapat diakui sebagai pengurang penghasilan bruto secara fiskal?",
      "opsi": [
        "A. Pada saat pencadangan dilakukan di laporan keuangan",
        "B. Pada saat realisasi pengeluaran reklamasi dilakukan",
        "C. Tidak dapat dikurangkan sama sekali",
        "D. Dapat dikurangkan asalkan ada jaminan bank"
      ],
      "jawaban": 0,
      "pembahasan": "Khusus untuk industri pertambangan, pembentukan atau pemupukan dana cadangan untuk biaya reklamasi merupakan biaya yang dapat dikurangkan dari penghasilan bruto (deductible) sesuai ketentuan yang diatur.",
      "dasar": "Pasal 9 ayat (1) huruf c UU PPh dan PMK terkait."
    }
  ]
};

fs.writeFileSync(paket5Path, JSON.stringify(data, null, 2));
console.log('Successfully created Paket 5 with initial questions.');
