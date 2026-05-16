const fs = require('fs');
const path = require('path');

const PROVIDERS = {
  gemini: {
    protocol: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com',
    endpoint: '/v1beta/models/{model}:generateContent',
    modelList: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'],
    keyEnvs: ['GEMINI_API_KEY']
  },
  openrouter: {
    protocol: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    endpoint: '/chat/completions',
    modelList: ['google/gemini-2.5-flash', 'google/gemini-2.0-flash-001', 'deepseek/deepseek-chat-v3-0324:free'],
    keyEnvs: ['OPENROUTER_API_KEY', 'GEMINI_API_KEY']
  },
  kimi: {
    protocol: 'openai',
    baseUrl: 'https://api.moonshot.cn/v1',
    endpoint: '/chat/completions',
    modelList: ['moonshot-v1-8k', 'moonshot-v1-32k'],
    keyEnvs: ['KIMI_API_KEY']
  },
  mimo: {
    protocol: 'openai',
    baseUrl: 'https://api.mimo.ai/v1',
    endpoint: '/chat/completions',
    modelList: ['mimo-v1'],
    keyEnvs: ['MIMO_API_KEY']
  },
  deepseek: {
    protocol: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    endpoint: '/chat/completions',
    modelList: ['deepseek-chat', 'deepseek-reasoner'],
    keyEnvs: ['DEEPSEEK_API_KEY']
  },
  qwen: {
    protocol: 'openai',
    baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    endpoint: '/chat/completions',
    modelList: ['qwen-plus', 'qwen-turbo'],
    keyEnvs: ['QWEN_API_KEY']
  }
};

