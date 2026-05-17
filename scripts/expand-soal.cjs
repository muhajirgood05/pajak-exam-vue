const fs = require('fs');
const path = require('path');

// 35 Pertanyaan tambahan untuk Paket 4 (Fokus: KUP, PPN, PPh Potput)
const newSesi1Paket4 = [
  {
    "id": 26,
    "kategori": "ppn",
    "skenario": "PT Fast Logistic (PKP) melakukan jasa pengiriman barang paket ke seluruh Indonesia dengan total nilai transaksi sebesar Rp 10.000.000.",
    "soal": "Berapakah PPN yang harus dipungut oleh PT Fast Logistic menggunakan ketentuan Besaran Tertentu sesuai PMK-71/2022?",
    "opsi": [
      "A. Rp 1.100.000 (11%)",
      "B. Rp 220.000 (2.2%)",
      "C. Rp 110.000 (1.1%)",
      "D. Rp 120.000 (1.2%)"
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan PMK-71/PMK.03/2022, penyerahan jasa pengiriman paket pos dikenai PPN dengan besaran tertentu sebesar 10% dari tarif umum (11%), yang berarti tarif efektifnya adalah 1,1% dari jumlah yang ditagih.<br>PPN = 1,1% x Rp 10.000.000 = Rp 110.000.",
    "dasar": "Pasal 2 PMK-71/PMK.03/2022."
  },
  {
    "id": 27,
    "kategori": "ppn",
    "skenario": "Bapak Anton membangun rumah tinggal secara pribadi (Kegiatan Membangun Sendiri / KMS) dengan luas bangunan 250 meter persegi. Total biaya pembangunan adalah Rp 500.000.000 (tidak termasuk harga perolehan tanah).",
    "soal": "Berapakah PPN atas Kegiatan Membangun Sendiri (KMS) yang wajib disetor sendiri oleh Bapak Anton berdasarkan PMK-61/2022?",
    "opsi": [
      "A. Rp 55.000.000",
      "B. Rp 22.000.000",
      "C. Rp 11.000.000",
      "D. Rp 10.000.000"
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan PMK-61/PMK.03/2022, KMS dengan luas bangunan 200 m2 atau lebih dikenakan PPN dengan tarif efektif 2,2% dari total biaya pembangunan (tidak termasuk tanah), atau dihitung dari 20% x tarif PPN umum (11%) x total biaya.<br>PPN KMS = 2,2% x Rp 500.000.000 = Rp 11.000.000.",
    "dasar": "Pasal 3 PMK-61/PMK.03/2022."
  },
  {
    "id": 28,
    "kategori": "kup",
    "skenario": "PT Berkah Abadi terlambat melaporkan SPT Masa PPN untuk masa pajak Januari 2024 yang seharusnya dilaporkan paling lambat 29 Februari 2024.",
    "soal": "Berapakah sanksi denda administratif yang dikenakan kepada PT Berkah Abadi atas keterlambatan lapor SPT Masa PPN tersebut?",
    "opsi": [
      "A. Rp 100.000",
      "B. Rp 500.000",
      "C. Rp 1.000.000",
      "D. Rp 100.000 per hari keterlambatan"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan Pasal 7 ayat (1) UU KUP, sanksi administrasi berupa denda atas keterlambatan pelaporan SPT Masa PPN adalah sebesar Rp 500.000 per SPT Masa.",
    "dasar": "Pasal 7 ayat (1) UU KUP."
  },
  {
    "id": 29,
    "kategori": "pph-potput",
    "skenario": "PT Multi Kreasi membayar jasa maklon pembuatan seragam karyawan kepada CV Jahit Rapih senilai Rp 100.000.000 (tidak termasuk PPN). Bahan baku disediakan sepenuhnya oleh PT Multi Kreasi.",
    "soal": "Berapakah PPh Pasal 23 yang wajib dipotong oleh PT Multi Kreasi atas pembayaran jasa maklon tersebut?",
    "opsi": [
      "A. Rp 15.000.000",
      "B. Rp 2.000.000",
      "C. Rp 1.500.000",
      "D. Rp 0 (Bukan objek pemotongan)"
    ],
    "jawaban": 1,
    "pembahasan": "Jasa maklon merupakan salah satu jenis jasa lain yang menjadi objek pemotongan PPh Pasal 23 dengan tarif 2% dari jumlah bruto (tidak termasuk PPN).<br>PPh 23 = 2% x Rp 100.000.000 = Rp 2.000.000.",
    "dasar": "Pasal 23 ayat (1) huruf c UU PPh jo. PMK-141/PMK.03/2015."
  },
  {
    "id": 30,
    "kategori": "kup",
    "skenario": "Tuan Hadi terlambat menyampaikan SPT Tahunan PPh Orang Pribadi untuk tahun pajak 2023 yang seharusnya dilaporkan paling lambat 31 Maret 2024.",
    "soal": "Berapakah sanksi denda administratif yang dikenakan kepada Tuan Hadi?",
    "opsi": [
      "A. Rp 100.000",
      "B. Rp 500.000",
      "C. Rp 1.000.000",
      "D. 2% dari jumlah pajak kurang bayar"
    ],
    "jawaban": 0,
    "pembahasan": "Berdasarkan Pasal 7 ayat (1) UU KUP, sanksi administrasi berupa denda atas keterlambatan pelaporan SPT Tahunan Wajib Pajak Orang Pribadi adalah sebesar Rp 100.000.",
    "dasar": "Pasal 7 ayat (1) UU KUP."
  },
  {
    "id": 31,
    "kategori": "pph-potput",
    "skenario": "PT Finance Indonesia membayar bunga obligasi kepada PT Investama (WP Badan DN) sebesar Rp 50.000.000. Obligasi tersebut tidak terdaftar di bursa efek.",
    "soal": "Bagaimanakah kewajiban pemotongan PPh atas pembayaran bunga obligasi tersebut?",
    "opsi": [
      "A. Dipotong PPh Pasal 23 sebesar 15%",
      "B. Dipotong PPh Final Pasal 4 ayat (2) sebesar 10% sesuai PP-91/2021",
      "C. Dipotong PPh Final Pasal 4 ayat (2) sebesar 20%",
      "D. Dikecualikan dari pemotongan PPh"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan PP-91/2021, penghasilan berupa bunga obligasi yang diterima atau diperoleh Wajib Pajak dalam negeri dan bentuk usaha tetap dikenai PPh Final Pasal 4 ayat (2) sebesar 10% dari jumlah bruto bunga obligasi.",
    "dasar": "PP Nomor 91 Tahun 2021."
  },
  {
    "id": 32,
    "kategori": "ppn",
    "skenario": "PT Prima Motor (PKP) menjual sepeda motor bekas seharga Rp 20.000.000 menggunakan ketentuan Besaran Tertentu PPN.",
    "soal": "Berapakah PPN yang wajib dipungut oleh PT Prima Motor berdasarkan PMK-65/2022?",
    "opsi": [
      "A. Rp 2.200.000 (11%)",
      "B. Rp 220.000 (1,1%)",
      "C. Rp 1.100.000 (5,5%)",
      "D. Rp 100.000 (0,5%)"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan PMK-65/PMK.03/2022, penyerahan kendaraan bermotor bekas oleh PKP dikenai PPN dengan besaran tertentu sebesar 10% dari tarif umum (11%), yaitu tarif efektif sebesar 1,1% dari harga jual.<br>PPN = 1,1% x Rp 20.000.000 = Rp 220.000.",
    "dasar": "Pasal 2 PMK-65/PMK.03/2022."
  },
  {
    "id": 33,
    "kategori": "kup",
    "skenario": "Sebuah Surat Ketetapan Pajak Kurang Bayar (SKPKB) sebesar Rp 50.000.000 diterbitkan untuk PT XYZ pada 10 Januari 2024. Hingga tanggal 10 Februari 2024, PT XYZ belum melunasi ketetapan tersebut.",
    "soal": "Berapakah jangka waktu maksimal pelunasan ketetapan pajak tersebut sebelum DJP menerbitkan Surat Paksa?",
    "opsi": [
      "A. 7 hari sejak jatuh tempo",
      "B. 1 bulan sejak diterbitkan",
      "C. 21 hari setelah Surat Teguran diterbitkan",
      "D. Langsung diterbitkan pada hari jatuh tempo"
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan UU Penagihan Pajak dengan Surat Paksa (PPSP), penagihan aktif dilakukan dengan menerbitkan Surat Teguran setelah 7 hari jatuh tempo pelunasan (1 bulan sejak terbit SKP). Jika dalam 21 hari sejak Surat Teguran dikirim WP belum melunasi, barulah Surat Paksa diterbitkan.",
    "dasar": "UU Penagihan Pajak dengan Surat Paksa Nomor 19 Tahun 1997 std UU Nomor 19 Tahun 2000."
  },
  {
    "id": 34,
    "kategori": "pph-potput",
    "skenario": "Tuan Rian (memiliki NPWP) bekerja sebagai pegawai tetap di PT Nusantara dengan gaji bruto Rp 10.000.000 per bulan. Status Tuan Rian adalah TK/0 (Tanpa Tanggungan). Pembayaran iuran pensiun disetor sendiri Rp 200.000.",
    "soal": "Berdasarkan ketentuan TER (Tarif Efektif Rata-rata) PMK-168/2023, kategori TER dan tarif efektif bulanan yang digunakan untuk memotong PPh 21 Tuan Rian di masa Januari adalah?",
    "opsi": [
      "A. Kategori A, tarif 2,25%",
      "B. Kategori A, tarif 2,00%",
      "C. Kategori B, tarif 1,50%",
      "D. Kategori A, tarif 1,50%"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan PMK-168/2023, status TK/0 masuk dalam Kategori TER A. Untuk penghasilan bruto bulanan Rp 10.000.000, tarif TER bulanan Kategori A yang berlaku adalah sebesar 2,00%.<br>PPh 21 bulanan = 2,00% x Rp 10.000.000 = Rp 200.000.",
    "dasar": "Pasal 13 PMK-168/PMK.010/2023."
  },
  {
    "id": 35,
    "kategori": "ppn",
    "skenario": "PT Selera Kuliner (PKP) yang merupakan restoran menyajikan hidangan senilai Rp 50.000.000 kepada pelanggan di restorannya.",
    "soal": "Apakah aspek PPN atas penyerahan makanan dan minuman oleh restoran tersebut?",
    "opsi": [
      "A. Dipungut PPN sebesar 11%",
      "B. Dikenakan PPN dengan besaran tertentu 1,1%",
      "C. Dikecualikan dari objek PPN karena merupakan objek pajak daerah (PBJT)",
      "D. Dibebaskan dari pengenaan PPN"
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan Undang-Undang PPN dan UU HKPD, makanan dan minuman yang disajikan di hotel, restoran, rumah makan, warung, dan sejenisnya dikecualikan dari objek PPN karena merupakan objek Pajak Barang dan Jasa Tertentu (PBJT) yang dipungut oleh Pemerintah Daerah.",
    "dasar": "Pasal 4A ayat (2) huruf c UU PPN sttd UU HPP."
  },
  {
    "id": 36,
    "kategori": "kup",
    "skenario": "Wajib Pajak mengajukan Keberatan atas SKPKB PPh Badan. Setelah melalui proses review, Kantor Wilayah DJP menerbitkan Surat Keputusan Keberatan yang menolak seluruh keberatan Wajib Pajak pada tanggal 15 Maret 2024. Wajib Pajak memutuskan tidak mengajukan Banding.",
    "soal": "Berapakah sanksi denda administrasi yang dikenakan kepada Wajib Pajak atas keputusan keberatan yang ditolak tersebut sesuai UU HPP?",
    "opsi": [
      "A. 50% dari jumlah pajak yang belum dibayar",
      "B. 30% dari jumlah pajak yang belum dibayar",
      "C. 100% dari jumlah pajak yang belum dibayar",
      "D. 30% dari total nilai ketetapan awal"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan Pasal 25 ayat (9) UU KUP sttd UU HPP, jika keberatan Wajib Pajak ditolak atau dikabulkan sebagian, Wajib Pajak dikenai sanksi administrasi berupa denda sebesar 30% dari jumlah pajak berdasarkan keputusan keberatan dikurangi dengan pajak yang telah dibayar sebelum mengajukan keberatan.",
    "dasar": "Pasal 25 ayat (9) UU KUP sttd UU HPP."
  },
  {
    "id": 37,
    "kategori": "pph-potput",
    "skenario": "PT Mitra Logistik (PKP) membayar sewa gedung kantor kepada PT Gedung Prima (PKP) senilai Rp 120.000.000 (tidak termasuk PPN).",
    "soal": "Berapakah PPh yang wajib dipotong oleh PT Mitra Logistik atas pembayaran sewa gedung tersebut?",
    "opsi": [
      "A. Dipotong PPh Pasal 23 sebesar Rp 2.400.000 (2%)",
      "B. Dipotong PPh Final Pasal 4 ayat (2) sebesar Rp 12.000.000 (10%)",
      "C. Dipotong PPh Pasal 23 sebesar Rp 18.000.000 (15%)",
      "D. Tidak dipotong karena transaksi dilakukan antar PKP"
    ],
    "jawaban": 1,
    "pembahasan": "Penghasilan dari sewa tanah dan/atau bangunan merupakan objek PPh yang bersifat Final sebesar 10% dari jumlah bruto nilai persewaan.<br>PPh Final = 10% x Rp 120.000.000 = Rp 12.000.000.",
    "dasar": "Pasal 4 ayat (2) huruf d UU PPh jo. PP Nomor 34 Tahun 2016."
  },
  {
    "id": 38,
    "kategori": "ppn",
    "skenario": "PT Tekno Indonesia (PKP) menyerahkan Lisensi Software (BKP Tidak Berwujud) kepada perusahaan di Jepang dengan nilai transaksi Rp 1.000.000.000.",
    "soal": "Berapakah tarif PPN yang dikenakan atas transaksi ekspor Barang Kena Pajak Tidak Berwujud tersebut?",
    "opsi": [
      "A. 11%",
      "B. 12%",
      "C. 0%",
      "D. Dibebaskan dari PPN"
    ],
    "jawaban": 2,
    "pembahasan": "Ekspor Barang Kena Pajak Berwujud, ekspor Barang Kena Pajak Tidak Berwujud, dan ekspor Jasa Kena Pajak dikenai PPN dengan tarif 0% (Nol Persen).",
    "dasar": "Pasal 7 ayat (1) huruf c UU PPN."
  },
  {
    "id": 39,
    "kategori": "kup",
    "skenario": "Kantor Pelayanan Pajak menerbitkan Surat Ketetapan Pajak Kurang Bayar Tambahan (SKPKBT) kepada PT Berdikari atas hasil pemeriksaan data baru (novum) senilai Rp 200.000.000.",
    "soal": "Berapakah sanksi administrasi berupa kenaikan yang dikenakan dalam SKPKBT tersebut jika diterbitkan di luar jangka waktu 5 tahun karena WP melakukan tindak pidana?",
    "opsi": [
      "A. 50%",
      "B. 100%",
      "C. 200%",
      "D. Bunga per bulan sesuai tarif Kemenkeu"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan Pasal 15 ayat (2) UU KUP, jumlah kekurangan pajak yang terutang dalam SKPKBT ditambah dengan sanksi administrasi berupa kenaikan sebesar 100% dari jumlah kekurangan pajak tersebut.",
    "dasar": "Pasal 15 ayat (2) UU KUP."
  },
  {
    "id": 40,
    "kategori": "pph-potput",
    "skenario": "PT Prima Karya membayar biaya desain grafis brosur kepada Tuan Rendi (WP OP tidak memiliki NPWP) sebesar Rp 20.000.000.",
    "soal": "Berapakah PPh Pasal 21 yang harus dipotong oleh PT Prima Karya atas imbalan jasa bukan pegawai yang tidak berkesinambungan tersebut?",
    "opsi": [
      "A. Rp 500.000",
      "B. Rp 600.000",
      "C. Rp 1.000.000",
      "D. Rp 1.200.000"
    ],
    "jawaban": 1,
    "pembahasan": "Dasar Pengenaan Pajak (DPP) PPh 21 Bukan Pegawai = 50% x Rp 20.000.000 = Rp 10.000.000. Tarif Pasal 17 terkecil = 5%. Karena Tuan Rendi tidak ber-NPWP, dikenai tarif 120% lebih tinggi.<br>PPh 21 = 5% x 120% x Rp 10.000.000 = Rp 600.000.",
    "dasar": "Pasal 21 ayat (5a) UU PPh jo. PER-16/PJ/2016."
  },
  {
    "id": 41,
    "kategori": "ppn",
    "skenario": "PT Sukses Bersama (PKP) membeli bahan baku senilai Rp 80.000.000 dari supplier non-PKP. Supplier tersebut menerbitkan kuitansi biasa tanpa Faktur Pajak.",
    "soal": "Apakah PT Sukses Bersama dapat mengkreditkan Pajak Masukan dari transaksi pembelian tersebut?",
    "opsi": [
      "A. Dapat, dengan membuat Faktur Pajak Masukan sendiri",
      "B. Tidak dapat, karena Pajak Masukan hanya dapat dikreditkan jika supplier menerbitkan Faktur Pajak yang sah",
      "C. Dapat dikreditkan sebesar 11% dari kuitansi",
      "D. Dapat dikreditkan secara proporsional"
    ],
    "jawaban": 1,
    "pembahasan": "Pajak Masukan hanya dapat dikreditkan apabila didukung oleh dokumen Faktur Pajak yang sah yang diterbitkan oleh Pengusaha Kena Pajak (PKP) penjual.",
    "dasar": "Pasal 9 ayat (2) UU PPN."
  },
  {
    "id": 42,
    "kategori": "kup",
    "skenario": "Wajib Pajak Badan mengajukan permohonan banding ke Pengadilan Pajak atas Keputusan Keberatan yang ditolak pada 10 Januari 2024. Pengadilan Pajak memutuskan menolak seluruh banding Wajib Pajak pada 15 September 2024.",
    "soal": "Berapakah sanksi denda administrasi yang dikenakan kepada Wajib Pajak atas putusan banding yang ditolak tersebut sesuai UU HPP?",
    "opsi": [
      "A. 100% dari jumlah pajak yang belum dibayar",
      "B. 50% dari jumlah pajak yang belum dibayar",
      "C. 60% dari jumlah pajak berdasarkan Putusan Banding dikurangi yang telah dibayar sebelum keberatan",
      "D. 30% dari jumlah pajak berdasarkan Putusan Banding"
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan Pasal 27 ayat (5d) UU KUP sttd UU HPP, dalam hal permohonan banding ditolak atau dikabulkan sebagian, Wajib Pajak dikenai sanksi administrasi berupa denda sebesar 60% dari jumlah pajak berdasarkan putusan banding dikurangi dengan pembayaran pajak yang telah dibayar sebelum mengajukan keberatan.",
    "dasar": "Pasal 27 ayat (5d) UU KUP sttd UU HPP."
  },
  {
    "id": 43,
    "kategori": "pph-potput",
    "skenario": "PT Bahari Cargo membayar jasa pengurusan transportasi (freight forwarding) kepada PT Trans Logistik senilai Rp 80.000.000.",
    "soal": "Berapakah PPh Pasal 23 yang wajib dipotong PT Bahari Cargo atas jasa pengurusan transportasi tersebut?",
    "opsi": [
      "A. Rp 12.000.000 (15%)",
      "B. Rp 1.600.000 (2%)",
      "C. Rp 800.000 (1%)",
      "D. Rp 0 (Bukan objek pajak)"
    ],
    "jawaban": 1,
    "pembahasan": "Jasa pengurusan transportasi (freight forwarding) dikategorikan sebagai Jasa Lain yang dikenai pemotongan PPh Pasal 23 sebesar 2% dari jumlah bruto tidak termasuk PPN.<br>PPh 23 = 2% x Rp 80.000.000 = Rp 1.600.000.",
    "dasar": "PMK-141/PMK.03/2015."
  },
  {
    "id": 44,
    "kategori": "ppn",
    "skenario": "PT Nusa Indah didirikan pada Januari 2024 dan langsung melakukan penjualan barang elektronik. Omzet penjualan pada akhir Februari 2024 mencapai Rp 5.000.000.000.",
    "soal": "Kapan batas waktu paling lambat PT Nusa Indah wajib melaporkan usahanya untuk dikukuhkan sebagai Pengusaha Kena Pajak (PKP)?",
    "opsi": [
      "A. Akhir tahun pajak 2024",
      "B. Paling lambat akhir bulan berikutnya setelah omzet melebihi Rp 4.800.000.000 (31 Maret 2024)",
      "C. Langsung dikukuhkan secara jabatan oleh DJP pada bulan Februari",
      "D. Tidak wajib dikukuhkan karena merupakan UMKM"
    ],
    "jawaban": 1,
    "pembahasan": "Wajib Pajak yang omzetnya telah melebihi batas pengusaha kecil (Rp 4,8 Miliar) wajib melaporkan usahanya untuk dikukuhkan sebagai PKP paling lambat akhir bulan berikutnya setelah bulan terjadinya omzet melebihi batas tersebut.",
    "dasar": "PMK-197/PMK.03/2013."
  },
  {
    "id": 45,
    "kategori": "kup",
    "skenario": "PT Maju Jaya menyampaikan SPT Tahunan PPh Badan Lebih Bayar Rp 200.000.000. DJP melakukan pemeriksaan restitusi dan menerbitkan SKPLB pada 15 November 2024 (13 bulan setelah permohonan diterima lengkap).",
    "soal": "Apakah hak Wajib Pajak atas keterlambatan penerbitan SKPLB yang melebihi batas waktu 12 bulan tersebut?",
    "opsi": [
      "A. Diberikan imbalan bunga sebesar suku bunga acuan per bulan maksimal 24 bulan atas keterlambatan tersebut",
      "B. Permohonan dianggap gugur",
      "C. Bebas dari pemeriksaan pajak tahun berikutnya",
      "D. Mendapatkan restitusi sebesar 200% dari nilai lebih bayar"
    ],
    "jawaban": 0,
    "pembahasan": "Apabila penerbitan SKPLB terlambat (melebihi jangka waktu 12 bulan sejak permohonan diterima secara lengkap), Wajib Pajak berhak mendapatkan imbalan bunga sesuai suku bunga acuan per bulan dihitung sejak berakhirnya jangka waktu 12 bulan tersebut sampai diterbitkannya SKPLB.",
    "dasar": "Pasal 17B ayat (3) UU KUP."
  },
  {
    "id": 46,
    "kategori": "pph-potput",
    "skenario": "Koperasi Simpan Pinjam 'Tunas Mandiri' membayar bunga simpanan kepada anggotanya, Ibu Siti (WP OP DN), sebesar Rp 400.000 pada suatu bulan.",
    "soal": "Berapakah PPh Final Pasal 4 ayat (2) yang wajib dipotong oleh koperasi atas pembayaran bunga simpanan tersebut?",
    "opsi": [
      "A. Rp 0",
      "B. Rp 40.000 (10%)",
      "C. Rp 16.000 (4%)",
      "D. Rp 60.000 (15%)"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan PP-15/2009, bunga simpanan koperasi yang dibayarkan kepada anggota OP dikenai PPh Final: 0% untuk bunga s.d. Rp 240.000 per bulan, dan 10% dari jumlah bruto untuk bunga di atas Rp 240.000 per bulan. Karena bunga yang dibayarkan Rp 400.000 (di atas Rp 240.000), seluruh jumlah bruto dikenai tarif 10%.<br>PPh Final = 10% x Rp 400.000 = Rp 40.000.",
    "dasar": "PP Nomor 15 Tahun 2009."
  },
  {
    "id": 47,
    "kategori": "ppn",
    "skenario": "PT Mega Tekstil (PKP) mengekspor kain senilai Rp 2.000.000.000 ke Singapura pada tahun 2024.",
    "soal": "Berapakah tarif PPN yang terutang atas kegiatan ekspor Barang Kena Pajak tersebut?",
    "opsi": [
      "A. 11% dari Nilai Ekspor",
      "B. 12% dari Nilai Ekspor",
      "C. 0% dari Nilai Ekspor",
      "D. Dibebaskan dari pengenaan PPN"
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan Pasal 7 ayat (1) huruf c UU PPN, ekspor Barang Kena Pajak dikenai tarif PPN sebesar 0% (Nol Persen).",
    "dasar": "Pasal 7 ayat (1) huruf c UU PPN."
  },
  {
    "id": 48,
    "kategori": "kup",
    "skenario": "Seorang Wajib Pajak Orang Pribadi yang melakukan kegiatan usaha memiliki omzet usaha sebesar Rp 3.000.000.000 pada tahun 2023.",
    "soal": "Apakah Wajib Pajak tersebut wajib menyelenggarakan pembukuan atau diperkenankan menggunakan pencatatan?",
    "opsi": [
      "A. Wajib menyelenggarakan pembukuan karena merupakan pengusaha",
      "B. Wajib menyelenggarakan pencatatan, dan diperbolehkan menggunakan Norma Penghitungan Penghasilan Neto (NPPN)",
      "C. Wajib menyelenggarakan pembukuan penuh tanpa pengecualian",
      "D. Bebas memilih tanpa perlu melapor ke DJP"
    ],
    "jawaban": 1,
    "pembahasan": "Wajib Pajak Orang Pribadi yang melakukan kegiatan usaha atau pekerjaan bebas dengan peredaran bruto kurang dari Rp 4.800.000.000 dalam setahun diperbolehkan menghitung penghasilan neto dengan menggunakan Norma Penghitungan Penghasilan Neto (NPPN) dengan syarat wajib menyelenggarakan pencatatan dan melapor ke DJP.",
    "dasar": "Pasal 28 ayat (2) UU KUP jo. Pasal 14 UU PPh."
  },
  {
    "id": 49,
    "kategori": "pph-potput",
    "skenario": "PT Sumber Mineral (PKP) melakukan pembayaran jasa sewa alat berat kepada Tuan Budi (WP OP non-PKP yang ber-NPWP) senilai Rp 10.000.000.",
    "soal": "Berapakah PPh Pasal 23 yang wajib dipotong oleh PT Sumber Mineral atas transaksi tersebut?",
    "opsi": [
      "A. Rp 200.000 (2%)",
      "B. Rp 400.000 (4%)",
      "C. Rp 1.500.000 (15%)",
      "D. Rp 0 (Tidak dipotong karena bukan badan)"
    ],
    "jawaban": 0,
    "pembahasan": "Sewa dan penghasilan lain sehubungan dengan penggunaan harta (selain sewa tanah/bangunan) merupakan objek PPh Pasal 23 dengan tarif 2% dari jumlah bruto, meskipun penerimanya adalah Wajib Pajak Orang Pribadi.<br>PPh 23 = 2% x Rp 10.000.000 = Rp 200.000.",
    "dasar": "Pasal 23 ayat (1) huruf c UU PPh."
  },
  {
    "id": 50,
    "kategori": "ppn",
    "skenario": "PT Inti Pratama (PKP) menyerahkan Barang Kena Pajak kepada Kedutaan Besar Jepang di Jakarta yang memiliki surat keterangan pembebasan PPN dari kementerian terkait.",
    "soal": "Manakah kode Faktur Pajak yang harus digunakan oleh PT Inti Pratama atas penyerahan tersebut?",
    "opsi": [
      "A. 01 (Penyerahan Umum)",
      "B. 07 (PPN Tidak Dipungut)",
      "C. 08 (PPN Dibebaskan)",
      "D. 09 (Penyerahan Lainnya)"
    ],
    "jawaban": 2,
    "pembahasan": "Penyerahan BKP/JKP yang mendapat fasilitas PPN Dibebaskan (seperti penyerahan kepada perwakilan negara asing) menggunakan kode transaksi Faktur Pajak 08.",
    "dasar": "Lampiran PER-03/PJ/2022 tentang Faktur Pajak."
  },
  {
    "id": 51,
    "kategori": "kup",
    "skenario": "DJP menerbitkan Surat Ketetapan Pajak Kurang Bayar (SKPKB) PPh Badan PT Jaya Abadi untuk tahun pajak 2020 pada tanggal 12 Juni 2026.",
    "soal": "Berdasarkan daluwarsa penetapan pajak, apakah penerbitan SKPKB tersebut sah secara hukum?",
    "opsi": [
      "A. Sah, karena daluwarsa penetapan pajak adalah 10 tahun",
      "B. Tidak sah, karena telah melewati jangka waktu daluwarsa penetapan pajak selama 5 tahun",
      "C. Sah, karena tidak ada daluwarsa untuk Wajib Pajak Badan",
      "D. Tergantung apakah WP menyetujuinya"
    ],
    "jawaban": 1,
    "pembahasan": "Daluwarsa untuk menetapkan pajak (penerbitan SKP) adalah dalam jangka waktu 5 tahun setelah saat terutangnya pajak atau berakhirnya Masa Pajak, bagian Tahun Pajak, atau Tahun Pajak.<br>Untuk Tahun Pajak 2020, batas daluwarsanya adalah akhir tahun 2025. Sehingga penerbitan SKPKB pada Juni 2026 adalah TIDAK SAH (daluwarsa).",
    "dasar": "Pasal 13 ayat (1) UU KUP."
  },
  {
    "id": 52,
    "kategori": "pph-potput",
    "skenario": "PT Delta Cemerlang membayar dividen kepada Tuan Alex (Warga Negara Asing / WPLN) sebesar Rp 100.000.000. Tidak ada P3B (Tax Treaty) antara Indonesia dengan negara asal Tuan Alex.",
    "soal": "Berapakah PPh Pasal 26 yang wajib dipotong oleh PT Delta Cemerlang atas pembayaran dividen kepada Tuan Alex tersebut?",
    "opsi": [
      "A. Rp 20.000.000 (20%)",
      "B. Rp 10.000.000 (10%)",
      "C. Rp 15.000.000 (15%)",
      "D. Rp 0 (Bebas pajak luar negeri)"
    ],
    "jawaban": 0,
    "pembahasan": "Berdasarkan Pasal 26 UU PPh, penghasilan berupa dividen yang dibayarkan kepada Wajib Pajak Luar Negeri dikenai pemotongan PPh Pasal 26 sebesar 20% dari jumlah bruto (kecuali diatur lain dalam P3B/Tax Treaty).<br>PPh 26 = 20% x Rp 100.000.000 = Rp 20.000.000.",
    "dasar": "Pasal 26 ayat (1) huruf a UU PPh."
  },
  {
    "id": 53,
    "kategori": "ppn",
    "skenario": "PT Karya Semesta melakukan ekspor Jasa Kena Pajak berupa jasa maklon jahit baju ke pemesan di Australia dengan nilai ekspor jasa Rp 500.000.000.",
    "soal": "Berapakah tarif PPN yang terutang atas kegiatan ekspor Jasa Kena Pajak maklon tersebut?",
    "opsi": [
      "A. 11%",
      "B. 12%",
      "C. 0%",
      "D. Bebas PPN"
    ],
    "jawaban": 2,
    "pembahasan": "Ekspor Jasa Kena Pajak (termasuk Jasa Maklon yang dihasilkan untuk dimanfaatkan di luar daerah pabean) dikenai PPN dengan tarif 0%.",
    "dasar": "PMK-32/PMK.03/2019 tentang Jasa Kena Pajak yang Atas Ekspornya Dikenai PPN 0%."
  },
  {
    "id": 54,
    "kategori": "kup",
    "skenario": "Wajib Pajak menerima Surat Teguran dari KPP karena belum melaporkan SPT Masa PPN setelah lewat 30 hari dari batas waktu pelaporan.",
    "soal": "Apakah langkah hukum pertama yang wajib dilakukan Wajib Pajak setelah menerima Surat Teguran tersebut?",
    "opsi": [
      "A. Mengajukan gugatan ke Pengadilan Pajak",
      "B. Segera menyusun dan melaporkan SPT Masa PPN yang terlambat tersebut dalam jangka waktu yang ditentukan dalam Surat Teguran",
      "C. Mengabaikannya sampai ada pemeriksaan",
      "D. Membayar denda langsung tanpa lapor SPT"
    ],
    "jawaban": 1,
    "pembahasan": "Wajib Pajak yang menerima Surat Teguran wajib segera menyampaikan SPT yang terlambat tersebut dalam batas waktu yang ditentukan dalam Surat Teguran untuk menghindari penerbitan Surat Ketetapan Pajak secara jabatan (SKPKB).",
    "dasar": "Pasal 3 ayat (5a) UU KUP."
  },
  {
    "id": 55,
    "kategori": "pph-potput",
    "skenario": "PT Aneka Jasa membayar sewa ruang kantor kepada Dana Pensiun (Dapen) yang pendiriannya telah disahkan oleh Menteri Keuangan senilai Rp 50.000.000.",
    "soal": "Bagaimanakah kewajiban pemotongan PPh atas pembayaran sewa ruang kantor kepada Dana Pensiun tersebut?",
    "opsi": [
      "A. Dipotong PPh Final Pasal 4 ayat (2) sebesar 10%",
      "B. Dipotong PPh Pasal 23 sebesar 2%",
      "C. Dikecualikan dari pemotongan PPh karena penghasilan Dana Pensiun dari bidang tertentu bukan merupakan objek pajak",
      "D. Dipotong PPh Pasal 23 sebesar 15%"
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan Pasal 4 ayat (3) huruf h UU PPh, penghasilan yang diterima atau diperoleh dana pensiun yang pendiriannya telah disahkan oleh Menteri Keuangan dari bidang-bidang tertentu (seperti sewa tanah/bangunan) dikecualikan dari objek Pajak Penghasilan.",
    "dasar": "Pasal 4 ayat (3) huruf h UU PPh."
  },
  {
    "id": 56,
    "kategori": "ppn",
    "skenario": "PT Agro Raya (PKP) menyerahkan buah-buahan segar hasil pertanian lokal kepada PT Supermarket senilai Rp 100.000.000.",
    "soal": "Apakah aspek PPN atas penyerahan buah-buahan segar hasil pertanian tersebut?",
    "opsi": [
      "A. Dipungut PPN sebesar 11%",
      "B. Mendapat fasilitas PPN Dibebaskan sesuai dengan ketentuan UU HPP",
      "C. Dikenakan PPN dengan besaran tertentu 1,1%",
      "D. Dipungut PPN sebesar 12%"
    ],
    "jawaban": 1,
    "pembahasan": "Buah-buahan segar hasil pertanian merupakan barang hasil pertanian yang termasuk dalam kategori Barang Kena Pajak Tertentu yang bersifat strategis yang dibebaskan dari pengenaan PPN sesuai UU HPP.",
    "dasar": "Pasal 16B UU PPN sttd UU HPP jo. PP Nomor 49 Tahun 2022."
  },
  {
    "id": 57,
    "kategori": "kup",
    "skenario": "PT Semesta Alam melakukan pembetulan SPT Tahunan PPh Badan secara sukarela sebelum ada tindakan pemeriksaan, yang mengakibatkan kurang bayar bertambah sebesar Rp 100.000.000. Pembetulan dilakukan setelah lewat 12 bulan dari batas waktu pelaporan.",
    "soal": "Berapakah sanksi bunga per bulan yang harus dibayar PT Semesta Alam atas kurang bayar tersebut?",
    "opsi": [
      "A. Bunga tetap 2% per bulan maksimal 24 bulan",
      "B. Bunga per bulan sebesar suku bunga acuan ditambah 5% dibagi 12 maksimal 24 bulan",
      "C. Kenaikan 50% dari kurang bayar",
      "D. Bebas sanksi bunga karena dilakukan secara sukarela"
    ],
    "jawaban": 1,
    "pembahasan": "Sanksi bunga atas pembetulan SPT sendiri yang menyebabkan kurang bayar bertambah adalah bunga per bulan sebesar tarif bunga kalender (Suku Bunga Acuan + 5%) / 12, maksimal 24 bulan.",
    "dasar": "Pasal 8 ayat (2a) UU KUP sttd UU HPP."
  },
  {
    "id": 58,
    "kategori": "pph-potput",
    "skenario": "PT Sukses Pratama membayar bunga pinjaman kepada bank Mandiri (bank BUMN) sebesar Rp 30.000.000.",
    "soal": "Bagaimanakah kewajiban pemotongan PPh atas pembayaran bunga pinjaman kepada bank tersebut?",
    "opsi": [
      "A. Wajib dipotong PPh Pasal 23 sebesar 15%",
      "B. Wajib dipotong PPh Final 20%",
      "C. Dikecualikan dari pemotongan PPh Pasal 23 karena pembayaran kepada perbankan dikecualikan dari pemotongan PPh",
      "D. Dipotong PPh Pasal 23 sebesar 2%"
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan Pasal 23 ayat (4) huruf a UU PPh, pemotongan pajak PPh Pasal 23 tidak berlaku atas penghasilan yang dibayarkan atau terutang kepada bank.",
    "dasar": "Pasal 23 ayat (4) huruf a UU PPh."
  },
  {
    "id": 59,
    "kategori": "ppn",
    "skenario": "PT Indotech (PKP) menggunakan jasa konsultasi manajemen dari perusahaan luar negeri yang tidak terdaftar BUT di Indonesia (Jasa Luar Negeri) dengan nilai kontrak Rp 200.000.000 pada tahun 2024.",
    "soal": "Bagaimanakah kewajiban PPN atas pemanfaatan Jasa Kena Pajak dari luar daerah pabean tersebut?",
    "opsi": [
      "A. Tidak terutang PPN karena penyedia jasa berkedudukan di luar negeri",
      "B. PT Indotech wajib memungut, menyetor, dan melaporkan PPN Jasa Luar Negeri sebesar 11% dari nilai kontrak (Rp 22.000.000) menggunakan SSP",
      "C. Perusahaan luar negeri tersebut yang wajib melapor dan menyetor PPN ke DJP",
      "D. Dibebaskan dari pengenaan PPN"
    ],
    "jawaban": 1,
    "pembahasan": "Pemanfaatan Jasa Kena Pajak dari luar daerah pabean di dalam daerah pabean terutang PPN. Pihak yang memanfaatkan JKP (PT Indotech) wajib menyetor PPN Impor Jasa sebesar 11% menggunakan SSP atas nama WPLN qq. PT Indotech.",
    "dasar": "Pasal 4 ayat (1) huruf d UU PPN."
  },
  {
    "id": 60,
    "kategori": "kup",
    "skenario": "Wajib Pajak Orang Pribadi menerima Surat Ketetapan Pajak Nihil (SKPN) dari KPP setelah dilakukan pemeriksaan pajak menyeluruh.",
    "soal": "Apakah arti hukum dari diterbitkannya Surat Ketetapan Pajak Nihil (SKPN) tersebut?",
    "opsi": [
      "A. Jumlah kredit pajak sama dengan jumlah pajak yang terutang, atau pajak tidak terutang dan tidak ada kredit pajak",
      "B. Wajib Pajak memiliki lebih bayar pajak yang akan dikembalikan",
      "C. Wajib Pajak masih kurang bayar dan akan diterbitkan SKPKB",
      "D. Pemeriksaan dibatalkan"
    ],
    "jawaban": 0,
    "pembahasan": "Surat Ketetapan Pajak Nihil (SKPN) diterbitkan jika jumlah kredit pajak sama dengan jumlah pajak yang terutang, atau pajak tidak terutang dan tidak ada kredit pajak.",
    "dasar": "Pasal 17A UU KUP."
  }
];

// 35 Pertanyaan tambahan untuk Paket 5 (Fokus: Pertambangan & UU HPP)
const newSesi1Paket5 = [
  {
    "id": 26,
    "kategori": "pph-badan",
    "skenario": "PT Bara Mineral (pemegang IUP Batubara) menyetor iuran tetap (landrent) tahunan kepada pemerintah senilai Rp 500.000.000 dan membayar royalti produksi batubara sebesar Rp 12.000.000.000.",
    "soal": "Bagaimanakah perlakuan pembebanan (deductibility) atas iuran tetap dan royalti produksi pertambangan tersebut bagi PT Bara Mineral?",
    "opsi": [
      "A. Keduanya non-deductible karena merupakan pembayaran kepada pemerintah.",
      "B. Royalti dapat dikurangkan (deductible), sedangkan iuran tetap non-deductible.",
      "C. Keduanya dapat dikurangkan (deductible) sebagai biaya untuk mendapatkan, menagih, dan memelihara penghasilan (biaya 3M).",
      "D. Keduanya non-deductible karena PPh perusahaan tambang bersifat Final."
    ],
    "jawaban": 2,
    "pembahasan": "Dalam sektor pertambangan umum (Minerba), iuran tetap (landrent) dan royalti produksi (iuran produksi) yang dibayarkan kepada pemerintah merupakan Penerimaan Negara Bukan Pajak (PNBP) yang secara perpajakan diakui sebagai biaya operasional yang dapat dikurangkan (deductible) dari penghasilan bruto dalam menghitung PKP PPh Badan.",
    "dasar": "Pasal 6 ayat (1) huruf a UU PPh jo. Peraturan Pemerintah terkait perpajakan Minerba."
  },
  {
    "id": 27,
    "kategori": "pph-potput",
    "skenario": "PT Emas Nusantara membayar deviden kepada Tuan Haryo (WP OP Dalam Negeri) senilai Rp 150.000.000 pada tahun 2024. Tuan Haryo tidak menginvestasikan kembali deviden tersebut.",
    "soal": "Bagaimanakah perlakuan PPh atas deviden yang diterima Tuan Haryo tersebut?",
    "opsi": [
      "A. Dipotong PPh Pasal 23 sebesar 15% oleh PT Emas Nusantara.",
      "B. Tuan Haryo wajib menyetor sendiri PPh Final Pasal 4 ayat (2) dengan tarif 10% (Rp 15.000.000) paling lambat tanggal 15 bulan berikutnya.",
      "C. Dikecualikan dari objek pajak secara otomatis tanpa syarat apa pun.",
      "D. Dipotong PPh Pasal 21 sebesar 5%."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan UU HPP dan PP-55/2022, deviden yang diterima oleh Wajib Pajak Orang Pribadi dalam negeri dikecualikan dari objek PPh dengan syarat diinvestasikan kembali di wilayah NKRI dalam jangka waktu tertentu. Apabila tidak diinvestasikan kembali, deviden tersebut dikenai PPh Final sebesar 10% yang wajib disetor sendiri oleh Wajib Pajak penerima (self-assessment), bukan dipotong oleh pembayar deviden.",
    "dasar": "Pasal 4 ayat (3) huruf f UU PPh sttd UU HPP jo. PP 55/2022."
  },
  {
    "id": 28,
    "kategori": "ppn",
    "skenario": "PT Tambang Batubara (PKP) menyerahkan batubara senilai Rp 5.000.000.000 kepada PT PLN (Persero) untuk kebutuhan pembangkit listrik pada tahun 2024.",
    "soal": "Bagaimanakah aspek PPN atas penyerahan batubara tersebut setelah berlakunya UU HPP?",
    "opsi": [
      "A. Dibebaskan dari pengenaan PPN.",
      "B. Bukan merupakan Barang Kena Pajak, sehingga tidak terutang PPN.",
      "C. Terutang PPN sebesar 11% dan dipungut oleh PT PLN selaku Pemungut PPN BUMN.",
      "D. Terutang PPN dengan besaran tertentu 1,1%."
    ],
    "jawaban": 2,
    "pembahasan": "Sebelum berlakunya UU HPP, batubara yang belum diolah merupakan non-BKP. Namun, setelah berlakunya UU HPP, batubara dikeluarkan dari daftar non-BKP, sehingga berstatus sebagai Barang Kena Pajak (BKP). Penyerahan batubara kepada BUMN (PT PLN) terutang PPN 11% dan PPN tersebut wajib dipungut oleh PLN selaku Pemungut PPN BUMN.",
    "dasar": "Pasal 4A ayat (2) huruf a UU PPN sttd UU HPP jo. PMK-8/PMK.03/2021."
  },
  {
    "id": 29,
    "kategori": "pph-badan",
    "skenario": "PT Kaltim Coal memiliki kewajiban melakukan reklamasi lahan bekas tambang setelah masa operasi selesai. Pada tahun 2024, perusahaan menempatkan dana jaminan reklamasi pada Bank Pemerintah sebesar Rp 2.000.000.000.",
    "soal": "Apakah biaya pembentukan atau pemupukan dana cadangan jaminan reklamasi tersebut dapat dikurangkan dari penghasilan bruto PT Kaltim Coal pada tahun 2024?",
    "opsi": [
      "A. Tidak dapat dikurangkan (non-deductible) karena merupakan pembentukan dana cadangan.",
      "B. Dapat dikurangkan (deductible) sepanjang dana tersebut ditempatkan pada rekening bersama (joint account) atau escrow account di bank pemerintah sesuai ketentuan.",
      "C. Hanya dapat dikurangkan sebesar 50% dari nilai penempatan.",
      "D. Baru dapat dikurangkan saat kegiatan reklamasi fisik benar-benar selesai dilakukan."
    ],
    "jawaban": 1,
    "pembahasan": "Secara umum pembentukan dana cadangan non-deductible. Namun, terdapat pengecualian untuk cadangan biaya reklamasi dan pascatambang bagi usaha pertambangan. Biaya pemupukan cadangan tersebut dapat dikurangkan (deductible) dengan syarat dana tersebut nyata-nyata ditempatkan pada rekening penampung jaminan di bank pemerintah sesuai regulasi ESDM.",
    "dasar": "Pasal 9 ayat (1) huruf d UU PPh jo. PMK-60/PMK.03/2022."
  },
  {
    "id": 30,
    "kategori": "pph-potput",
    "skenario": "Tuan Gunadi adalah Direktur Utama PT Energi Mulia (memiliki saham 5%). Perusahaan memberikan fasilitas keanggotaan klub golf eksklusif senilai Rp 80.000.000 per tahun kepada Tuan Gunadi sebagai tunjangan kenikmatan.",
    "soal": "Bagaimanakah perlakuan PPh atas biaya fasilitas olahraga golf tersebut bagi perusahaan dan bagi Tuan Gunadi berdasarkan PMK-66/2023?",
    "opsi": [
      "A. Bagi perusahaan deductible 100% dan bagi Tuan Gunadi non-objek PPh.",
      "B. Bagi perusahaan non-deductible dan bagi Tuan Gunadi non-objek PPh.",
      "C. Bagi perusahaan deductible 100% dan bagi Tuan Gunadi merupakan objek PPh 21 (kenikmatan yang tidak dikecualikan).",
      "D. Bagi perusahaan hanya boleh dibiayakan 50%."
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan PMK-66/PMK.03/2023, biaya fasilitas olahraga yang disediakan pemberi kerja dapat dikurangkan dari penghasilan bruto (deductible) 100% bagi pemberi kerja. Namun di sisi pegawai, fasilitas olahraga tertentu seperti golf, pacuan kuda, balap mobil, terbang layang, dan olahraga dirgantara tidak termasuk dalam olahraga yang dikecualikan dari objek pajak. Sehingga fasilitas golf ini wajib digabungkan sebagai penghasilan bruto objek PPh 21 bagi Tuan Gunadi.",
    "dasar": "Pasal 2 dan Pasal 4 PMK-66/PMK.03/2023."
  },
  {
    "id": 31,
    "kategori": "ppn",
    "skenario": "PT Tambang Emas Prima (PKP) mengekspor konsentrat emas senilai Rp 20.000.000.000 ke Jepang.",
    "soal": "Berapakah PPN yang dikenakan atas kegiatan ekspor hasil tambang tersebut?",
    "opsi": [
      "A. Terutang PPN dengan tarif 11%.",
      "B. Bebas PPN karena merupakan komoditas ekspor strategis.",
      "C. Terutang PPN dengan tarif 0%.",
      "D. Tidak dikenai PPN karena emas bukan merupakan objek PPN."
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan UU PPN, ekspor Barang Kena Pajak Berwujud oleh PKP dikenai PPN dengan tarif 0% (Nol Persen). Konsentrat emas merupakan Barang Kena Pajak berwujud, sehingga ekspornya dikenakan tarif 0%.",
    "dasar": "Pasal 7 ayat (1) huruf c UU PPN."
  },
  {
    "id": 32,
    "kategori": "pph-badan",
    "skenario": "PT Migas Nusantara membagi participating interest (PI) sebesar 10% di blok minyak bumi kepada PT Daerah Maju (BUMD). Pengalihan PI 10% tersebut merupakan penawaran wajib (mandatory offer) sesuai regulasi ESDM.",
    "soal": "Berapakah tarif PPh Final yang terutang atas pengalihan participating interest (PI) tersebut berdasarkan ketentuan perpajakan hulu migas?",
    "opsi": [
      "A. PPh Final 5% dari jumlah bruto nilai pengalihan.",
      "B. PPh Final 0% karena dialihkan kepada BUMD sebagai mandatory offer.",
      "C. PPh Final 7% dari jumlah bruto nilai pengalihan.",
      "D. Dikenai PPh Badan tarif umum 22%."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan PP-27/2017 jo. PP-79/2010 hulu migas, pengalihan participating interest (PI) dikenai PPh Final 5% atau 7%. Namun, dikecualikan dari pengenaan PPh Final (tarif 0%) atas pengalihan PI dalam rangka penawaran wajib (mandatory offer) 10% kepada Badan Usaha Milik Daerah (BUMD) atau perusahaan nasional yang ditunjuk pemerintah daerah.",
    "dasar": "PP Nomor 27 Tahun 2017 hulu migas."
  },
  {
    "id": 33,
    "kategori": "pph-potput",
    "skenario": "PT Tambang Batubara (pemegang IUP) menjual batubara senilai Rp 10.000.000.000 kepada PT Semen Indonesia (Persero) Tbk (BUMN).",
    "soal": "Berapakah PPh Pasal 22 yang wajib dipungut oleh PT Semen Indonesia atas pembelian batubara tersebut?",
    "opsi": [
      "A. Rp 150.000.000 (1,5%)",
      "B. Rp 25.000.000 (0,25%)",
      "C. Rp 100.000.000 (1%)",
      "D. Rp 0 (Bebas PPh 22)"
    ],
    "jawaban": 0,
    "pembahasan": "Berdasarkan PMK-34/PMK.010/2017 jo PMK-41/2022, badan usaha milik negara (BUMN) wajib memungut PPh Pasal 22 sebesar 1,5% dari harga pembelian atas pembelian barang oleh BUMN dari rekanan (termasuk pembelian komoditas tambang batubara).<br>PPh 22 = 1,5% x Rp 10.000.000.000 = Rp 150.000.000.",
    "dasar": "PMK-34/PMK.010/2017 sttd PMK-41/PMK.010/2022."
  },
  {
    "id": 34,
    "kategori": "pph-op",
    "skenario": "Tuan Wijaya memperoleh Penghasilan Kena Pajak (PKP) sebesar Rp 6.000.000.000 pada tahun pajak 2024 dari hasil investasi dan kegiatan usaha.",
    "soal": "Berapakah tarif PPh Pasal 17 tertinggi (lapisan tarif teratas) yang dikenakan atas Penghasilan Kena Pajak Tuan Wijaya tersebut sesuai ketentuan UU HPP?",
    "opsi": [
      "A. 30%",
      "B. 35%",
      "C. 22%",
      "D. 40%"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan UU HPP, lapisan tarif PPh Orang Pribadi diubah dengan menambahkan satu lapisan baru untuk PKP di atas Rp 5 Miliar setahun dengan tarif sebesar 35%. Karena PKP Tuan Wijaya Rp 6 Miliar (di atas Rp 5 M), maka lapisan teratas penghasilannya dikenai tarif 35%.",
    "dasar": "Pasal 17 ayat (1) huruf a UU PPh sttd UU HPP."
  },
  {
    "id": 35,
    "kategori": "pph-badan",
    "skenario": "PT Explorindo Migas mengeluarkan biaya eksplorasi sebesar Rp 1.500.000.000.000 selama 4 tahun fase eksplorasi. Setelah dilakukan pengeboran, sumur eksplorasi dinyatakan kering (dry hole) dan tidak layak secara ekonomis.",
    "soal": "Bagaimanakah perlakuan pembebanan secara fiskal atas biaya eksplorasi yang tidak berhasil (dry hole) tersebut?",
    "opsi": [
      "A. Biaya tersebut non-deductible karena tidak menghasilkan pendapatan operasional.",
      "B. Wajib dikapitalisasi dan diamortisasi selama 20 tahun.",
      "C. Diakui sebagai kerugian dan dapat dibebankan sekaligus pada tahun terjadinya kepastian dry hole.",
      "D. Dikompensasikan dengan laba blok migas lain milik induk usaha di luar blok bersangkutan."
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan PP-79/2010 hulu migas, biaya eksplorasi yang tidak menghasilkan cadangan ekonomis (dry hole) diperlakukan sebagai kerugian dan dapat dibebankan secara langsung pada tahun tersebut, tidak diamortisasi secara berkala.",
    "dasar": "PP Nomor 79 Tahun 2010."
  },
  {
    "id": 36,
    "kategori": "pph-potput",
    "skenario": "Perusahaan memberikan fasilitas pengobatan/kesehatan di rumah sakit umum senilai Rp 20.000.000 kepada Tuan Budi (pegawai) sehubungan dengan kecelakaan kerja yang dialaminya.",
    "soal": "Apakah aspek PPh 21 bagi Tuan Budi atas fasilitas pengobatan tersebut berdasarkan PMK-66/2023?",
    "opsi": [
      "A. Merupakan objek PPh 21 kena pajak.",
      "B. Dikecualikan dari objek PPh 21 tanpa batasan nilai tertentu sehubungan dengan kecelakaan kerja/kesehatan.",
      "C. Merupakan objek PPh 21 hanya untuk nilai di atas Rp 3.000.000.",
      "D. Dikenai PPh Final 10%."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan PMK-66/PMK.03/2023, pelayanan kesehatan dan/atau pengobatan dari pemberi kerja sehubungan dengan penanganan kecelakaan kerja, penyakit akibat kerja, kedaruratan penyelamatan jiwa, atau pengobatan lanjutan sehubungan kecelakaan/penyakit kerja dikecualikan dari objek PPh 21 tanpa batasan nilai tertentu.",
    "dasar": "Pasal 5 PMK-66/PMK.03/2023."
  },
  {
    "id": 37,
    "kategori": "ppn",
    "skenario": "Berdasarkan UU HPP, tarif PPN dinaikkan secara bertahap dari 10% menjadi 11% dan kemudian menjadi 12%.",
    "soal": "Kapan tarif PPN 12% dijadwalkan mulai berlaku berdasarkan ketentuan UU HPP tersebut?",
    "opsi": [
      "A. Paling lambat 1 Januari 2024",
      "B. Paling lambat 1 Januari 2025",
      "C. Paling lambat 1 Januari 2026",
      "D. Tergantung Keputusan Presiden"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan UU HPP, tarif PPN naik menjadi 11% mulai 1 April 2022, dan dijadwalkan naik menjadi 12% paling lambat pada tanggal 1 Januari 2025.",
    "dasar": "Pasal 7 ayat (1) huruf b UU PPN sttd UU HPP."
  },
  {
    "id": 38,
    "kategori": "pph-badan",
    "skenario": "PT Tambang Makmur (pemegang IUPK) memiliki kewajiban menyetor PNBP berupa bagian pemerintah pusat sebesar 4% dan bagian pemerintah daerah sebesar 6% dari keuntungan bersih tambang batubara sesuai UU Minerba.",
    "soal": "Apakah kewajiban PNBP bagian pemerintah 10% dari laba bersih tersebut dapat dikurangkan sebagai biaya operasional (deductible) dalam SPT PPh Badan?",
    "opsi": [
      "A. Ya, keduanya dapat dikurangkan penuh.",
      "B. Tidak dapat dikurangkan (non-deductible) karena dihitung dari keuntungan bersih setelah PPh.",
      "C. Hanya bagian pemerintah daerah (6%) yang dapat dikurangkan.",
      "D. Keduanya non-deductible karena merupakan pungutan daerah."
    ],
    "jawaban": 1,
    "pembahasan": "Pungutan bagian pemerintah pusat (4%) dan pemerintah daerah (6%) dari keuntungan bersih pertambangan sesuai UU Minerba didasarkan pada keuntungan setelah dikurangi biaya-biaya operasional (net profit), sehingga pungutan ini secara perpajakan bersifat non-deductible (tidak dapat dikurangkan untuk menghitung PPh).",
    "dasar": "Pasal 9 ayat (1) UU PPh jo. Aturan khusus Minerba."
  },
  {
    "id": 39,
    "kategori": "kup",
    "skenario": "DJP melakukan pemeriksaan pajak atas SPT Tahunan PPh Badan PT Sumber Energi. Pemeriksa menerbitkan SPHP, namun Wajib Pajak menolak menandatangani berita acara pembahasan akhir karena tidak menyetujui koreksi pemeriksa.",
    "soal": "Apakah konsekuensi hukum dari penolakan penandatanganan berita acara tersebut?",
    "opsi": [
      "A. Pemeriksaan dibatalkan secara hukum.",
      "B. KPP langsung menerbitkan SKPKB secara jabatan tanpa pembahasan akhir.",
      "C. Pemeriksa membuat berita acara penolakan, dan proses penerbitan surat ketetapan pajak tetap berjalan menggunakan data hasil pemeriksaan.",
      "D. WP wajib membayar denda Rp 10.000.000."
    ],
    "jawaban": 2,
    "pembahasan": "Apabila Wajib Pajak menolak menandatangani berita acara pembahasan akhir hasil pemeriksaan, pemeriksa membuat Berita Acara Penolakan. Ketetapan pajak (SKP) akan tetap diterbitkan secara sah berdasarkan hasil pemeriksaan yang ada.",
    "dasar": "UU KUP jo. PMK-17/PMK.03/2013 tentang Tata Cara Pemeriksaan Pajak."
  },
  {
    "id": 40,
    "kategori": "pph-potput",
    "skenario": "PT Pertambangan Rakyat membayar fee jasa teknik atas optimasi sumur bor kepada Tuan Rian (WP OP ber-NPWP) sebesar Rp 50.000.000.",
    "soal": "Berapakah PPh Pasal 21 yang harus dipotong oleh PT Pertambangan Rakyat atas imbalan jasa tersebut?",
    "opsi": [
      "A. Rp 250.000 (0,5%)",
      "B. Rp 1.250.000 (2.5% efektif)",
      "C. Rp 7.500.000 (15%)",
      "D. Rp 1.000.000 (2%)"
    ],
    "jawaban": 1,
    "pembahasan": "Imbalan jasa kepada bukan pegawai yang tidak berkesinambungan dikenai PPh 21 dengan DPP sebesar 50% dari bruto. Tarif Pasal 17 terendah = 5%.<br>PPh 21 = 5% x (50% x Rp 50.000.000) = 5% x Rp 25.000.000 = Rp 1.250.000.",
    "dasar": "PER-16/PJ/2016."
  },
  {
    "id": 41,
    "kategori": "pph-badan",
    "skenario": "PT Tambang Prima menyewa helikopter untuk sarana evakuasi darurat karyawan di lokasi tambang pedalaman Papua yang terisolir.",
    "soal": "Apakah biaya sewa helikopter operasional evakuasi darurat tersebut dapat dibiayakan secara fiskal (deductible)?",
    "opsi": [
      "A. Non-deductible karena merupakan fasilitas rekreasi/kemewahan.",
      "B. Deductible 100% sebagai biaya keselamatan kerja dan sarana transportasi di daerah tertentu/terpencil.",
      "C. Hanya boleh dibiayakan 50%.",
      "D. Baru dapat dikurangkan jika disetujui instansi pabean."
    ],
    "jawaban": 1,
    "pembahasan": "Biaya sarana transportasi dan fasilitas penyelamatan kerja bagi karyawan di lokasi kerja/daerah terpencil yang terisolir dikategorikan sebagai sarana kerja operasional yang bersifat deductible (dapat dikurangkan penuh 100%) berdasarkan ketentuan natura/kenikmatan daerah tertentu.",
    "dasar": "Pasal 6 UU PPh jo. PMK-66/PMK.03/2023."
  },
  {
    "id": 42,
    "kategori": "ppn",
    "skenario": "Berdasarkan UU HPP, pemerintah memberikan pembebasan PPN atas penyerahan barang-barang kebutuhan pokok yang sangat dibutuhkan oleh rakyat banyak.",
    "soal": "Manakah kelompok barang berikut yang mendapat fasilitas dibebaskan dari pengenaan PPN sesuai UU HPP?",
    "opsi": [
      "A. Beras, gabah, jagung, sagu, kedelai, garam, daging, telur, susu, buah-buahan, sayur-sayuran",
      "B. Batubara, minyak mentah, gas bumi",
      "C. Kendaraan listrik operasional dinas",
      "D. Pasir, kerikil, batu kali hasil tambang rakyat"
    ],
    "jawaban": 0,
    "pembahasan": "Berdasarkan UU HPP dan PP-49/2022, barang kebutuhan pokok strategis (beras, susu, telur, sayur, daging, buah, garam, dll) dibebaskan dari pengenaan PPN untuk menjaga daya beli masyarakat.",
    "dasar": "PP Nomor 49 Tahun 2022."
  },
  {
    "id": 43,
    "kategori": "kup",
    "skenario": "Wajib Pajak mengajukan permohonan pembetulan ketetapan pajak (Pasal 16 UU KUP) karena terdapat salah tulis pada Surat Ketetapan Pajak yang diterbitkan KPP.",
    "soal": "Berapakah jangka waktu paling lama bagi DJP untuk memberikan keputusan atas permohonan pembetulan Wajib Pajak tersebut?",
    "opsi": [
      "A. 12 bulan sejak permohonan diterima",
      "B. 6 bulan sejak permohonan diterima",
      "C. 3 bulan sejak permohonan diterima",
      "D. 1 bulan sejak permohonan diterima"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan Pasal 16 ayat (2) UU KUP, Direktur Jenderal Pajak harus memberi keputusan atas permohonan pembetulan yang diajukan Wajib Pajak dalam jangka waktu paling lama 6 bulan sejak tanggal permohonan diterima.",
    "dasar": "Pasal 16 ayat (2) UU KUP."
  },
  {
    "id": 44,
    "kategori": "pph-potput",
    "skenario": "PT Tambang Jaya membayar sewa kapal tongkang pengangkut batubara kepada PT Pelayaran Mandiri (perusahaan pelayaran DN) sebesar Rp 500.000.000.",
    "soal": "Berapakah PPh yang wajib dipotong oleh PT Tambang Jaya atas transaksi tersebut?",
    "opsi": [
      "A. Dipotong PPh Pasal 23 sebesar 2% (Rp 10.000.000)",
      "B. Dipotong PPh Final Pasal 15 pelayaran DN sebesar 1,2% (Rp 6.000.000)",
      "C. Dipotong PPh Final Pasal 4 ayat (2) sebesar 10% (Rp 50.000.000)",
      "D. Tidak dipotong PPh karena merupakan sewa kapal pabean"
    ],
    "jawaban": 1,
    "pembahasan": "Sewa kapal tongkang/charter kapal yang dibayarkan kepada perusahaan pelayaran dalam negeri dikenai PPh Final Pasal 15 sebesar 1,2% dari peredaran bruto, bukan PPh 23 sewa harta biasa.<br>PPh Pasal 15 = 1,2% x Rp 500.000.000 = Rp 6.000.000.",
    "dasar": "KMK-416/KMK.04/1996."
  },
  {
    "id": 45,
    "kategori": "pph-badan",
    "skenario": "PT Borneo Coal memiliki blok tambang batubara baru. Selama 3 tahun pertama konstruksi infrastruktur pertambangan, perusahaan belum memperoleh omzet komersial namun telah mengeluarkan biaya operasional administrasi Rp 15.000.000.000.",
    "soal": "Bagaimanakah perlakuan biaya operasional administrasi pra-operasi pertambangan tersebut secara fiskal?",
    "opsi": [
      "A. Dibebankan sekaligus sebagai biaya operasional pada tahun pengeluaran.",
      "B. Dikapitalisasi dan diamortisasi mulai dari bulan dilakukannya produksi komersial (fase komersial).",
      "C. Dihapus secara jabatan karena merupakan kerugian fiskal.",
      "D. Tidak boleh dikurangkan sama sekali (non-deductible)."
    ],
    "jawaban": 1,
    "pembahasan": "Biaya-biaya pra-operasi atau sebelum produksi komersial (seperti biaya administrasi pembangunan blok) dikapitalisasi dan diamortisasi secara fiskal menggunakan tarif amortisasi kelompok harta tak berwujud, dimulai sejak bulan produksi komersial.",
    "dasar": "Pasal 11A ayat (1a) UU PPh."
  },
  {
    "id": 46,
    "kategori": "ppn",
    "skenario": "PT Inti Tambang (PKP) menyerahkan emas batangan (bukan perhiasan) senilai Rp 1.500.000.000 kepada nasabah investasi logam mulia.",
    "soal": "Apakah aspek PPN atas penyerahan emas batangan tersebut berdasarkan UU HPP?",
    "opsi": [
      "A. Dipungut PPN sebesar 11% dari harga jual.",
      "B. Dibebaskan dari pengenaan PPN sesuai ketentuan UU HPP.",
      "C. Terutang PPN dengan besaran tertentu 1,1%.",
      "D. Bukan merupakan Barang Kena Pajak."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan UU HPP dan PP-49/2022, emas batangan merupakan Barang Kena Pajak Tertentu yang bersifat strategis yang atas penyerahannya dibebaskan dari pengenaan PPN (fasilitas PPN Dibebaskan) untuk mendukung pasar investasi emas domestik.",
    "dasar": "PP Nomor 49 Tahun 2022."
  },
  {
    "id": 47,
    "kategori": "kup",
    "skenario": "Wajib Pajak mengajukan permohonan pembatalan ketetapan pajak hasil pemeriksaan yang tidak sah karena pemeriksa tidak menyampaikan SPHP atau tidak melakukan pembahasan akhir hasil pemeriksaan (Pasal 36 ayat (1) huruf d).",
    "soal": "Apakah akibat hukum terhadap Surat Ketetapan Pajak (SKP) jika terbukti pemeriksa melanggar prosedur wajib tersebut?",
    "opsi": [
      "A. SKP tetap sah, namun pemeriksa diberikan sanksi kode etik",
      "B. SKP dibatalkan secara hukum demi keadilan dan keabsahan prosedur",
      "C. SKP diturunkan nilainya sebesar 50%",
      "D. Menunggu sidang pengadilan"
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan Pasal 36 ayat (1) huruf d UU KUP, DJP berwenang membatalkan surat ketetapan pajak hasil pemeriksaan yang dilaksanakan tanpa: penyampaian Surat Pemberitahuan Hasil Pemeriksaan (SPHP), atau pembahasan akhir hasil pemeriksaan (closing conference) dengan Wajib Pajak. Ketetapan tersebut dibatalkan demi hukum.",
    "dasar": "Pasal 36 ayat (1) huruf d UU KUP."
  },
  {
    "id": 48,
    "kategori": "pph-potput",
    "skenario": "PT Pertambangan Emas membayar premi asuransi kebakaran gedung kantor ke PT Asuransi Allianz (Luar Negeri) melalui agen di Jakarta sebesar Rp 100.000.000.",
    "soal": "Berapakah PPh Pasal 26 yang wajib dipotong oleh PT Pertambangan Emas atas pembayaran premi asuransi ke perusahaan asuransi luar negeri tersebut?",
    "opsi": [
      "A. Rp 20.000.000 (20% dari premi bruto)",
      "B. Rp 10.000.000 (10% dari premi bruto)",
      "C. Rp 2.000.000 (2% efektif dari premi bruto)",
      "D. Rp 0 (Bebas pajak luar negeri)"
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan KMK-501/KMK.04/1998, PPh Pasal 26 atas premi asuransi yang dibayarkan kepada perusahaan asuransi luar negeri oleh tertanggung di Indonesia adalah sebesar 20% x Perkiraan Neto (10% dari premi bruto), sehingga tarif efektifnya adalah 2% dari premi bruto.<br>PPh 26 = 2% x Rp 100.000.000 = Rp 2.000.000.",
    "dasar": "KMK Nomor 501/KMK.04/1998."
  },
  {
    "id": 49,
    "kategori": "pph-badan",
    "skenario": "PT Tambang Bumi melakukan amortisasi atas hak penambangan batubara (Kelompok 3) yang diperoleh senilai Rp 8.000.000.000 menggunakan metode saldo menurun.",
    "soal": "Berapakah tarif amortisasi saldo menurun tahun pertama yang harus diterapkan PT Tambang Bumi atas hak penambangan batubara Kelompok 3 tersebut?",
    "opsi": [
      "A. 12,5%",
      "B. 25%",
      "C. 50%",
      "D. 10%"
    ],
    "jawaban": 1,
    "pembahasan": "Amortisasi atas harta tak berwujud Kelompok 3 (masa manfaat 16 tahun) jika menggunakan metode saldo menurun menggunakan tarif sebesar 25% (dua kali tarif metode garis lurus yang sebesar 6,25%).",
    "dasar": "Pasal 11A ayat (1) UU PPh."
  },
  {
    "id": 50,
    "kategori": "ppn",
    "skenario": "PT Semesta Mineral (non-PKP, omzet usaha Rp 2.000.000.000) membeli truk dump operasional tambang dari PT Otomotif Jaya (PKP) seharga Rp 440.000.000 (termasuk PPN 10%).",
    "soal": "Bagaimanakah PT Semesta Mineral memperlakukan PPN Masukan sebesar Rp 40.000.000 yang dibayarnya atas pembelian truk operasional tersebut?",
    "opsi": [
      "A. Meminta restitusi tunai ke Kantor Pajak",
      "B. Kapitalisasi ke dalam harga perolehan truk dan disusutkan bersama sebagai satu kesatuan aktiva",
      "C. Mengajukan Faktur Pajak Masukan ke KPP",
      "D. Dihapus sebagai beban kompensasi"
    ],
    "jawaban": 1,
    "pembahasan": "Bagi Wajib Pajak non-PKP, PPN Masukan yang dibayar tidak dapat dikreditkan. PPN Masukan tersebut menjadi bagian dari harga perolehan barang (truk dump) yang disusutkan selama masa manfaat aktiva.",
    "dasar": "Pasal 9 ayat (8) UU PPN jo. Pasal 6 UU PPh."
  },
  {
    "id": 51,
    "kategori": "kup",
    "skenario": "Tuan Anton mengajukan permohonan pendaftaran NPWP secara online pada tanggal 10 Maret 2024.",
    "soal": "Berapakah jangka waktu paling lama bagi Kantor Pelayanan Pajak untuk menerbitkan kartu NPWP setelah berkas diterima lengkap?",
    "opsi": [
      "A. 1 hari kerja",
      "B. 7 hari kerja",
      "C. 14 hari kerja",
      "D. 1 bulan"
    ],
    "jawaban": 0,
    "pembahasan": "Berdasarkan peraturan administrasi perpajakan DJP, penerbitan kartu NPWP secara online diterbitkan dalam jangka waktu paling lambat 1 hari kerja setelah berkas permohonan diterima secara lengkap.",
    "dasar": "Peraturan Direktur Jenderal Pajak terkait pendaftaran NPWP."
  },
  {
    "id": 52,
    "kategori": "pph-potput",
    "skenario": "PT Tambang Prima menyewa gudang penyimpanan batubara dari Tuan Rudi (WP OP DN non-PKP) senilai Rp 100.000.000.",
    "soal": "Berapakah PPh yang wajib dipotong oleh PT Tambang Prima atas transaksi tersebut?",
    "opsi": [
      "A. Dipotong PPh Pasal 23 sebesar Rp 2.000.000",
      "B. Dipotong PPh Final Pasal 4 ayat (2) sebesar Rp 10.000.000",
      "C. Dipotong PPh Pasal 21 sebesar Rp 5.000.000",
      "D. Tidak dipotong karena Tuan Rudi non-PKP"
    ],
    "jawaban": 1,
    "pembahasan": "Sewa bangunan (gudang) merupakan objek PPh Final Pasal 4 ayat (2) sebesar 10% dari jumlah bruto persewaan, tidak dipengaruhi oleh status PKP atau non-PKP dari pihak yang menyewakan.<br>PPh Final = 10% x Rp 100.000.000 = Rp 10.000.000.",
    "dasar": "PP Nomor 34 Tahun 2016."
  },
  {
    "id": 53,
    "kategori": "pph-badan",
    "skenario": "PT Tambang Abadi memberikan tunjangan dalam bentuk perumahan (mess karyawan) di tengah hutan rimba lokasi pertambangan terpencil senilai Rp 300.000.000 per tahun.",
    "soal": "Apakah biaya fasilitas perumahan (mess) di lokasi tambang terpencil tersebut merupakan objek PPh 21 bagi karyawan yang menempatinya sesuai PMK-66/2023?",
    "opsi": [
      "A. Ya, merupakan objek PPh 21 kena pajak.",
      "B. Dikecualikan dari objek PPh 21 karena merupakan sarana perumahan di daerah tertentu/terpencil sehubungan dengan pekerjaan.",
      "C. Hanya dikecualikan untuk nilai di bawah Rp 50.000.000.",
      "D. Karyawan wajib membayar pajak sewa 10%."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan PMK-66/PMK.03/2023, fasilitas sarana tempat tinggal berupa perumahan (termasuk mess) yang disediakan pemberi kerja bagi pegawai di daerah tertentu/daerah terpencil dikecualikan dari objek PPh 21 bagi penerima.",
    "dasar": "Pasal 5 PMK-66/PMK.03/2023."
  },
  {
    "id": 54,
    "kategori": "ppn",
    "skenario": "PT Metalurgi Perkasa (PKP) mengekspor emas perhiasan senilai Rp 10.000.000.000 ke Dubai.",
    "soal": "Berapakah PPN yang terutang atas ekspor emas perhiasan tersebut?",
    "opsi": [
      "A. 11% dari Nilai Ekspor",
      "B. 12% dari Nilai Ekspor",
      "C. 0% dari Nilai Ekspor",
      "D. Dibebaskan dari PPN"
    ],
    "jawaban": 2,
    "pembahasan": "Kegiatan ekspor Barang Kena Pajak Berwujud (termasuk emas perhiasan hasil pabrikan) dikenai tarif PPN sebesar 0%.",
    "dasar": "Pasal 7 ayat (1) huruf c UU PPN."
  },
  {
    "id": 55,
    "kategori": "kup",
    "skenario": "PT Maju Jaya didirikan pada tahun 2018. Pemeriksa Pajak melakukan pemeriksaan atas Tahun Pajak 2019 pada tahun 2026 karena ditemukan data manipulasi pajak pidana.",
    "soal": "Apakah tindakan penetapan pajak setelah 5 tahun daluwarsa tersebut dimungkinkan secara hukum?",
    "opsi": [
      "A. Tidak dimungkinkan karena batas daluwarsa mutlak 5 tahun.",
      "B. Dimungkinkan setelah 5 tahun jika Wajib Pajak melakukan tindak pidana di bidang perpajakan berdasarkan putusan pengadilan yang berkekuatan hukum tetap.",
      "C. Hanya dimungkinkan jika WP menyetujuinya.",
      "D. Dimungkinkan tanpa batas waktu khusus."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan Pasal 13 ayat (5) UU KUP, surat ketetapan pajak tetap dapat diterbitkan setelah lampau jangka waktu 5 tahun dalam hal Wajib Pajak setelah jangka waktu tersebut dipidana karena melakukan tindak pidana di bidang perpajakan berdasarkan putusan pengadilan yang telah memperoleh kekuatan hukum tetap.",
    "dasar": "Pasal 13 ayat (5) UU KUP."
  },
  {
    "id": 56,
    "kategori": "pph-potput",
    "skenario": "PT Tambang Emas membayar deviden kepada pemegang sahamnya, PT Tambang Utama (Badan DN dengan kepemilikan 30%), sebesar Rp 2.000.000.000.",
    "soal": "Berapakah PPh Pasal 23 yang wajib dipotong oleh PT Tambang Emas atas pembagian deviden kepada PT Tambang Utama tersebut?",
    "opsi": [
      "A. Rp 300.000.000 (15%)",
      "B. Rp 200.000.000 (10%)",
      "C. Rp 0 (Dikecualikan dari objek pajak)",
      "D. Rp 40.000.000 (2%)"
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan UU HPP, deviden yang berasal dari dalam negeri yang diterima atau diperoleh Wajib Pajak Badan dalam negeri dikecualikan dari objek Pajak Penghasilan (non-objek) tanpa syarat persentase kepemilikan minimal dan tanpa syarat investasi kembali.",
    "dasar": "Pasal 4 ayat (3) huruf f UU PPh sttd UU HPP."
  },
  {
    "id": 57,
    "kategori": "ppn",
    "skenario": "PT Semesta Alam (PKP) membagikan hasil bumi berupa sayuran segar cuma-cuma senilai Rp 10.000.000 (harga pokok) kepada warga sekitar tambang.",
    "soal": "Apakah aspek PPN atas penyerahan cuma-cuma sayuran segar tersebut?",
    "opsi": [
      "A. Terutang PPN 11% dari harga pokok.",
      "B. Mendapat fasilitas PPN Dibebaskan sesuai dengan ketentuan UU PPN atas barang kebutuhan pokok strategis.",
      "C. Dikenakan PPN dengan besaran tertentu 1,1%.",
      "D. Bukan merupakan Barang Kena Pajak."
    ],
    "jawaban": 1,
    "pembahasan": "Sayuran segar dikategorikan sebagai barang kebutuhan pokok strategis yang dibebaskan dari pengenaan PPN, sehingga penyerahan cuma-cuma atas sayuran segar tersebut juga mendapat fasilitas PPN Dibebaskan.",
    "dasar": "PP Nomor 49 Tahun 2022."
  },
  {
    "id": 58,
    "kategori": "kup",
    "skenario": "PT Bahtera Energi terlambat membayar angsuran PPh Pasal 25 untuk Masa Pajak Juni 2024 sebesar Rp 50.000.000 selama 3 bulan.",
    "soal": "Bagaimanakah KPP menagih keterlambatan tersebut beserta sanksinya?",
    "opsi": [
      "A. Menerbitkan Surat Teguran langsung",
      "B. Menerbitkan Surat Tagihan Pajak (STP) untuk menagih kurang bayar beserta sanksi bunga per bulan sebesar (Suku Bunga Acuan + 5%) / 12",
      "C. Menerbitkan Surat Paksa",
      "D. Menunggu laporan SPT Tahunan"
    ],
    "jawaban": 1,
    "pembahasan": "Kekurangan angsuran PPh Pasal 25 beserta sanksi keterlambatan ditagih menggunakan Surat Tagihan Pajak (STP). Sanksi bunga dihitung berdasarkan suku bunga acuan ditambah mark-up 5% dibagi 12 per bulan.",
    "dasar": "Pasal 14 ayat (1) huruf a UU KUP."
  },
  {
    "id": 59,
    "kategori": "pph-badan",
    "skenario": "PT Tambang Persada memberikan fasilitas laptop kerja seharga Rp 15.000.000 kepada Tuan Budi (pegawai) untuk menunjang tugas audit lapangan.",
    "soal": "Apakah fasilitas laptop tersebut merupakan objek PPh 21 bagi Tuan Budi sehubungan dengan ketentuan natura/kenikmatan di UU HPP?",
    "opsi": [
      "A. Ya, merupakan objek PPh 21 kena pajak.",
      "B. Dikecualikan dari objek PPh 21 karena merupakan peralatan kerja yang disediakan pemberi kerja untuk pelaksanaan pekerjaan.",
      "C. Hanya dikecualikan untuk nilai di bawah Rp 5.000.000.",
      "D. Dikenakan PPh Final 5%."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan PMK-66/PMK.03/2023, peralatan dan fasilitas kerja (seperti laptop, komputer, telepon seluler, beserta sarana penunjangnya) yang diberikan oleh pemberi kerja kepada pegawai untuk menunjang tugas pekerjaan dikecualikan dari objek PPh bagi penerima.",
    "dasar": "Pasal 5 PMK-66/PMK.03/2023."
  },
  {
    "id": 60,
    "kategori": "ppn",
    "skenario": "PT Mineral Prima (PKP) menyerahkan konsentrat tembaga senilai Rp 3.000.000.000 kepada PT Smelter Nusantara (PKP) di dalam negeri.",
    "soal": "Berapakah PPN yang wajib dipungut oleh PT Mineral Prima atas penyerahan tersebut?",
    "opsi": [
      "A. Rp 330.000.000 (11%)",
      "B. Rp 30.000.000 (1%)",
      "C. Rp 0 (Bukan objek PPN)",
      "D. Rp 360.000.000 (12%)"
    ],
    "jawaban": 0,
    "pembahasan": "Penyerahan konsentrat tembaga di dalam negeri merupakan penyerahan Barang Kena Pajak berwujud yang terutang PPN dengan tarif umum sebesar 11% dari Dasar Pengenaan Pajak (DPP).<br>PPN = 11% x Rp 3.000.000.000 = Rp 330.000.000.",
    "dasar": "Pasal 7 ayat (1) huruf a UU PPN."
  }
];

// Fungsi utama untuk memproses penggabungan dan pemotongan
function expandPackets() {
  // --- PROSES PAKET 4 ---
  const pathPaket4 = path.join(__dirname, '../src/data/paket/04-Paket-4.json');
  console.log(`Membaca file: ${pathPaket4}...`);
  const data4 = JSON.parse(fs.readFileSync(pathPaket4, 'utf8'));

  // 1. Ambil 25 soal pertama Sesi 1
  const baseSesi1_4 = data4.sesi1.slice(0, 25);
  // Gabungkan dengan 35 soal tambahan baru
  data4.sesi1 = [...baseSesi1_4, ...newSesi1Paket4];
  
  // Pastikan ID sesi1 berurutan 1 sampai 60
  data4.sesi1.forEach((s, idx) => {
    s.id = idx + 1;
  });

  // 2. Potong Sesi 2 hanya menjadi 20 soal pertama
  data4.sesi2 = data4.sesi2.slice(0, 20);
  
  // Pastikan ID sesi2 berurutan 1 sampai 20
  data4.sesi2.forEach((s, idx) => {
    s.id = idx + 1;
  });

  // Update totalSoal
  data4.totalSoal = 80;
  fs.writeFileSync(pathPaket4, JSON.stringify(data4, null, 2), 'utf8');
  console.log('✅ Sukses memperbarui Paket 4 (Sesi 1: 60 soal, Sesi 2: 20 soal, Total: 80 soal)');


  // --- PROSES PAKET 5 ---
  const pathPaket5 = path.join(__dirname, '../src/data/paket/05-Paket-5.json');
  console.log(`\nMembaca file: ${pathPaket5}...`);
  const data5 = JSON.parse(fs.readFileSync(pathPaket5, 'utf8'));

  // 1. Ambil 25 soal pertama Sesi 1
  const baseSesi1_5 = data5.sesi1.slice(0, 25);
  // Gabungkan dengan 35 soal tambahan baru
  data5.sesi1 = [...baseSesi1_5, ...newSesi1Paket5];
  
  // Pastikan ID sesi1 berurutan 1 sampai 60
  data5.sesi1.forEach((s, idx) => {
    s.id = idx + 1;
  });

  // 2. Potong Sesi 2 hanya menjadi 20 soal pertama
  data5.sesi2 = data5.sesi2.slice(0, 20);
  
  // Pastikan ID sesi2 berurutan 1 sampai 20
  data5.sesi2.forEach((s, idx) => {
    s.id = idx + 1;
  });

  // Update totalSoal
  data5.totalSoal = 80;
  fs.writeFileSync(pathPaket5, JSON.stringify(data5, null, 2), 'utf8');
  console.log('✅ Sukses memperbarui Paket 5 (Sesi 1: 60 soal, Sesi 2: 20 soal, Total: 80 soal)');
}

expandPackets();
