const OPENAI_COMPATIBLE_PROVIDERS = {
  openrouter: {
    endpoint: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-4.1-mini',
    keyEnv: 'OPENROUTER_API_KEY',
    extraHeaders: {
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://pajak-exam-vue.vercel.app',
      'X-Title': 'Pajak Exam Admin Generator'
    }
  },
  kimi: {
    endpoint: process.env.KIMI_API_URL || 'https://api.moonshot.cn/v1/chat/completions',
    defaultModel: process.env.KIMI_DEFAULT_MODEL || 'moonshot-v1-8k',
    keyEnv: 'KIMI_API_KEY'
  },
  mimo: {
    endpoint: process.env.MIMO_API_URL || 'https://api.mimo.com/v1/chat/completions',
    defaultModel: process.env.MIMO_DEFAULT_MODEL || 'mimo-chat',
    keyEnv: 'MIMO_API_KEY'
  },
  deepseek: {
    endpoint: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions',
    defaultModel: process.env.DEEPSEEK_DEFAULT_MODEL || 'deepseek-chat',
    keyEnv: 'DEEPSEEK_API_KEY'
  },
  qwen: {
    endpoint: process.env.QWEN_API_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
    defaultModel: process.env.QWEN_DEFAULT_MODEL || 'qwen-plus',
    keyEnv: 'QWEN_API_KEY'
  }
};

function extractJsonArray(rawText = '') {
  const start = rawText.indexOf('[');
  const end = rawText.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('AI response does not contain a valid JSON array.');
  }
  const jsonStr = rawText.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr);
  } catch {
    const cleaned = jsonStr.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
    return JSON.parse(cleaned);
  }
}

async function callGemini({ prompt, model, apiKey }) {
  const selectedModel = model || process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.0-flash';
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Gemini API key is missing.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${key}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(data).slice(0, 240)}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini response is empty.');
  return { provider: 'gemini', model: selectedModel, text };
}

async function callOpenAiCompatible(provider, { prompt, model, apiKey }) {
  const config = OPENAI_COMPATIBLE_PROVIDERS[provider];
  if (!config) throw new Error(`Unsupported provider: ${provider}`);

  const key = apiKey || process.env[config.keyEnv];
  if (!key) throw new Error(`${provider} API key is missing.`);

  const selectedModel = model || config.defaultModel;
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(config.extraHeaders || {})
    },
    body: JSON.stringify({
      model: selectedModel,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${provider} API error ${response.status}: ${JSON.stringify(data).slice(0, 240)}`);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${provider} response is empty.`);
  return { provider, model: selectedModel, text };
}

export async function generateQuestionsWithProvider({ provider, model, prompt, apiKey }) {
  const normalized = String(provider || '').trim().toLowerCase();
  if (!normalized) throw new Error('Provider is required.');
  if (!prompt || typeof prompt !== 'string') throw new Error('Prompt is required.');

  const result = normalized === 'gemini'
    ? await callGemini({ prompt, model, apiKey })
    : await callOpenAiCompatible(normalized, { prompt, model, apiKey });

  const generatedQuestions = extractJsonArray(result.text);
  if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
    throw new Error('Generated questions are empty.');
  }

  return {
    provider: result.provider,
    model: result.model,
    generatedQuestions
  };
}
