# pajak-exam-vue

## Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Generate Soal (multi-provider AI)

Script generator dan validator sekarang mendukung beberapa provider AI:
- `gemini` (default)
- `openrouter`
- `kimi`
- `mimo`
- `deepseek`
- `qwen`

Konfigurasi utama:
- `AI_PROVIDER` (contoh: `openrouter`)
- `AI_MODEL` atau `AI_MODELS` (opsional untuk override model fallback)
- `AI_BASE_URL` (opsional untuk override endpoint provider)
- `AI_API_KEY` (opsional generic key fallback)

Provider-specific API key:
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `KIMI_API_KEY`
- `MIMO_API_KEY`
- `DEEPSEEK_API_KEY`
- `QWEN_API_KEY`

Catatan:
- Gemini pakai auth query parameter (`?key=...`).
- Provider lain pakai `Authorization: Bearer <api_key>`.
- Untuk OpenRouter bisa tambah:
  - `OPENROUTER_HTTP_REFERER`
  - `OPENROUTER_X_TITLE`
- Untuk `mimo`, set `MIMO_BASE_URL` atau `AI_BASE_URL` jika endpoint tidak standar.

## GitHub Actions + Vercel Deployment

Workflow `.github/workflows/generate-soal.yml` akan:
1. generate soal,
2. validasi soal,
3. commit + push perubahan konten,
4. deploy otomatis ke Vercel jika ada perubahan.

Set secret berikut di GitHub Repository:
- AI keys sesuai provider yang dipakai (mis. `OPENROUTER_API_KEY`)
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Set repository variable (opsional):
- `AI_PROVIDER`, `AI_MODEL`, `AI_MODELS`, `AI_BASE_URL`
- `OPENROUTER_HTTP_REFERER`, `OPENROUTER_X_TITLE`