// Retry helper with exponential backoff
async function fetchWithRetry(url, options, maxRetries = 4) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 2 menit timeout
      
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      
      // Jika rate limited (429) atau server error (5xx), retry
      if (response.status === 429 || response.status >= 500) {
        const waitTime = Math.min(3000 * Math.pow(2, attempt - 1), 90000);
        console.log(`  Attempt ${attempt}/${maxRetries} failed with status ${response.status}. Retrying in ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) throw err;
      const waitTime = Math.min(3000 * Math.pow(2, attempt - 1), 90000);
      console.log(`  Attempt ${attempt}/${maxRetries} error: ${err.message}. Retrying in ${waitTime / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw lastError || new Error(`All ${maxRetries} attempts failed.`);
}

function normalizeProviderName(value) {
  return (value || '').trim().toLowerCase().replace(/[-_ ]/g, '');
}

function detectProviderName() {
  const explicit = process.env.AI_API_SYSTEM || process.env.LLM_API_SYSTEM;
  const normalized = normalizeProviderName(explicit);
  if (normalized) {
    if (PROVIDERS[normalized]) return normalized;
    return 'custom';
  }
  if (process.env.OPENROUTER_API_KEY) return 'openrouter';
  if (process.env.KIMI_API_KEY) return 'kimi';
  if (process.env.MIMO_API_KEY) return 'mimo';
  if (process.env.DEEPSEEK_API_KEY) return 'deepseek';
  if (process.env.QWEN_API_KEY) return 'qwen';
  return 'gemini';
}

function resolveApiConfig() {
  const providerName = detectProviderName();
  const provider = PROVIDERS[providerName] || {
    protocol: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    endpoint: '/chat/completions',
    modelList: ['google/gemini-2.5-flash'],
    keyEnvs: []
  };

  const keyCandidates = [
    process.env.AI_API_KEY,
    process.env.LLM_API_KEY,
    ...provider.keyEnvs.map(envName => process.env[envName])
  ].filter(Boolean);
  const apiKey = keyCandidates[0];
  if (!apiKey) {
    throw new Error(`API key tidak ditemukan untuk provider "${providerName}". Set AI_API_KEY atau key spesifik provider.`);
  }

  const prefix = providerName.toUpperCase();
  const modelListFromEnv = process.env.AI_MODEL_LIST || process.env[`${prefix}_MODEL_LIST`];
  const preferredModel = process.env.AI_MODEL || process.env[`${prefix}_MODEL`];
  const models = modelListFromEnv
    ? modelListFromEnv.split(',').map(m => m.trim()).filter(Boolean)
    : [...provider.modelList];
  if (preferredModel && !models.includes(preferredModel)) {
    models.unshift(preferredModel);
  }

  const baseUrl = (process.env.AI_BASE_URL || process.env[`${prefix}_BASE_URL`] || provider.baseUrl).replace(/\/$/, '');
  const endpoint = process.env.AI_ENDPOINT || process.env[`${prefix}_ENDPOINT`] || provider.endpoint;
  const authType = (process.env.AI_AUTH_TYPE || process.env[`${prefix}_AUTH_TYPE`] || (provider.protocol === 'gemini' ? 'query' : 'bearer')).toLowerCase();
  const authHeader = process.env.AI_AUTH_HEADER || process.env[`${prefix}_AUTH_HEADER`] || 'Authorization';

  return { providerName, protocol: provider.protocol, apiKey, models, baseUrl, endpoint, authType, authHeader };
}

function buildRequest(config, model, prompt) {
  const headers = { 'Content-Type': 'application/json' };
  let requestPath = config.endpoint.replace('{model}', encodeURIComponent(model));

  if (config.authType === 'bearer') {
    headers[config.authHeader] = `Bearer ${config.apiKey}`;
  } else if (config.authType === 'x-api-key') {
    headers[config.authHeader] = config.apiKey;
  } else if (config.authType === 'query') {
    const separator = requestPath.includes('?') ? '&' : '?';
    requestPath += `${separator}key=${encodeURIComponent(config.apiKey)}`;
  }

  if (config.providerName === 'openrouter') {
    if (process.env.OPENROUTER_REFERER) headers['HTTP-Referer'] = process.env.OPENROUTER_REFERER;
    if (process.env.OPENROUTER_TITLE) headers['X-Title'] = process.env.OPENROUTER_TITLE;
  }

  const url = `${config.baseUrl}${requestPath}`;
  const body = config.protocol === 'gemini'
    ? {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    }
    : {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8192
    };

  return { url, headers, body };
}

function extractTextFromResponse(config, model, data) {
  if (config.protocol === 'gemini') {
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No candidates in response.');
    }
    const candidate = data.candidates[0];
    if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
      throw new Error(`Blocked by safety filter. Reason: ${candidate.finishReason}`);
    }
    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0].text) {
      throw new Error('Response missing text content.');
    }
    return candidate.content.parts[0].text.trim();
  }

  const message = data.choices && data.choices[0] && data.choices[0].message;
  const text = typeof message?.content === 'string'
    ? message.content
    : Array.isArray(message?.content)
      ? message.content.map(part => (typeof part === 'string' ? part : part?.text || '')).join('\n')
      : '';
  if (!text) {
    throw new Error('No text content in choices[0].message.content.');
  }
  return text.trim();
}

// Coba panggil API dengan fallback model
async function callAiWithFallback(config, prompt) {
  for (const model of config.models) {
    console.log(`[${config.providerName}] Mencoba model: ${model}...`);
    const { url, headers, body } = buildRequest(config, model, prompt);

    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`[${config.providerName}] Model ${model} API Error (${response.status}):`, JSON.stringify(data).substring(0, 500));
        continue; // Coba model berikutnya
      }

      const text = extractTextFromResponse(config, model, data);
      return { model, text };
    } catch (err) {
      console.error(`[${config.providerName}] Model ${model} gagal: ${err.message}`);
      continue; // Coba model berikutnya
    }
  }

  throw new Error(`[${config.providerName}] Semua model gagal. Tidak bisa generate soal.`);
}

