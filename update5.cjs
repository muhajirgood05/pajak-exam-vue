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
    "kategori": "pph-op",
    "skenario": "Tuan Budi di-PHK dari perusahaannya pada Desember 2024. Sesuai kesepakatan Bipartit, Tuan Budi menerima Uang Pesangon total sebesar Rp 600.000.000 yang pembayarannya dicicil. Perusahaan membayarkan cicilan pertama Rp 300.000.000 pada Januari 2025, dan cicilan kedua sebesar Rp 300.000.000 pada Februari 2027.",
    "soal": "Bagaimana sifat pengenaan PPh Pasal 21 atas pembayaran cicilan pesangon yang kedua (pada Februari 2027)?",
    "opsi": [
      "A. Dikenakan PPh Final dengan tarif progresif PP 68 Tahun 2009.",
      "B. Dikenakan PPh Tidak Final dan digabungkan dengan penghasilan lain di SPT Tahunan Tuan Budi tahun 2027.",
      "C. Tidak dipotong pajak karena cicilan kedua sudah menjadi haknya sejak 2024.",
      "D. Dikenakan PPh Final dengan tarif efektif rata-rata (TER) sesuai PMK 168/2023."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan PP 68 Tahun 2009 dan PMK 16/PMK.03/2010, uang pesangon yang dibayarkan SEKALIGUS (termasuk jika dibayarkan secara bertahap dalam jangka waktu maksimal 2 tahun takwim) dikenakan PPh Pasal 21 bersifat FINAL. Namun, jika sebagian uang pesangon dibayarkan pada tahun KETIGA (atau lebih) setelah tahun pemutusan hubungan kerja, maka pembayaran di tahun ketiga tersebut dikenakan PPh Pasal 21 TIDAK FINAL (Tarif Pasal 17 ayat 1 huruf a UU PPh). Karena pembayaran kedua dilakukan pada tahun 2027 (sudah lewat 2 tahun dari 2024), maka sifatnya Tidak Final.",
    "dasar": "Pasal 3 PP 68 Tahun 2009 jo. PMK-16/PMK.03/2010 tentang PPh Pasal 21 atas Uang Pesangon."
  },
  {
    "id": lastIdSesi1 + 2,
    "kategori": "kup",
    "skenario": "KPP menerbitkan Surat Ketetapan Pajak Kurang Bayar (SKPKB) kepada PT X pada tanggal 10 April 2019 sebesar Rp 1.500.000.000. Hingga tahun 2024, PT X belum melunasi utang pajak tersebut. Pada tanggal 5 Maret 2024, KPP menerbitkan Surat Paksa (SP) dan memberitahukannya kepada pengurus PT X.",
    "soal": "Bagaimana status hak mendahulu / daluwarsa penagihan pajak atas utang pajak PT X tersebut?",
    "opsi": [
      "A. Hak penagihan pajak telah daluwarsa pada 10 April 2024 (5 tahun sejak SKPKB terbit), Surat Paksa tidak sah.",
      "B. Daluwarsa penagihan pajak tertangguh karena diterbitkannya Surat Paksa pada 5 Maret 2024, sehingga masa daluwarsa bergeser dihitung 5 tahun lagi sejak tanggal Surat Paksa.",
      "C. Daluwarsa penagihan adalah 10 tahun, sehingga masih bisa ditagih sampai tahun 2029.",
      "D. Utang pajak tidak pernah daluwarsa."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan Pasal 22 UU KUP, hak untuk melakukan penagihan pajak DALUWARSA setelah lampau waktu 5 (lima) tahun terhitung sejak tanggal penerbitan Surat Tagihan Pajak, SKPKB, atau SKPKBT. NAMUN, daluwarsa penagihan pajak ini dapat TERTANGGUH (terinterupsi/dimulai lagi dari nol) apabila diterbitkan Surat Paksa, ada pengakuan utang pajak dari WP, diterbitkan SK Pembetulan, dll. Karena KPP menerbitkan Surat Paksa sebelum masa 5 tahun habis (5 Maret 2024), maka argo daluwarsa 5 tahun diulang/tertangguh.",
    "dasar": "Pasal 22 ayat (1) dan ayat (2) Undang-Undang KUP."
  },
  {
    "id": lastIdSesi1 + 3,
    "kategori": "ppn",
    "skenario": "PT Sukses Makmur (PKP) menerbitkan Faktur Pajak Kode 010 atas penjualan barang kepada PT Y pada tanggal 15 Mei 2024 dan telah melaporkannya pada SPT Masa PPN Mei 2024. Pada bulan Agustus 2024, disadari ada kesalahan penulisan kuantitas barang, sehingga PT Sukses Makmur menerbitkan Faktur Pajak Pengganti (Kode 011).",
    "soal": "Pada SPT Masa PPN bulan apa PT Sukses Makmur harus melaporkan Faktur Pajak Pengganti tersebut?",
    "opsi": [
      "A. Melaporkan Faktur Pajak Pengganti pada SPT Masa PPN Agustus 2024 (Masa diterbitkannya faktur pengganti).",
      "B. Melaporkan Faktur Pajak Pengganti pada SPT Masa PPN Mei 2024 dengan melakukan Pembetulan SPT.",
      "C. Boleh memilih antara Masa Mei 2024 atau Agustus 2024.",
      "D. Tidak perlu dilaporkan jika nilai DPP dan PPN tidak berubah."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan Peraturan Dirjen Pajak (PER-03/PJ/2022), Faktur Pajak Pengganti dilaporkan pada Masa Pajak yang SAMA dengan Masa Pajak dilaporkannya Faktur Pajak yang diganti. Karena Faktur Pajak normal dilaporkan pada Masa Mei 2024, maka Faktur Pajak Pengganti yang dibuat di bulan Agustus HARUS dilaporkan di Masa Mei 2024 melalui mekanisme Pembetulan SPT Masa PPN Mei 2024.",
    "dasar": "Pasal 24 ayat (4) PER-03/PJ/2022 tentang Faktur Pajak."
  },
  {
    "id": lastIdSesi1 + 4,
    "kategori": "pph-badan",
    "skenario": "PT Global Niaga melaporkan SPT Tahunan PPh Badan Tahun 2021 dengan status Rugi Fiskal sebesar Rp 5 Miliar. Pada tahun 2023, dilakukan pemeriksaan pajak untuk tahun 2021, dan terbit SKPKB yang menetapkan kerugian fiskalnya dikoreksi menjadi hanya Rugi Fiskal sebesar Rp 2 Miliar.",
    "soal": "Berapakah batas waktu maksimal untuk mengkompensasikan kerugian fiskal sebesar Rp 2 Miliar tersebut berdasarkan UU PPh?",
    "opsi": [
      "A. Maksimal hingga tahun pajak 2026 (5 tahun sejak tahun kerugian 2021).",
      "B. Maksimal hingga tahun pajak 2028 (5 tahun sejak terbitnya SKPKB tahun 2023).",
      "C. Maksimal hingga tahun pajak 2024 (3 tahun masa kompensasi kerugian komersial).",
      "D. Kerugian yang ditetapkan melalui SKPKB tidak dapat dikompensasikan."
    ],
    "jawaban": 0,
    "pembahasan": "Berdasarkan Pasal 6 ayat (2) UU PPh, kerugian fiskal dapat dikompensasikan dengan penghasilan mulai tahun pajak BERIKUTNYA berturut-turut sampai dengan 5 (lima) tahun. Jangka waktu 5 tahun ini dihitung SEJAK TAHUN TERJADINYA KERUGIAN, bukan sejak terbitnya SKPKB. Kerugian terjadi di Tahun Pajak 2021. Jadi masa kompensasinya adalah tahun 2022, 2023, 2024, 2025, dan berakhir di tahun 2026. Hasil koreksi fiskal SKPKB tidak merubah 'start point' argo 5 tahun tersebut.",
    "dasar": "Pasal 6 ayat (2) Undang-Undang Nomor 36 Tahun 2008 std UU HPP (Pajak Penghasilan)."
  },
  {
    "id": lastIdSesi1 + 5,
    "kategori": "potput",
    "skenario": "PT Kertas Cemerlang (industri produsen kertas) menjual produk kertas hasil produksinya kepada CV Agen Maju (distributor) seharga Rp 100.000.000 (belum termasuk PPN).",
    "soal": "Berapakah nilai PPh Pasal 22 yang harus dipungut oleh PT Kertas Cemerlang dan bagaimana sifat pemungutan tersebut bagi CV Agen Maju?",
    "opsi": [
      "A. Rp 100.000 (0,1%) bersifat Tidak Final, dan dapat dikreditkan oleh CV Agen Maju di akhir tahun.",
      "B. Rp 250.000 (0,25%) bersifat Tidak Final.",
      "C. Rp 100.000 (0,1%) bersifat Final.",
      "D. Rp 1.500.000 (1,5%) bersifat Tidak Final."
    ],
    "jawaban": 0,
    "pembahasan": "Berdasarkan PMK 34/PMK.010/2017 std PMK 41/2022, atas penjualan hasil produksi industri Kertas di dalam negeri oleh badan usaha industri kertas dikenakan PPh Pasal 22 sebesar 0,1% dari Dasar Pengenaan Pajak (DPP) PPN. PPh Pasal 22 sebesar 0,1% x Rp 100.000.000 = Rp 100.000. Sifat pungutan PPh Pasal 22 untuk penjualan ini adalah TIDAK FINAL, yang artinya CV Agen Maju dapat mengkreditkan PPh Pasal 22 yang dipungut tersebut pada SPT Tahunan PPh Badannya.",
    "dasar": "Pasal 2 ayat (1) huruf d PMK 34/PMK.010/2017 s.t.d.t.d PMK 41/PMK.010/2022."
  }
];

const newSesi2 = [
  {
    "id": lastIdSesi2 + 1,
    "kategori": "pph-op",
    "skenario": "[STUDI KASUS KOMPREHENSIF: DOKTER \u0026 PENGUSAHA] Dokter Andi adalah seorang dokter spesialis jantung. Selama tahun 2025, ia memiliki beberapa sumber penghasilan:\n(1) Membuka klinik praktik spesialis sendiri dengan omzet penerimaan bruto Rp 3.500.000.000.\n(2) Memiliki usaha Apotek di ruko miliknya dengan omzet peredaran bruto Rp 2.000.000.000.\n(3) Bekerja sebagai dokter tetap (diangkat oleh RS) di RS Harapan Sehat dengan gaji tetap bulanan Rp 30.000.000.\nDokter Andi tidak pernah mengajukan pemberitahuan penggunaan NPPN ke KPP dalam batas waktu yang ditentukan.",
    "soal": "[Studi Kasus - Soal 1] Terkait metode perhitungan penghasilan netonya untuk SPT Tahunan 2025, apakah Dokter Andi diperbolehkan menggunakan Norma Penghitungan Penghasilan Neto (NPPN)?",
    "opsi": [
      "A. Boleh, karena omzet dari masing-masing usaha (Klinik 3,5 M dan Apotek 2 M) masih di bawah batas Rp 4,8 Miliar.",
      "B. Tidak boleh, karena total omzet kegiatan usaha dan pekerjaan bebas gabungannya melebihi Rp 4,8 Miliar (total 5,5 Miliar) sehingga wajib menyelenggarakan Pembukuan.",
      "C. Boleh menggunakan NPPN untuk Klinik Praktik, namun Wajib Pembukuan untuk usaha Apotek karena sifatnya dagang.",
      "D. Boleh, namun karena tidak ada pemberitahuan ke DJP, tarif pajaknya dinaikkan 20%."
    ],
    "jawaban": 1,
    "pembahasan": "Berdasarkan Pasal 14 ayat (2) UU PPh, Wajib Pajak Orang Pribadi yang melakukan kegiatan usaha ATAU pekerjaan bebas yang peredaran brutonya dalam 1 tahun kurang dari Rp 4,8 Miliar boleh menggunakan NPPN. Namun, jika WP memiliki beberapa jenis usaha/pekerjaan bebas, omzet tersebut harus DIGABUNGKAN (Total = 3,5 M + 2 M = 5,5 M). Karena total omzetnya sudah melebihi Rp 4,8 Miliar, Dokter Andi WAJIB menyelenggarakan Pembukuan. Ia sama sekali tidak berhak menggunakan NPPN.",
    "dasar": "Pasal 14 ayat (2) UU PPh dan PMK 54/PMK.03/2021 tentang NPPN."
  },
  {
    "id": lastIdSesi2 + 2,
    "kategori": "ppn",
    "skenario": "[STUDI KASUS KOMPREHENSIF: DOKTER \u0026 PENGUSAHA] Dokter Andi adalah seorang dokter spesialis jantung. Selama tahun 2025, ia memiliki beberapa sumber penghasilan:\n(1) Membuka klinik praktik spesialis sendiri dengan omzet penerimaan bruto Rp 3.500.000.000.\n(2) Memiliki usaha Apotek di ruko miliknya dengan omzet peredaran bruto Rp 2.000.000.000.\n(3) Bekerja sebagai dokter tetap (diangkat oleh RS) di RS Harapan Sehat dengan gaji tetap bulanan Rp 30.000.000.\nDokter Andi tidak pernah mengajukan pemberitahuan penggunaan NPPN ke KPP dalam batas waktu yang ditentukan.",
    "soal": "[Studi Kasus - Soal 2] Bagaimana status kewajiban Pengukuhan sebagai Pengusaha Kena Pajak (PKP) dan pengenaan PPN untuk kegiatan Dokter Andi?",
    "opsi": [
      "A. Wajib dikukuhkan sebagai PKP karena total omzet 5,5 Miliar. Wajib memungut PPN atas jasa dokternya dan penjualan obat apotek.",
      "B. Tidak wajib PKP, karena Jasa Pelayanan Medis dikecualikan dari PPN.",
      "C. Wajib dikukuhkan sebagai PKP karena total peredaran bruto dari barang/jasa kena pajak \u0026 non-kena pajak > 4,8 Miliar. Namun PPN hanya dipungut atas penyerahan obat di Apotek (BKP), sedangkan Jasa Medik (Non-JKP) tidak dipungut PPN.",
      "D. Wajib dikukuhkan sebagai PKP. PPN terutang atas seluruh omzet karena tidak dipisahkan entitasnya."
    ],
    "jawaban": 2,
    "pembahasan": "Berdasarkan PMK 197/PMK.03/2013, Wajib Pajak yang omzet/peredaran brutonya melebihi Rp 4,8 Miliar setahun wajib dikukuhkan sebagai PKP. Perhitungan omzet untuk batasan PKP mencakup seluruh penyerahan, baik BKP, JKP, maupun yang dibebaskan/tidak dikenakan. Oleh karena omzet Dokter Andi > 4,8M, ia WAJIB menjadi PKP. Setelah menjadi PKP, pengenaan PPN harus melihat jenis penyerahan: Jasa pelayanan kesehatan medis adalah Jasa yang TIDAK DIKENAKAN PPN (Non-JKP) sesuai Pasal 4A ayat (3) UU PPN (UU HPP). Obat-obatan di Apotek adalah BKP. Jadi, PPN hanya dipungut dari omzet Apotek.",
    "dasar": "Pasal 4A ayat (3) UU PPN jo. PMK-197/PMK.03/2013 tentang Batasan Pengusaha Kecil PPN."
  },
  {
    "id": lastIdSesi2 + 3,
    "kategori": "potput",
    "skenario": "[STUDI KASUS KOMPREHENSIF: DOKTER \u0026 PENGUSAHA] Dokter Andi adalah seorang dokter spesialis jantung. Selama tahun 2025, ia memiliki beberapa sumber penghasilan:\n(1) Membuka klinik praktik spesialis sendiri dengan omzet penerimaan bruto Rp 3.500.000.000.\n(2) Memiliki usaha Apotek di ruko miliknya dengan omzet peredaran bruto Rp 2.000.000.000.\n(3) Bekerja sebagai dokter tetap (diangkat oleh RS) di RS Harapan Sehat dengan gaji tetap bulanan Rp 30.000.000.\nDokter Andi tidak pernah mengajukan pemberitahuan penggunaan NPPN ke KPP dalam batas waktu yang ditentukan.",
    "soal": "[Studi Kasus - Soal 3] Bagaimana mekanisme pemotongan PPh Pasal 21 yang dilakukan oleh RS Harapan Sehat atas penghasilan Dokter Andi?",
    "opsi": [
      "A. Dipotong menggunakan skema PPh 21 Tenaga Ahli (Berkesinambungan) sebesar 50% x Penghasilan Bruto x Tarif Progresif.",
      "B. Dipotong PPh 21 Final sebesar tarif 10% atas Jasa Dokter.",
      "C. Dipotong PPh 21 sebagai Pegawai Tetap, menggunakan Tarif Efektif Rata-rata (TER) Bulanan setiap masa pajak selain masa pajak terakhir.",
      "D. Tidak dipotong PPh 21 oleh Rumah Sakit, melainkan Dokter Andi menyetor sendiri melalui PPh Pasal 25."
    ],
    "jawaban": 2,
    "pembahasan": "Dalam skenario disebutkan bahwa Dokter Andi 'bekerja sebagai dokter tetap (diangkat oleh RS) dengan gaji tetap bulanan', BUKAN sebagai dokter tamu/tenaga ahli lepas yang menerima honor berdasar pasien. Karena status hubungannya adalah Pegawai Tetap, maka RS Harapan Sehat wajib memotong PPh 21-nya dengan mekanisme Pegawai Tetap. Berdasarkan PMK 168/2023, pemotongan masa (Januari - November) menggunakan Tarif Efektif Rata-Rata (TER) Bulanan kategori A/B/C sesuai status PTKP-nya.",
    "dasar": "Pasal 2 dan Pasal 13 PMK-168/PMK.03/2023 tentang Pemotongan PPh sehubungan dengan Pekerjaan."
  }
];

data.sesi1.push(...newSesi1);
data.sesi2.push(...newSesi2);

fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully injected Batch 5 of questions into 04-Paket-4.json!');
