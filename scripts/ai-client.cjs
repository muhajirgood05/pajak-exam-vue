const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash'
];

const OPENROUTER_MODELS = [
  'google/gemini-2.0-flash-001'
];

function isOpenRouterLikeKey(value) {
  return typeof value === 'string' && /^sk-or-v1-|^sk-or-|^sk-/.test(value.trim());
}

function splitModels(value) {
  if (!value) return [];
  return value
    .split(',')
    .map(model => model.trim())
    .filter(Boolean);
}

function resolveProviderConfig(env = process.env) {
  const requestedProvider = (env.AI_PROVIDER || '').trim().toLowerCase();
  const explicitProvider = requestedProvider === 'gemini' || requestedProvider === 'openrouter'
    ? requestedProvider
    : '';
  const geminiKey = (env.GEMINI_API_KEY || '').trim();
  const openRouterKey = (env.OPENROUTER_API_KEY || '').trim();
  const genericKey = (env.AI_API_KEY || '').trim();

  let provider = explicitProvider;
  if (!provider) {
    if (geminiKey && !isOpenRouterLikeKey(geminiKey)) {
      provider = 'gemini';
    } else if (openRouterKey) {
      provider = 'openrouter';
    } else if (geminiKey && isOpenRouterLikeKey(geminiKey)) {
      provider = 'openrouter';
    } else if (genericKey) {
      provider = isOpenRouterLikeKey(genericKey) ? 'openrouter' : 'gemini';
    }
  }

  const apiKey = provider === 'openrouter'
    ? (openRouterKey || genericKey || geminiKey)
    : (geminiKey || genericKey);

  const configuredModels = splitModels(
    env.AI_MODELS ||
    (provider === 'openrouter' ? env.OPENROUTER_MODELS : env.GEMINI_MODELS)
  );

  const configuredSingleModel = (
    env.AI_MODEL ||
    (provider === 'openrouter' ? env.OPENROUTER_MODEL : env.GEMINI_MODEL) ||
    ''
  ).trim();

  const models = configuredModels.length > 0
    ? configuredModels
    : configuredSingleModel
      ? [configuredSingleModel]
      : provider === 'openrouter'
        ? OPENROUTER_MODELS
        : GEMINI_MODELS;

  return { provider, apiKey, models };
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

function extractGeminiText(data) {
  if (!data.candidates || !data.candidates[0]) {
    throw new Error('No candidates in response.');
  }

  const candidate = data.candidates[0];
  if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
    throw new Error(`Blocked by safety filter. Reason: ${candidate.finishReason}`);
  }

  const text = candidate.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Response missing text content.');
  }

  return text.trim();
}

function extractOpenRouterText(data) {
  if (!data.choices || !data.choices[0]) {
    throw new Error(data.error?.message || 'No choices in response.');
  }

  const content = data.choices[0].message?.content;
  if (typeof content === 'string' && content.trim()) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const text = content
      .map(part => typeof part === 'string' ? part : part?.text || '')
      .join('')
      .trim();
    if (text) return text;
  }

  throw new Error('Response missing text content.');
}

async function callGemini(model, apiKey, prompt, options) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxOutputTokens,
        responseMimeType: options.responseMimeType
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`API Error (${response.status}): ${JSON.stringify(data).substring(0, 500)}`);
  }

  return extractGeminiText(data);
}

async function callOpenRouter(model, apiKey, prompt, options, env = process.env) {
  const response = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': env.OPENROUTER_SITE_URL || 'https://github.com/muhajirgood05/pajak-exam-vue',
      'X-Title': env.OPENROUTER_APP_NAME || 'pajak-exam-vue'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature,
      max_tokens: options.maxOutputTokens
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`API Error (${response.status}): ${JSON.stringify(data).substring(0, 500)}`);
  }

  return extractOpenRouterText(data);
}

async function callAIWithFallback(prompt, options = {}) {
  const resolved = resolveProviderConfig();
  if (!resolved.provider) {
    throw new Error('AI provider is not configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY.');
  }
  if (!resolved.apiKey) {
    throw new Error(`API key for provider "${resolved.provider}" is not set.`);
  }

  const finalOptions = {
    temperature: options.temperature ?? 0.7,
    maxOutputTokens: options.maxOutputTokens ?? 8192,
    responseMimeType: options.responseMimeType ?? 'application/json'
  };

  for (const model of resolved.models) {
    console.log(`Mencoba provider ${resolved.provider} dengan model: ${model}...`);

    try {
      const text = resolved.provider === 'openrouter'
        ? await callOpenRouter(model, resolved.apiKey, prompt, finalOptions)
        : await callGemini(model, resolved.apiKey, prompt, finalOptions);

      return {
        provider: resolved.provider,
        model,
        text
      };
    } catch (err) {
      console.error(`${resolved.provider}:${model} gagal: ${err.message}`);
    }
  }

  throw new Error(`Semua model ${resolved.provider} gagal. Tidak bisa memproses permintaan.`);
}

module.exports = {
  callAIWithFallback,
  resolveProviderConfig
};
