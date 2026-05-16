const PROVIDERS = {
  gemini: {
    apiKeyEnv: 'GEMINI_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'],
    authType: 'query'
  },
  openrouter: {
    apiKeyEnv: 'OPENROUTER_API_KEY',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['google/gemini-2.0-flash-001', 'deepseek/deepseek-chat-v3-0324', 'qwen/qwen-2.5-72b-instruct'],
    authType: 'bearer'
  },
  kimi: {
    apiKeyEnv: 'KIMI_API_KEY',
    baseUrl: 'https://api.moonshot.ai/v1',
    models: ['moonshot-v1-8k'],
    authType: 'bearer'
  },
  mimo: {
    apiKeyEnv: 'MIMO_API_KEY',
    baseUrl: '',
    models: ['mimo-chat'],
    authType: 'bearer'
  },
  deepseek: {
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    baseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat'],
    authType: 'bearer'
  },
  qwen: {
    apiKeyEnv: 'QWEN_API_KEY',
    baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-plus'],
    authType: 'bearer'
  }
};
const DEFAULT_PROVIDER = 'gemini';
const MAX_ERROR_LENGTH = 500;
const FINISH_REASON_STOP = 'STOP';
const FINISH_REASON_MAX_TOKENS = 'MAX_TOKENS';

function normalizeProvider(input) {
  const raw = (input || DEFAULT_PROVIDER).toLowerCase().trim();
  if (raw === 'open-router') return 'openrouter';
  return raw;
}

function providerPrefix(provider) {
  return provider.toUpperCase().replace(/-/g, '_');
}

function parseModelList(value) {
  if (!value) return [];
  return value.split(',').map(v => v.trim()).filter(Boolean);
}

function resolveAiSettings() {
  const provider = normalizeProvider(process.env.AI_PROVIDER || process.env.LLM_PROVIDER);
  const providerConfig = PROVIDERS[provider];

  if (!providerConfig) {
    throw new Error(`AI_PROVIDER "${provider}" belum didukung. Pilihan: ${Object.keys(PROVIDERS).join(', ')}`);
  }

  const prefix = providerPrefix(provider);
  const apiKey = process.env[providerConfig.apiKeyEnv] || process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error(`API key tidak ditemukan. Set ${providerConfig.apiKeyEnv} atau AI_API_KEY.`);
  }

  const rawBaseUrl = (
    process.env[`${prefix}_BASE_URL`] ||
    process.env.AI_BASE_URL ||
    providerConfig.baseUrl
  );
  const normalizedBaseUrl = (rawBaseUrl || '').trim();

  if (!normalizedBaseUrl) {
    const extraHint = provider === 'mimo' ? ' Provider mimo wajib set MIMO_BASE_URL atau AI_BASE_URL.' : '';
    throw new Error(`Base URL untuk provider "${provider}" belum diatur. Set ${prefix}_BASE_URL atau AI_BASE_URL.${extraHint}`);
  }

  const models = parseModelList(
    process.env.AI_MODELS ||
    process.env[`${prefix}_MODELS`] ||
    process.env.AI_MODEL ||
    process.env[`${prefix}_MODEL`]
  );

  return {
    provider,
    apiKey,
    baseUrl: normalizedBaseUrl.replace(/\/+$/, ''),
    models: models.length ? models : providerConfig.models,
    authType: providerConfig.authType
  };
}

async function fetchWithRetry(url, options, maxRetries = 4) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);

      if (response.status === 429 || response.status >= 500) {
        const waitTime = Math.min(3000 * Math.pow(2, attempt - 1), 90000);
        console.log(`  Attempt ${attempt}/${maxRetries} gagal dengan status ${response.status}. Retry ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      return response;
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) throw err;
      const waitTime = Math.min(3000 * Math.pow(2, attempt - 1), 90000);
      console.log(`  Attempt ${attempt}/${maxRetries} error: ${err.message}. Retry ${waitTime / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw lastError || new Error(`All ${maxRetries} attempts failed.`);
}

function extractErrorDetail(data) {
  if (!data) return 'No response body.';
  if (typeof data === 'string') return data.substring(0, MAX_ERROR_LENGTH);
  if (data.error && typeof data.error === 'object') {
    return `${data.error.message || 'Unknown error'}${data.error.code ? ` (code: ${data.error.code})` : ''}`.substring(0, MAX_ERROR_LENGTH);
  }
  if (data.message) return String(data.message).substring(0, MAX_ERROR_LENGTH);
  return JSON.stringify(data).substring(0, MAX_ERROR_LENGTH);
}

async function parseResponseData(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (_) {
    return text;
  }
}

function extractResponseText(provider, data) {
  if (provider === 'gemini') {
    const candidate = data && data.candidates && data.candidates[0];
    if (!candidate) return null;
    if (
      candidate.finishReason &&
      candidate.finishReason !== FINISH_REASON_STOP &&
      candidate.finishReason !== FINISH_REASON_MAX_TOKENS
    ) {
      return null;
    }
    return candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text
      ? candidate.content.parts[0].text.trim()
      : null;
  }

  const choice = data && data.choices && data.choices[0];
  if (!choice) return null;

  const content = choice.message ? choice.message.content : choice.text;
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content.map(part => (typeof part === 'string' ? part : part.text || '')).join('').trim();
  }
  return null;
}

function buildRequest(settings, model, prompt, opts) {
  const { provider, apiKey, baseUrl, authType } = settings;

  if (provider === 'gemini') {
    const url = new URL(`${baseUrl}/models/${model}:generateContent`);
    if (authType === 'query') {
      url.searchParams.set('key', apiKey);
    }
    return {
      url: url.toString(),
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: opts.temperature,
            maxOutputTokens: opts.maxOutputTokens,
            responseMimeType: 'application/json'
          }
        })
      }
    };
  }

  const headers = { 'Content-Type': 'application/json' };
  if (authType === 'bearer') {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  if (provider === 'openrouter') {
    if (process.env.OPENROUTER_HTTP_REFERER) headers['HTTP-Referer'] = process.env.OPENROUTER_HTTP_REFERER;
    if (process.env.OPENROUTER_X_TITLE) headers['X-Title'] = process.env.OPENROUTER_X_TITLE;
  }

  return {
    url: `${baseUrl}/chat/completions`,
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: opts.temperature,
        max_tokens: opts.maxOutputTokens
      })
    }
  };
}

async function callAiWithFallback(settings, prompt, opts = {}) {
  const options = {
    temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.7,
    maxOutputTokens: typeof opts.maxOutputTokens === 'number' ? opts.maxOutputTokens : 8192
  };

  for (const model of settings.models) {
    console.log(`Mencoba provider ${settings.provider} model: ${model}...`);

    try {
      const request = buildRequest(settings, model, prompt, options);
      const response = await fetchWithRetry(request.url, request.options);
      const data = await parseResponseData(response);

      if (!response.ok) {
        console.error(
          `Provider ${settings.provider} model ${model} API Error (${response.status}): ${extractErrorDetail(data)}`
        );
        continue;
      }

      const text = extractResponseText(settings.provider, data);
      if (!text) {
        console.error(`Provider ${settings.provider} model ${model}: response text kosong/invalid.`);
        continue;
      }

      return { provider: settings.provider, model, text };
    } catch (err) {
      console.error(`Provider ${settings.provider} model ${model} gagal total: ${err.message}`);
    }
  }

  throw new Error(`Semua model pada provider ${settings.provider} gagal.`);
}

module.exports = {
  resolveAiSettings,
  callAiWithFallback
};