async function generateSoal() {
  let apiConfig;
  try {
    apiConfig = resolveApiConfig();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
  console.log(`Menggunakan provider API: ${apiConfig.providerName} (base URL: ${apiConfig.baseUrl})`);

  const paketDir = path.join(__dirname, '../src/data/paket');
  
  // Pastikan directory ada
  if (!fs.existsSync(paketDir)) {
    fs.mkdirSync(paketDir, { recursive: true });
  }
  
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

  const needsSesi1 = countSesi1 < 60;
  const needsSesi2 = countSesi2 < 20;

  if (needsSesi1 && needsSesi2) {
    // Jika keduanya belum lengkap, pilih secara acak namun prioritaskan sesi2 jika masih sangat sedikit
    targetSesi = (Math.random() < 0.6 || countSesi2 < 5) ? 'sesi2' : 'sesi1';
  } else if (needsSesi1) {
    targetSesi = 'sesi1';
  } else if (needsSesi2) {
    targetSesi = 'sesi2';
  }

  if (targetSesi === 'sesi1') {
    targetSesi = 'sesi1';
    numToGenerate = Math.min(3, 60 - countSesi1); // Dikurangi jadi 3 supaya response tidak terlalu panjang
    
    const sSoal = currentData.sesi1 || [];
    startId = sSoal.length > 0 ? Math.max(...sSoal.map(s => s.id || 0)) + 1 : 1;
    
    const existingTopics = sSoal.slice(-15).map(s => `- ${s.skenario.substring(0, 100).replace(/\n/g, ' ')}...`).join('\n');

    fullPrompt = `Buat ${numToGenerate} soal pilihan ganda PPh [BADAN/OP/POTPUT/PPN/KUP] tingkat SEDANG untuk Pemeriksa Pajak DJP.
    
PENTING: JANGAN MENGULANGI skenario, topik, atau perhitungan yang sudah dibuat sebelumnya. Berikut adalah contoh 15 soal terakhir yang SUDAH ADA (hindari membuat soal yang mirip dengan ini):
${existingTopics}
Buatlah variasi kasus baru, pasal yang berbeda, atau jenis pajak lain agar bank soal sangat kaya dan beragam!

Syarat:
- Skenario kasus nyata, angka realistis dalam Rupiah. Angka perhitungan harus dibuat simpel (hindari desimal panjang).
- 4 pilihan jawaban, distractor plausible
- Pembahasan dengan perhitungan step-by-step
- Dasar hukum spesifik (termasuk aturan terbaru UU HPP)
- MATERI SOAL WAJIB MERUJUK PADA SALAH SATU PERATURAN BERIKUT:
  * UU (KUP, PPh, PPN, PBB, BM)
  * PP 50/2022, PP 9/2022, PP 44/2022
  * PMK 41/2020, PMK 60/2022, PMK 71/2022, PMK 131/2024, PMK 11/2025
  * PMK 141/2015, PMK 191/2015, PMK 192/2018
  * PMK 66/2023, PMK 168/2023, PMK 79/2024, PMK 15/2025, PMK 112/2025
- Jika ada data keuangan, gunakan HTML Table.

Format JSON array:
[{"id": ${startId}, "kategori": "pph-badan", "skenario": "...", "soal": "...", "opsi": ["A...", "B...", "C...", "D..."], "jawaban": 0, "pembahasan": "...", "dasar": "..."}]

PENTING: Output HANYA JSON array valid. Mulai dengan [ akhiri dengan ].`;
  } else if (targetSesi === 'sesi2') {
    targetSesi = 'sesi2';
    numToGenerate = Math.min(2, 20 - countSesi2); // Dikurangi jadi 2 agar tidak terpotong (token limit)
    
    const sSoal = currentData.sesi2 || [];
    startId = sSoal.length > 0 ? Math.max(...sSoal.map(s => s.id || 0)) + 1 : 1;
    
    // Ambil topik dari 2 studi kasus terakhir (kira-kira 8 soal terakhir)
    const existingTopics = sSoal.slice(-8).map(s => `- ${s.skenario.substring(0, 100).replace(/\n/g, ' ')}...`).join('\n');

    fullPrompt = `Buat 1 studi kasus kompleks dan ${numToGenerate} soal pilihan ganda tingkat SANGAT SULIT (setara Uji Kompetensi Pemeriksa Pajak / FPP).

PENTING: JANGAN MENGULANGI skenario atau studi kasus yang sudah dibuat sebelumnya. Berikut adalah potongan kasus yang SUDAH ADA:
${existingTopics}
Buatlah skenario studi kasus BARU dengan industri atau permasalahan perpajakan yang sangat berbeda!

KETENTUAN SKENARIO (HARUS MIRIP KASUS AUDIT NYATA):
- 1 skenario perusahaan dengan narasi profesional dan "Temuan Pemeriksa" (Audit Findings) yang spesifik (contoh: biaya tanpa daftar nominatif, DER melebihi batas 4:1, metode TP tidak sesuai, dll).
- Gunakan angka/skala realistis perusahaan besar (Miliaran/Triliunan Rupiah) dalam tabel HTML.
- Skenario harus mencakup kompleksitas lintas-pajak (PPh Badan, Pemotongan/Pemungutan/Unifikasi, PPN, dan sanksi KUP).
- Industri yang disarankan: Konstruksi (termasuk aspek PPh Final Proporsional), Ekspor-Impor, Pertambangan, atau Perusahaan Multinasional.

KETENTUAN SOAL:
- ${numToGenerate} soal SALING BERKAITAN dengan skenario yang sama.
- Setiap soal: 4 pilihan jawaban (A-D), 1 jawaban benar. Distractor harus plausible secara hukum.
- Soal harus menuntut perhitungan multi-step (bukan sekadar hafalan).
- Angka konsisten antar soal (hindari desimal panjang).
- Dasar hukum HARUS sangat spesifik (sebutkan Pasal, Ayat, dari UU, PP, atau PMK yang berlaku).

MATERI MERUJUK PADA: 
UU (KUP/PPh/PPN), PP 50/2022, PP 9/2022 (terkait DER & Dividen), PP 44/2022, PMK 60/2022, PMK 71/2022, PMK 131/2024, PMK 11/2025, PMK 141/2015, PMK 168/2023, PMK 112/2025, dll.

Format JSON array:
[{"id": ${startId}, "kategori": "pph-badan", "skenario": "[STUDI KASUS] ...", "soal": "[STUDI KASUS - Soal 1] ...", "opsi": ["A...", "B...", "C...", "D..."], "jawaban": 0, "pembahasan": "...", "dasar": "..."}]

PENTING: Output HANYA JSON array valid. Mulai dengan [ akhiri dengan ].`;
  }

  if (!targetSesi) {
    console.log('Semua paket sudah lengkap. Tidak ada yang perlu digenerate.');
    process.exit(0);
  }

  console.log(`\nAkan generate ${numToGenerate} soal untuk ${targetSesi} di file ${targetFile}...`);

  try {
    const result = await callAiWithFallback(apiConfig, fullPrompt);
    console.log(`Berhasil dengan model: ${result.model}`);
    
    const text = result.text;
    
    // Ekstrak JSON array
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
      console.error('No valid JSON array found in response.');
      console.error('Raw text (first 1000 chars):', text.substring(0, 1000));
      process.exit(0); // Exit 0 agar workflow tetap sukses dan mencoba lagi di jadwal berikutnya
    }
    
    const jsonStr = text.substring(startIdx, endIdx + 1);
    
    let newSoal;
    try {
      newSoal = JSON.parse(jsonStr);
    } catch (parseErr) {
      // Coba bersihkan common issues
      const cleaned = jsonStr
        .replace(/,\s*]/g, ']')  // trailing comma
        .replace(/,\s*}/g, '}') // trailing comma in object
        .replace(/[\x00-\x1F\x7F]/g, ' '); // control characters
      newSoal = JSON.parse(cleaned);
    }
    
    if (!Array.isArray(newSoal) || newSoal.length === 0) {
      console.error('Parsed result is not a valid array or is empty.');
      process.exit(1);
    }
    
    // Assign ID untuk konsistensi
    let currentId = startId;
    newSoal.forEach(s => {
      s.id = currentId++;
      if (!currentData[targetSesi]) currentData[targetSesi] = [];
      currentData[targetSesi].push(s);
    });

    // Simpan ke file
    if (currentData.sesi1 && currentData.sesi1.length > 60) {
      currentData.sesi1 = currentData.sesi1.slice(0, 60);
    }
    if (currentData.sesi2 && currentData.sesi2.length > 20) {
      currentData.sesi2 = currentData.sesi2.slice(0, 20);
    }
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8');
    console.log(`\nSukses! File ${targetFile} diupdate dengan ${newSoal.length} soal baru.`);
    console.log(`Total sekarang - Sesi1: ${(currentData.sesi1 || []).length}/60, Sesi2: ${(currentData.sesi2 || []).length}/20`);
  } catch (e) {
    console.error('\nGagal generate soal:', e.message);
    console.error('Response AI mungkin terpotong. Akan dicoba lagi pada jadwal berikutnya.');
    process.exit(0); // Exit 0 agar workflow tidak dianggap gagal
  }
}

generateSoal();
