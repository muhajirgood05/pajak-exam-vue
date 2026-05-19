const fs = require('fs');
const path = require('path');

const targets = [
  { file: '07-Paket-7.json', id: 26, title: 'PPh Badan atas Subsidi Pemerintah' },
  { file: '07-Paket-7.json', id: 46, title: 'Perlakuan PPN atas Majalah Cetak & Digital' },
  { file: '07-Paket-7.json', id: 54, title: 'Perlakuan PPh atas Usaha Rumah Kos (Tn. Ivan)' },
  { file: '05-Paket-5.json', id: 48, title: 'PPh Pasal 26 atas Premi Asuransi Luar Negeri' },
  { file: '07-Paket-7.json', id: 36, title: 'Pemungutan PPh 22 atas Input Pertanian' },
  { file: '07-Paket-7.json', id: 29, title: 'Pajak Penghasilan atas Pengalihan Saham Modal Ventura' },
  { file: '06-Paket-6.json', id: 42, title: 'Penghitungan PKP dengan Investment Allowance' },
  { file: '06-Paket-6.json', id: 56, title: 'Status PTKP Suami-Istri Memilih Terpisah (MT)' },
  { file: '05-Paket-5.json', id: 49, title: 'Amortisasi Kelompok 3 Metode Saldo Menurun' },
  { file: '03-Paket-3.json', id: 32, title: 'Pembebanan & Objek PPh atas Natura/Kenikmatan' }
];

const dataDir = path.join(__dirname, '../src/data/paket');
const questions = [];

