# pajak-exam-vue

## Development

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production bundle: `npm run build`

## Generate soal workflow

Generator dan validator sekarang bisa memakai salah satu provider berikut:

- **Gemini** dengan `GEMINI_API_KEY`
- **OpenRouter** dengan `OPENROUTER_API_KEY`

Konfigurasi opsional:

- `AI_PROVIDER=gemini` atau `AI_PROVIDER=openrouter`
- `AI_MODEL` untuk memilih satu model
- `AI_MODELS` untuk daftar fallback model dipisahkan koma
- `OPENROUTER_SITE_URL` untuk header `HTTP-Referer`

Jika `AI_PROVIDER` tidak diisi, script akan auto-detect dari key yang tersedia. Untuk kompatibilitas lama, jika `GEMINI_API_KEY` ternyata berisi key OpenRouter, script akan memakai OpenRouter secara otomatis.
