const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src/data/paket/04-Paket-4.json');
const data = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

if (!data.sesi1) data.sesi1 = [];
if (!data.sesi2) data.sesi2 = [];

const lastIdSesi1 = data.sesi1.length > 0 ? Math.max(...data.sesi1.map(s => s.id || 0)) : 0;
const lastIdSesi2 = data.sesi2.length > 0 ? Math.max(...data.sesi2.map(s => s.id || 0)) : 0;

const newSesi1 = [
  {
    "id": lastIdSesi1 + 1,
    "kategori": "ppn",
    "skenario": "Pada bulan Mei 2025, PT Karya Niaga (PKP) menjual sebuah mobil sedan bekas operasional direksi seharga Rp 150.000.000. Saat pembelian mobil sedan tersebut di tahun 2021, Pajak Masukannya tidak dapat dikreditkan sesuai dengan ketentuan Pasal 9 ayat (8) huruf c UU PPN.",
    "soal": "Bagaimana perlakuan PPN atas penjualan mobil sedan bekas operasional direksi tersebut berdasarkan Pasal 16D UU PPN?",
    "opsi": [
      "A. Terutang PPN sebesar 12% dari Rp 150.000.000 (Rp 18.000.000).",
      "B. Terutang PPN sebesar 1,2% dari Rp 150.000.000 (Rp 1.800.000) menggunakan besaran tertentu.",
      "C. Tidak terutang PPN karena Pajak Masukan pada saat perolehannya tidak dapat dikreditkan.",
      "D. Dibebaskan dari pengenaan PPN karena merupakan barang bekas."
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan Pasal 16D UU PPN, Pajak Pertambahan Nilai dikenakan atas penyerahan Barang Kena Pajak berupa aktiva yang menurut tujuan semula tidak untuk diperjualbelikan oleh Pengusaha Kena Pajak, KECUALI atas penyerahan aktiva yang Pajak Masukannya tidak dapat dikreditkan sebagaimana dimaksud dalam Pasal 9 ayat (8) huruf b dan huruf c. Karena mobil sedan (station wagon) merupakan aktiva yang PM-nya tidak dapat dikreditkan sesuai Pasal 9 ayat (8) huruf c, maka penyerahannya TIDAK terutang PPN.",
    "dasar": "Pasal 16D UU Nomor 8 Tahun 1983 std UU HPP Nomor 7 Tahun 2021."
  },
  {
    "id": lastIdSesi1 + 2,
    "kategori": "potput",
    "skenario": "PT Selera Nusantara menyediakan jasa katering harian untuk makan siang karyawan PT Tambang Emas dengan nilai kontrak Rp 50.000.000 per bulan.",
    "soal": "Pajak apa sajakah yang berpotensi terutang dan harus dipotong/dipungut atas transaksi pembayaran jasa katering tersebut?",
    "opsi": [
      "A. PPN sebesar 12% dan PPh Pasal 23 sebesar 2%.",
      "B. PPN sebesar 12% saja.",
      "C. PPh Pasal 23 sebesar 2% dan Pajak Barang dan Jasa Tertentu (PBJT) / Pajak Daerah.",
      "D. Hanya PPh Pasal 23 sebesar 2%."
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan UU PPN (Pasal 4A), makanan dan minuman yang disajikan oleh hotel, restoran, rumah makan, warung, dan sejenisnya, termasuk JASA KATERING, BUKAN merupakan Barang/Jasa Kena Pajak (Non-BKP/JKP), melainkan merupakan objek Pajak Daerah (sekarang PBJT). Oleh karena itu, TIDAK ADA PPN. Namun, atas penghasilan jasanya, PT Tambang Emas WAJIB memotong PPh Pasal 23 atas jasa katering dengan tarif 2%.",
    "dasar": "Pasal 4A ayat (2) huruf c dan ayat (3) huruf a UU PPN jo. Pasal 23 ayat (1) huruf c UU PPh."
  },
  {
    "id": lastIdSesi1 + 3,
    "kategori": "kup",
    "skenario": "PT Delta menyampaikan SPT Tahunan PPh Badan Tahun Pajak 2023 pada bulan April 2024 dengan status Rugi Fiskal sebesar Rp 500.000.000. Pada bulan Agustus 2024, sebelum dilakukan pemeriksaan, PT Delta menyadari adanya kesalahan perhitungan penyusutan dan melakukan Pembetulan SPT. Hasil pembetulan menunjukkan Rugi Fiskal berubah menjadi Rp 200.000.000.",
    "soal": "Apa sanksi administrasi yang harus dibayar PT Delta atas pembetulan SPT Tahunan yang mengakibatkan kerugian fiskal menjadi lebih kecil tersebut?",
    "opsi": [
      "A. Sanksi bunga per bulan sebesar tarif Menkeu dikali selisih rugi Rp 300.000.000.",
      "B. Denda administratif sebesar Rp 1.000.000.",
      "C. Sanksi denda 100% dari selisih rugi.",
      "D. Tidak ada sanksi administrasi yang terutang."
    ],
    "jawaban": 3,
    "pembahasan": "Berdasarkan Pasal 8 ayat (2) UU KUP, sanksi bunga atas pembetulan SPT berlaku JIKA pembetulan tersebut mengakibatkan 'utang pajak menjadi lebih besar'. Dalam kasus ini, PT Delta awalnya rugi Rp 500 juta, dibetulkan menjadi rugi Rp 200 juta. Meskipun rugi mengecil, posisi akhir PPh Badan TERUTANG tetap Rp 0 (Nihil), sehingga TIDAK ADA utang pajak yang menjadi lebih besar yang harus dibayar saat pembetulan. Oleh karena itu, tidak ada sanksi administrasi (bunga/denda) yang timbul dari pembetulan ini.",
    "dasar": "Pasal 8 ayat (2) UU KUP (Undang-Undang Ketentuan Umum dan Tata Cara Perpajakan)."
  },
  {
    "id": lastIdSesi1 + 4,
    "kategori": "pph-potput",
    "skenario": "Tuan Yanto meminjamkan uang kepada Koperasi Simpan Pinjam 'Makmur Bersama' (Koperasi tempat ia terdaftar sebagai anggota). Pada bulan Desember 2024, Koperasi membayar bunga pinjaman kepada Tuan Yanto sebesar Rp 500.000. Total bunga pinjaman yang diterima Tuan Yanto dari Koperasi tersebut selama tahun 2024 adalah Rp 3.000.000.",
    "soal": "Berapakah PPh yang harus dipotong oleh Koperasi Makmur Bersama atas pembayaran bunga di bulan Desember 2024 tersebut?",
    "opsi": [
      "A. Rp 0 (Bukan Objek Pajak / Dikecualikan)",
      "B. Rp 50.000 (PPh Final 10%)",
      "C. Rp 75.000 (PPh Pasal 23 15%)",
      "D. Rp 100.000 (PPh Pasal 21)"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan PP 15 Tahun 2009 jo. Pasal 4 ayat (2) UU PPh, penghasilan bunga simpanan yang dibayarkan oleh koperasi kepada anggota koperasi orang pribadi dikenakan PPh Final 10%. NAMUN, jika jumlah bunga simpanan TIDAK MELEBIHI Rp 240.000 PER BULAN, maka tarifnya adalah 0% (Dikecualikan pemotongannya). Wait, Tuan Yanto menerima bunga atas *pinjaman*, bukan bunga *simpanan*! Bunga atas pinjaman (Tuan Yanto meminjamkan ke Koperasi) diperlakukan sebagai Bunga biasa (Pasal 23), bukan bunga simpanan koperasi. Tarif PPh Pasal 23 atas bunga adalah 15%. PPh 23 = 15% x Rp 500.000 = Rp 75.000. Jebakan yang sangat halus terkait perbedaan 'Bunga Simpanan' vs 'Bunga Pinjaman' di Koperasi.",
    "dasar": "Pasal 23 ayat (1) huruf a angka 2 UU PPh (Bunga Pinjaman)."
  },
  {
    "id": lastIdSesi1 + 5,
    "kategori": "ppn",
    "skenario": "Netflix (Perusahaan luar negeri yang telah ditunjuk DJP sebagai Pemungut PPN PMSE) menjual layanan berlangganan film kepada Tuan Budi (Konsumen di Indonesia) dengan harga berlangganan Rp 150.000 per bulan pada tahun 2025.",
    "soal": "Bagaimanakah mekanisme pengenaan PPN atas transaksi berlangganan film tersebut?",
    "opsi": [
      "A. Tuan Budi harus menyetor sendiri PPN Jasa Luar Negeri sebesar 12% x Rp 150.000.",
      "B. Netflix wajib memungut PPN sebesar 12% x Rp 150.000, lalu menyetorkan dan melaporkannya ke DJP.",
      "C. Tidak terutang PPN karena Netflix tidak memiliki Bentuk Usaha Tetap (BUT) di Indonesia.",
      "D. Netflix memungut PPh Pasal 26 dan PPN sekaligus."
    ],
    "jawaban": 1,
    "pembahasan": "Sejak berlakunya PMK-48/PMK.03/2020 (kini diatur lebih lanjut dalam PMK 60/PMK.03/2022 terkait Perdagangan Melalui Sistem Elektronik/PMSE), Pelaku Usaha PMSE dari luar negeri yang telah ditunjuk oleh DJP WAJIB memungut, menyetorkan, dan melaporkan PPN atas produk digital yang dijual kepada konsumen di Indonesia. Tarif yang berlaku adalah tarif PPN umum (12% pada 2025). Jadi, mekanisme self-assessment (setor sendiri) tidak berlaku jika penjual luar negeri sudah ditunjuk sebagai pemungut PMSE.",
    "dasar": "PMK-60/PMK.03/2022 tentang Tata Cara Penunjukan Pemungut, Pemungutan, dan Penyetoran, serta Pelaporan PPN Atas Pemanfaatan BKP Tidak Berwujud dan/atau JKP dari Luar Daerah Pabean di Dalam Daerah Pabean Melalui PMSE."
  }
];

const newSesi2 = [
  {
    "id": lastIdSesi2 + 1,
    "kategori": "ppn",
    "skenario": "[STUDI KASUS: PT INDUSTRI BERIKAT] PT Industri Berikat (PT IB) adalah sebuah perusahaan manufaktur tekstil yang berlokasi di Kawasan Berikat (KB) di wilayah Jawa Barat. Pada bulan Agustus 2025, PT IB melakukan transaksi sebagai berikut:\n(1) Mengimpor mesin tenun dari China senilai Rp 5.000.000.000 (CIF). PT IB memiliki fasilitas penangguhan Bea Masuk.\n(2) Membeli bahan baku kapas dari PT Agro Nusantara (berada di Tempat Lain Dalam Daerah Pabean/TLDDP) seharga Rp 2.000.000.000.\n(3) Menjual kain hasil produksi senilai Rp 8.000.000.000 secara ekspor ke Eropa.\n(4) Menjual kain reject (tidak lolos QC) ke PT Garment Lokal (berada di TLDDP) seharga Rp 500.000.000.",
    "soal": "[Soal 1] Atas transaksi pembelian bahan baku kapas dari PT Agro Nusantara di TLDDP (Transaksi No. 2), bagaimana perlakuan PPN-nya?",
    "opsi": [
      "A. Dipungut PPN sebesar 12% oleh PT Agro Nusantara, dan PT IB dapat mengkreditkannya.",
      "B. Mendapat fasilitas PPN Tidak Dipungut, sehingga PT Agro Nusantara menerbitkan Faktur Pajak dengan kode 07.",
      "C. Mendapat fasilitas PPN Dibebaskan, sehingga PT Agro Nusantara menerbitkan Faktur Pajak dengan kode 08.",
      "D. Dikenakan PPN Final 1% yang disetor sendiri oleh PT IB."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan PMK 65/PMK.04/2021 tentang Kawasan Berikat, pemasukan barang dari Tempat Lain Dalam Daerah Pabean (TLDDP) ke Kawasan Berikat untuk diolah lebih lanjut MENDAPAT FASILITAS PPN TIDAK DIPUNGUT. Fasilitas ini berbeda dengan 'Dibebaskan'. Oleh karena itu, pengusaha di TLDDP (PT Agro Nusantara) wajib menerbitkan Faktur Pajak dengan kode 07 (Penyerahan yang mendapat fasilitas Tidak Dipungut).",
    "dasar": "PMK 65/PMK.04/2021 jo. PER-03/PJ/2022 tentang Faktur Pajak."
  },
  {
    "id": lastIdSesi2 + 2,
    "kategori": "potput",
    "skenario": "[STUDI KASUS: PT INDUSTRI BERIKAT] PT Industri Berikat (PT IB) adalah sebuah perusahaan manufaktur tekstil yang berlokasi di Kawasan Berikat (KB) di wilayah Jawa Barat. Pada bulan Agustus 2025, PT IB melakukan transaksi sebagai berikut:\n(1) Mengimpor mesin tenun dari China senilai Rp 5.000.000.000 (CIF). PT IB memiliki fasilitas penangguhan Bea Masuk.\n(2) Membeli bahan baku kapas dari PT Agro Nusantara (berada di Tempat Lain Dalam Daerah Pabean/TLDDP) seharga Rp 2.000.000.000.\n(3) Menjual kain hasil produksi senilai Rp 8.000.000.000 secara ekspor ke Eropa.\n(4) Menjual kain reject (tidak lolos QC) ke PT Garment Lokal (berada di TLDDP) seharga Rp 500.000.000.",
    "soal": "[Soal 2] Atas transaksi impor mesin tenun (Transaksi No. 1), berapakah PPh Pasal 22 Impor yang harus dilunasi oleh PT IB?",
    "opsi": [
      "A. Rp 0, karena mendapat fasilitas Pembebasan PPh Pasal 22 Impor di Kawasan Berikat.",
      "B. Rp 125.000.000 (2,5% dari Rp 5.000.000.000).",
      "C. Rp 375.000.000 (7,5% dari Rp 5.000.000.000).",
      "D. Ditangguhkan pembayarannya sampai mesin tersebut dijual kembali."
    ],
    "jawaban": 0,
    "pembahasan": "Berdasarkan Pasal 2 PMK 41/PMK.04/2020 jo. PMK 34/2017, atas impor barang modal (mesin) atau bahan baku oleh pengusaha di Kawasan Berikat yang digunakan untuk menghasilkan barang hasil produksi, diberikan fasilitas PEMBEBASAN DARI PEMUNGUTAN PPh PASAL 22. Oleh karena itu, PPh Pasal 22 Impor atas mesin tersebut adalah Rp 0 (Tidak Dipungut/Dibebaskan).",
    "dasar": "Pasal 22 UU PPh jo. PMK 41/PMK.04/2020 tentang Pemberian Pembebasan dari Pemungutan Pajak Penghasilan Pasal 22 atas Impor Barang."
  },
  {
    "id": lastIdSesi2 + 3,
    "kategori": "ppn",
    "skenario": "[STUDI KASUS: PT INDUSTRI BERIKAT] PT Industri Berikat (PT IB) adalah sebuah perusahaan manufaktur tekstil yang berlokasi di Kawasan Berikat (KB) di wilayah Jawa Barat. Pada bulan Agustus 2025, PT IB melakukan transaksi sebagai berikut:\n(1) Mengimpor mesin tenun dari China senilai Rp 5.000.000.000 (CIF). PT IB memiliki fasilitas penangguhan Bea Masuk.\n(2) Membeli bahan baku kapas dari PT Agro Nusantara (berada di Tempat Lain Dalam Daerah Pabean/TLDDP) seharga Rp 2.000.000.000.\n(3) Menjual kain hasil produksi senilai Rp 8.000.000.000 secara ekspor ke Eropa.\n(4) Menjual kain reject (tidak lolos QC) ke PT Garment Lokal (berada di TLDDP) seharga Rp 500.000.000.",
    "soal": "[Soal 3] Bagaimana perlakuan PPN atas penjualan kain reject ke PT Garment Lokal (Transaksi No. 4)?",
    "opsi": [
      "A. Tidak dipungut PPN karena barang tersebut berasal dari Kawasan Berikat.",
      "B. Terutang PPN 12% dan PT IB wajib menerbitkan Faktur Pajak dengan kode 01 serta menyetorkannya ke kas negara.",
      "C. Terutang PPN 12% namun PPN tersebut wajib dilunasi oleh PT Garment Lokal selaku importir menggunakan SSP/Billing saat pengeluaran barang.",
      "D. Bebas PPN karena merupakan barang reject/sisa produksi."
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan aturan Kawasan Berikat (PMK 65/PMK.04/2021), pengeluaran barang hasil produksi atau sisa produksi dari Kawasan Berikat ke TLDDP (Tempat Lain Dalam Daerah Pabean) DIPERSAMAKAN dengan IMPOR. Oleh karena itu, entitas di TLDDP (PT Garment Lokal) bertindak sebagai importir dan wajib melunasi PPN Impor (dan PPh 22 Impor, serta Bea Masuk jika ada) melalui mekanisme penyetoran pabean menggunakan SSP/Billing ke kas negara. PT IB di Kawasan Berikat tidak menerbitkan Faktur Pajak Keluaran standar (kode 01), melainkan menggunakan dokumen kepabeanan (BC 2.5) yang dipersamakan dengan Faktur Pajak.",
    "dasar": "PMK 65/PMK.04/2021 tentang Kawasan Berikat."
  }
];

data.sesi1.push(...newSesi1);
data.sesi2.push(...newSesi2);

fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully injected Batch 4 of questions into 04-Paket-4.json!');
