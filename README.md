# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Konfigurasi Multi API untuk Generate Soal

Script `scripts/generate-soal.cjs` sekarang mendukung beberapa sistem API (Gemini, OpenRouter, Kimi, Mimo, DeepSeek, Qwen, dan provider lain yang OpenAI-compatible).

### Variabel umum (opsional)
- `AI_API_SYSTEM`: `gemini` | `openrouter` | `kimi` | `mimo` | `deepseek` | `qwen` | `custom`
- `AI_API_KEY`: API key umum (override key spesifik provider)
- `AI_BASE_URL`: override base URL API
- `AI_ENDPOINT`: override endpoint (contoh `/chat/completions` atau `/v1beta/models/{model}:generateContent`)
- `AI_MODEL`: model utama
- `AI_MODEL_LIST`: fallback model, pisahkan dengan koma
- `AI_AUTH_TYPE`: `bearer` | `x-api-key` | `query`
- `AI_AUTH_HEADER`: nama header auth (default `Authorization`)

### Variabel key spesifik provider
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `KIMI_API_KEY`
- `MIMO_API_KEY`
- `DEEPSEEK_API_KEY`
- `QWEN_API_KEY`

### Auto-detection provider
Jika `AI_API_SYSTEM` tidak diisi, script akan deteksi otomatis dari key yang tersedia (prioritas: `OPENROUTER_API_KEY`, `KIMI_API_KEY`, `MIMO_API_KEY`, `DEEPSEEK_API_KEY`, `QWEN_API_KEY`, lalu `GEMINI_API_KEY`).

### Contoh konfigurasi

OpenRouter:
```bash
AI_API_SYSTEM=openrouter
OPENROUTER_API_KEY=or-xxx
AI_MODEL=google/gemini-2.5-flash
```

Gemini:
```bash
AI_API_SYSTEM=gemini
GEMINI_API_KEY=xxx
AI_MODEL=gemini-2.5-flash
```
