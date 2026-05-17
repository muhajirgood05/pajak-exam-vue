const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../src/data/paket');
const files = [
  '01-Paket-1.json',
  '02-Paket-2.json',
  '03-Paket-3.json',
  '04-Paket-4.json',
  '05-Paket-5.json',
  '06-Paket-6.json',
  '07-Paket-7.json'
];

console.log('--- MEMULAI PERBAIKAN REGULASI PAJAK ---');

files.forEach(fileName => {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${fileName} tidak ditemukan, skip.`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let data = JSON.parse(content);
  let changesCount = 0;

  // Fungsi pemrosesan untuk satu array soal
  const processSoalArray = (soalArray) => {
    if (!Array.isArray(soalArray)) return;

    soalArray.forEach(soal => {
      // -------------------------------------------------------------
      // KATEGORI A: PMK-141/PMK.03/2015 -> PMK-59/PMK.03/2022
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PMK-141/PMK.03/2015')) {
        soal.dasar = soal.dasar.replace(/PMK-141\/PMK\.03\/2015/g, 'PMK-59/PMK.03/2022');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PMK-141/PMK.03/2015')) {
        soal.pembahasan = soal.pembahasan.replace(/PMK-141\/PMK\.03\/2015/g, 'PMK-59/PMK.03/2022');
        changesCount++;
      }
      if (soal.dasar && soal.dasar.includes('PMK 141/PMK.03/2015')) {
        soal.dasar = soal.dasar.replace(/PMK 141\/PMK\.03\/2015/g, 'PMK-59/PMK.03/2022');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PMK 141/PMK.03/2015')) {
        soal.pembahasan = soal.pembahasan.replace(/PMK 141\/PMK\.03\/2015/g, 'PMK-59/PMK.03/2022');
        changesCount++;
      }

      // -------------------------------------------------------------
      // KATEGORI B: PER-16/PJ/2016 -> PMK-168/PMK.010/2023 (TER)
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PER-16/PJ/2016')) {
        soal.dasar = soal.dasar.replace(/PER-16\/PJ\/2016/g, 'PMK-168/PMK.010/2023');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PER-16/PJ/2016')) {
        soal.pembahasan = soal.pembahasan.replace(/PER-16\/PJ\/2016/g, 'PMK-168/PMK.010/2023');
        changesCount++;
      }

      // -------------------------------------------------------------
      // KATEGORI C: PMK-213/PMK.03/2016 -> PMK-172/PMK.03/2023 (TP Doc)
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PMK-213/PMK.03/2016')) {
        soal.dasar = soal.dasar.replace(/PMK-213\/PMK\.03\/2016/g, 'PMK-172/PMK.03/2023');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PMK-213/PMK.03/2016')) {
        soal.pembahasan = soal.pembahasan.replace(/PMK-213\/PMK\.03\/2016/g, 'PMK-172/PMK.03/2023');
        changesCount++;
      }

      // -------------------------------------------------------------
      // KATEGORI D: PMK-96/PMK.03/2009 -> PMK-72/PMK.03/2023 (Penyusutan)
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PMK-96/PMK.03/2009')) {
        soal.dasar = soal.dasar.replace(/PMK-96\/PMK\.03\/2009/g, 'PMK-72/PMK.03/2023');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PMK-96/PMK.03/2009')) {
        soal.pembahasan = soal.pembahasan.replace(/PMK-96\/PMK\.03\/2009/g, 'PMK-72/PMK.03/2023');
        changesCount++;
      }

      // -------------------------------------------------------------
      // KATEGORI E: PMK-43/PMK.03/2008 -> PMK-52/PMK.010/2017 (Merger Buku)
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PMK-43/PMK.03/2008')) {
        soal.dasar = soal.dasar.replace(/PMK-43\/PMK\.03\/2008/g, 'PMK-52/PMK.010/2017');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PMK-43/PMK.03/2008')) {
        soal.pembahasan = soal.pembahasan.replace(/PMK-43\/PMK\.03\/2008/g, 'PMK-52/PMK.010/2017');
        changesCount++;
      }

      // -------------------------------------------------------------
      // KATEGORI F: PP-1/2007 -> PP-78/2019 (Tax Holiday)
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PP-1/2007')) {
        soal.dasar = soal.dasar.replace(/PP-1\/2007/g, 'PP-78/2019 jo. PMK-130/PMK.010/2020');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PP-1/2007')) {
        soal.pembahasan = soal.pembahasan.replace(/PP-1\/2007/g, 'PP-78/2019 jo. PMK-130/PMK.010/2020');
        changesCount++;
      }

      // -------------------------------------------------------------
      // KATEGORI G: PP-51/2008 -> PP-9/2022 (Konstruksi)
      // -------------------------------------------------------------
      if (soal.dasar && (soal.dasar.includes('PP-51/2008') || soal.dasar.includes('51/2008'))) {
        soal.dasar = soal.dasar.replace(/PP-51\/2008/g, 'PP-9/2022').replace(/51\/2008/g, '9/2022');
        changesCount++;
      }
      if (soal.pembahasan && (soal.pembahasan.includes('PP-51/2008') || soal.pembahasan.includes('51/2008'))) {
        soal.pembahasan = soal.pembahasan.replace(/PP-51\/2008/g, 'PP-9/2022').replace(/51\/2008/g, '9/2022');
        changesCount++;
      }

      // -------------------------------------------------------------
      // KATEGORI H: PMK-78/PMK.03/2010 -> PP-1/2012 jo. PMK-186/PMK.03/2015 (PM Proporsional)
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PMK-78/PMK.03/2010')) {
        soal.dasar = soal.dasar.replace(/PMK-78\/PMK\.03\/2010/g, 'PP-1/2012 jo. PMK-186/PMK.03/2015');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PMK-78/PMK.03/2010')) {
        soal.pembahasan = soal.pembahasan.replace(/PMK-78\/PMK\.03\/2010/g, 'PP-1/2012 jo. PMK-186/PMK.03/2015');
        changesCount++;
      }

      // -------------------------------------------------------------
      // KATEGORI I (Verifikasi & Tambahan):
      // PMK-17/PMK.03/2013 -> PMK-17/PMK.03/2013 jo. PMK-18/PMK.03/2021 jo. PMK-15/PMK.03/2025
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PMK-17/PMK.03/2013') && !soal.dasar.includes('PMK-15/PMK.03/2025')) {
        soal.dasar = soal.dasar.replace(/PMK-17\/PMK\.03\/2013/g, 'PMK-17/PMK.03/2013 jo. PMK-18/PMK.03/2021 jo. PMK-15/PMK.03/2025');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PMK-17/PMK.03/2013') && !soal.pembahasan.includes('PMK-15/PMK.03/2025')) {
        soal.pembahasan = soal.pembahasan.replace(/PMK-17\/PMK\.03\/2013/g, 'PMK-17/PMK.03/2013 jo. PMK-18/PMK.03/2021 jo. PMK-15/PMK.03/2025');
        changesCount++;
      }

      // -------------------------------------------------------------
      // PMK-107/PMK.03/2017 -> PMK-107/PMK.03/2017 jo. PMK-93/PMK.03/2019
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PMK-107/PMK.03/2017') && !soal.dasar.includes('PMK-93/PMK.03/2019')) {
        soal.dasar = soal.dasar.replace(/PMK-107\/PMK\.03\/2017/g, 'PMK-107/PMK.03/2017 jo. PMK-93/PMK.03/2019');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PMK-107/PMK.03/2017') && !soal.pembahasan.includes('PMK-93/PMK.03/2019')) {
        soal.pembahasan = soal.pembahasan.replace(/PMK-107\/PMK\.03\/2017/g, 'PMK-107/PMK.03/2017 jo. PMK-93/PMK.03/2019');
        changesCount++;
      }

      // -------------------------------------------------------------
      // SE-13/PJ.52/1998 -> SE-13/PJ.52/1998 jo. PP-44/2022 (BOT)
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('SE-13/PJ.52/1998') && !soal.dasar.includes('PP-44/2022')) {
        soal.dasar = soal.dasar.replace(/SE-13\/PJ\.52\/1998/g, 'SE-13/PJ.52/1998 jo. PP-44/2022');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('SE-13/PJ.52/1998') && !soal.pembahasan.includes('PP-44/2022')) {
        soal.pembahasan = soal.pembahasan.replace(/SE-13\/PJ\.52\/1998/g, 'SE-13/PJ.52/1998 jo. PP-44/2022');
        changesCount++;
      }

      // -------------------------------------------------------------
      // PMK-120/PMK.03/2019 -> PMK-71/PMK.03/2024 (VAT Refund)
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PMK-120/PMK.03/2019')) {
        soal.dasar = soal.dasar.replace(/PMK-120\/PMK\.03\/2019/g, 'PMK-71/PMK.03/2024');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PMK-120/PMK.03/2019')) {
        soal.pembahasan = soal.pembahasan.replace(/PMK-120\/PMK\.03\/2019/g, 'PMK-71/PMK.03/2024');
        changesCount++;
      }

      // -------------------------------------------------------------
      // PMK-9/PMK.03/2013 -> PMK-9/PMK.03/2013 jo. PMK-202/PMK.03/2015 (Keberatan)
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PMK-9/PMK.03/2013') && !soal.dasar.includes('PMK-202')) {
        soal.dasar = soal.dasar.replace(/PMK-9\/PMK\.03\/2013/g, 'PMK-9/PMK.03/2013 jo. PMK-202/PMK.03/2015');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PMK-9/PMK.03/2013') && !soal.pembahasan.includes('PMK-202')) {
        soal.pembahasan = soal.pembahasan.replace(/PMK-9\/PMK\.03\/2013/g, 'PMK-9/PMK.03/2013 jo. PMK-202/PMK.03/2015');
        changesCount++;
      }

      // -------------------------------------------------------------
      // PERBAIKAN SPESIFIK PAKET 6 (SOAL ID 8): ROYALTIES MINERBA (DEDUCTIBLE)
      // -------------------------------------------------------------
      if (fileName === '06-Paket-6.json' && soal.id === 8) {
        console.log('Memperbaiki Paket 6 ID 8 (Royalti Minerba)...');
        soal.jawaban = 0; // Keduanya dapat dikurangkan penuh (Option A)
        soal.pembahasan = 'Berdasarkan UU Minerba No. 3 Tahun 2020 dan PP-96/2021, royalti (iuran tetap dan iuran produksi/royalti) yang dibayarkan kepada pemerintah dalam rangka kegiatan pertambangan batubara merupakan Penerimaan Negara Bukan Pajak (PNBP) yang secara perpajakan diakui sebagai biaya operasional yang dapat dikurangkan (deductible) dari penghasilan bruto sesuai Pasal 6 ayat (1) huruf a UU PPh.';
        soal.dasar = 'Pasal 6 ayat (1) huruf a UU PPh; UU Minerba No. 3 Tahun 2020; PP-96/2021';
        changesCount++;
      }

      // -------------------------------------------------------------
      // PERBAIKAN SPESIFIK PAKET 3 (SOAL ID 43): OBLIGASI PP-91/2021 (10% FINAL)
      // -------------------------------------------------------------
      if (fileName === '03-Paket-3.json' && soal.id === 43) {
        console.log('Memperbaiki Paket 3 ID 43 (Obligasi PP-91/2021)...');
        soal.opsi[2] = 'Rp5.000.000'; // Ubah opsi C menjadi jawaban yang benar
        soal.jawaban = 2; // Jawaban C
        soal.pembahasan = 'Berdasarkan PP Nomor 91 Tahun 2021 tentang Pajak Penghasilan atas Penghasilan Obligasi yang Diterima atau Diperoleh Wajib Pajak Dalam Negeri dan BUT, tarif PPh Final yang dikenakan adalah 10% untuk seluruh subjek pajak dalam negeri (termasuk Badan):\n\n1. Bunga Obligasi Korporasi: 10% x Rp 25.000.000 = Rp 2.500.000\n2. Diskonto Obligasi Pemerintah: 10% x Rp 15.000.000 = Rp 1.500.000\n3. Bunga Obligasi Pemerintah: 10% x Rp 10.000.000 = Rp 1.000.000\n\nTotal PPh Final terutang = Rp 2.500.000 + Rp 1.500.000 + Rp 1.000.000 = Rp 5.000.000.';
        soal.dasar = 'Undang-Undang Pajak Penghasilan Pasal 4 ayat (2); PP Nomor 91 Tahun 2021';
        changesCount++;
      }

      // -------------------------------------------------------------
      // PERBAIKAN SPESIFIK PAKET 7 (SOAL ID 29): VC SHARES CAPITAL GAIN (PP-4/1995)
      // -------------------------------------------------------------
      if (fileName === '07-Paket-7.json' && soal.id === 29) {
        console.log('Memperbaiki Paket 7 ID 29 (Venture Capital Shares)...');
        soal.jawaban = 0; // PPh Final 0,1% karena transaksi saham (Option A)
        soal.pembahasan = 'Penghasilan perusahaan modal ventura dari transaksi penjualan saham atau pengalihan penyertaan modal pada perusahaan pasangan usahanya dikenakan Pajak Penghasilan yang bersifat final sebesar 0,1% dari jumlah bruto nilai transaksi penjualan saham berdasarkan PP-4/1995. DPP = Rp 150 militar. PPh Final = 0,1% x Rp 150 M = Rp 150 juta.';
        soal.dasar = 'PP-4/1995 tentang PPh atas Pengalihan Saham Modal Ventura';
        changesCount++;
      }

      // -------------------------------------------------------------
      // PERBAIKAN SPESIFIK PAKET 7 (SOAL ID 10 Sesi 2): PRE-IPO SHARES (NON-FINAL)
      // -------------------------------------------------------------
      if (fileName === '07-Paket-7.json' && soal.id === 10 && soal.skenario.includes('IPO')) {
        console.log('Memperbaiki Paket 7 Sesi 2 ID 10 (Pre-IPO Shares)...');
        soal.jawaban = 2; // PPh Badan/OP atas capital gain Rp 450 M dengan tarif progresif (non-final)
        soal.pembahasan = 'Penjualan saham perusahaan tertutup (non-Tbk) sebelum proses IPO dikenai Pajak Penghasilan umum (non-final) atas keuntungan (capital gain = harga jual - harga beli). PPh dihitung menggunakan tarif progresif Pasal 17 (untuk Orang Pribadi) atau 22% (untuk Badan) dari capital gain Rp 450 M dalam SPT Tahunan.';
        soal.dasar = 'Pasal 4 ayat (1) UU PPh tentang Capital Gain Saham Non-Tbk';
        changesCount++;
      }

      // -------------------------------------------------------------
      // FIX HALUSINASI LAINNYA: PMK-191/2015 & PMK-233/2020 (Revaluasi) pengganti PMK-79/2024 (Obligasi)
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PMK 79/2024') && soal.kategori && soal.kategori.includes('revaluasi')) {
        soal.dasar = soal.dasar.replace(/PMK 79\/2024/g, 'PMK-191/PMK.010/2015 jo. PMK-233/PMK.03/2020');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PMK 79/2024') && soal.kategori && soal.kategori.includes('revaluasi')) {
        soal.pembahasan = soal.pembahasan.replace(/PMK 79\/2024/g, 'PMK-191/PMK.010/2015 jo. PMK-233/PMK.03/2020');
        changesCount++;
      }

      // -------------------------------------------------------------
      // FIX HALUSINASI LAINNYA: UU HPP Pajak Karbon pengganti PP-46/2024
      // -------------------------------------------------------------
      if (soal.dasar && soal.dasar.includes('PP-46/2024')) {
        soal.dasar = soal.dasar.replace(/PP-46\/2024/g, 'UU No. 7 Tahun 2021 Bab VI (Pajak Karbon)');
        changesCount++;
      }
      if (soal.pembahasan && soal.pembahasan.includes('PP-46/2024')) {
        soal.pembahasan = soal.pembahasan.replace(/PP-46\/2024/g, 'UU No. 7 Tahun 2021 Bab VI (Pajak Karbon)');
        changesCount++;
      }
      if (soal.skenario && soal.skenario.includes('PP-46/2024')) {
        soal.skenario = soal.skenario.replace(/PP-46\/2024/g, 'UU No. 7 Tahun 2021 Bab VI (Pajak Karbon)');
        changesCount++;
      }

      // -------------------------------------------------------------
      // FIX HALUSINASI LAINNYA: SE-24/PJ.52/1998 (Cash Discount) -> Pasal 1 angka 17 UU PPN
      // -------------------------------------------------------------
      if (soal.dasar && (soal.dasar.includes('SE-24/PJ.52/1998') || soal.dasar.includes('SE-24'))) {
        soal.dasar = soal.dasar.replace(/SE-24\/PJ\.52\/1998/g, 'Pasal 1 angka 17 UU PPN').replace(/SE-24/g, 'Pasal 1 angka 17 UU PPN');
        changesCount++;
      }
      if (soal.pembahasan && (soal.pembahasan.includes('SE-24/PJ.52/1998') || soal.pembahasan.includes('SE-24'))) {
        soal.pembahasan = soal.pembahasan.replace(/SE-24\/PJ\.52\/1998/g, 'Pasal 1 angka 17 UU PPN').replace(/SE-24/g, 'Pasal 1 angka 17 UU PPN');
        changesCount++;
      }
    });
  };

  processSoalArray(data.sesi1);
  processSoalArray(data.sesi2);

  if (changesCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[SUKSES] Berhasil memperbarui ${changesCount} referensi di ${fileName}`);
  } else {
    console.log(`[INFO] Tidak ada perubahan terdeteksi di ${fileName}`);
  }
});

console.log('--- PERBAIKAN REGULASI PAJAK SELESAI ---');