targets.forEach((target, idx) => {
  const filePath = path.join(dataDir, target.file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${target.file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  
  // Find the question by id in either sesi1 or sesi2 or root array
  let found = null;
  const searchInArray = (arr) => {
    if (!arr) return;
    const q = arr.find(item => item.id === target.id);
    if (q) found = q;
  };

  searchInArray(parsed.sesi1);
  searchInArray(parsed.sesi2);
  if (Array.isArray(parsed)) {
    searchInArray(parsed);
  }

  if (found) {
    questions.push({
      ...found,
      title: target.title,
      file: target.file,
      rank: idx + 1
    });
  } else {
    console.error(`Question ID ${target.id} not found in ${target.file}`);
  }
});

console.log(`Loaded ${questions.length} questions for PDF compilation.`);

// Generate HTML with premium CSS (Simplified: No Cover, No Intro, No Header, No Footer)
const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Kompilasi Soal Ukom Perpajakan 2026 - Koreksi Resmi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
    
    :root {
      --primary: #1e293b;
      --primary-light: #334155;
      --accent: #4f46e5;
      --accent-light: #e0e7ff;
      --success: #059669;
      --success-light: #ecfdf5;
      --warning: #d97706;
      --warning-light: #fef3c7;
      --danger: #dc2626;
      --danger-light: #fef2f2;
      --gray-light: #f8fafc;
      --gray-border: #e2e8f0;
      --text-main: #0f172a;
      --text-muted: #475569;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--text-main);
      line-height: 1.6;
      background-color: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      color: var(--primary);
    }

    /* Page Container */
    .page {
      padding: 2.5rem 3.5rem;
      page-break-after: always;
      position: relative;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .badge-corrected {
      background-color: var(--success-light);
      color: var(--success);
      border: 1px solid #a7f3d0;
    }

    .badge-missed {
      background-color: var(--danger-light);
      color: var(--danger);
      border: 1px solid #fca5a5;
    }

    .badge-cat {
      background-color: var(--accent-light);
      color: var(--accent);
    }

    /* Question Container */
    .q-container {
      margin-bottom: 1.5rem;
    }

    .q-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .q-number {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary);
    }

    .q-meta {
      display: flex;
      gap: 0.5rem;
    }

    .scenario-box {
      background-color: var(--gray-light);
      border-left: 4px solid var(--primary-light);
      padding: 1.25rem;
      border-radius: 0 8px 8px 0;
      font-size: 0.95rem;
      color: var(--text-main);
      margin-bottom: 1.25rem;
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    }

    .soal-text {
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: 1.25rem;
      color: var(--primary);
    }

    .options-list {
      list-style-type: none;
      margin-bottom: 1.5rem;
    }

    .option-item {
      display: flex;
      align-items: flex-start;
      padding: 0.75rem 1rem;
      border: 1px solid var(--gray-border);
      border-radius: 6px;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }

    .option-letter {
      font-weight: 700;
      margin-right: 0.75rem;
      color: var(--text-muted);
    }

    .option-correct {
      border-color: var(--success);
      background-color: var(--success-light);
      color: var(--success);
      font-weight: 500;
    }
    
    .option-correct .option-letter {
      color: var(--success);
    }

    .option-correct::before {
      content: '✓';
      display: inline-block;
      margin-right: 0.5rem;
      font-weight: bold;
    }

    /* Explanation Section */
    .expl-box {
      border: 1px dashed var(--success);
      background-color: #f0fdf4;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 1.5rem;
    }

    .expl-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--success);
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .expl-text {
      font-size: 0.925rem;
      color: #065f46;
      line-height: 1.6;
      text-align: justify;
      margin-bottom: 1rem;
    }

    .expl-basis {
      display: flex;
      align-items: center;
      font-size: 0.85rem;
      color: #047857;
      font-weight: 600;
      background-color: #d1fae5;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      border: 1px solid #a7f3d0;
    }

    .expl-basis-label {
      margin-right: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #065f46;
    }

    /* Table within questions */
    .q-container table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 0.875rem;
    }
    .q-container th {
      background-color: var(--primary-light);
      color: #ffffff;
      padding: 0.5rem 0.75rem;
    }
    .q-container td {
      border: 1px solid var(--gray-border);
      padding: 0.5rem 0.75rem;
    }

    @page {
      margin: 0;
    }
    @media print {
      body {
        background-color: #ffffff;
      }
      .page {
        height: 100vh;
        page-break-after: always;
        overflow: hidden;
      }
      .page:last-child {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>

  <!-- QUESTIONS PAGES (Simplified: No Cover, No Intro, No Header/Footer) -->
  ${questions.map((q, index) => {
    const isOurCorrection = ['07-Paket-7.json_46', '07-Paket-7.json_54', '06-Paket-6.json_42', '06-Paket-6.json_56', '05-Paket-5.json_49'].includes(`${q.file}_${q.id}`);
    const badgeHtml = isOurCorrection 
      ? '<span class="badge badge-corrected">KOREKSI REGULASI BARU</span>' 
      : '<span class="badge badge-missed">TINGKAT KESALAHAN TINGGI</span>';

    return `
      <div class="page">
        <div class="q-container">
          <div class="q-header">
            <h3 class="q-number">Soal ${q.rank}: ${q.title}</h3>
            <div class="q-meta">
              <span class="badge badge-cat">${q.kategori.toUpperCase()}</span>
              ${badgeHtml}
            </div>
          </div>

          <div class="scenario-box">
            <strong>Skenario Kasus:</strong><br>
            ${q.skenario}
          </div>

          <div class="soal-text">
            Pertanyaan: ${q.soal}
          </div>

          <ul class="options-list">
            ${q.opsi.map((opt, optIdx) => {
              const isCorrect = optIdx === q.jawaban;
              const optionClass = isCorrect ? 'option-item option-correct' : 'option-item';
              const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
              const optClean = opt.replace(/^[A-D]\.\s*/i, '');
              return `
                <li class="${optionClass}">
                  <span class="option-letter">${letter}.</span>
                  <span>${optClean}</span>
                </li>
              `;
            }).join('')}
          </ul>

          <div class="expl-box">
            <div class="expl-title">
              <span>💡</span> Pembahasan Materiil & Analisis Jawaban
            </div>
            <div class="expl-text">
              ${q.pembahasan}
            </div>
            <div class="expl-basis">
              <span class="expl-basis-label">Dasar Hukum:</span>
              <span>${q.dasar}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('')}

</body>
</html>
`;

// Write the generated HTML to disk
const htmlPath = path.join(__dirname, '../ukom_missed_questions.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log(`Successfully generated HTML file at: ${htmlPath}`);
