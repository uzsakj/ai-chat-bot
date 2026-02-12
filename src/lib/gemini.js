import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const SYSTEM_PROMPT = 'You are a friendly, casual chat assistant. Keep responses natural and conversational—brief, warm, and human. Avoid formal or robotic language, bullet points unless asked, and overly structured answers.';

const DEFAULT_CONFIG = {
  temperature: 0.8,
  maxOutputTokens: 2048,
  systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
};

let aiClient = null;

function getClient() {
  if (!aiClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing VITE_GEMINI_API_KEY. Add it to your .env file.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function getModel(optionsModel) {
  return optionsModel ?? import.meta.env.VITE_GEMINI_MODEL ?? DEFAULT_MODEL;
}

function getRetryDelayFromError(error) {
  try {
    const msg = String(error?.message ?? error?.error?.message ?? '');
    const match = msg.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
    if (match) return Math.ceil(parseFloat(match[1]) * 1000);
    const details = error?.details ?? error?.error?.details;
    if (Array.isArray(details)) {
      for (const d of details) {
        if (d['@type']?.includes('RetryInfo') && d.retryDelay) {
          const sec = parseInt(d.retryDelay?.seconds ?? 0, 10);
          return sec * 1000;
        }
      }
    }
  } catch {
    return null;
  }
}

function isQuotaError(error) {
  const code = error?.code ?? error?.status ?? error?.error?.code;
  const msg = String(error?.message ?? error?.error?.message ?? '');
  return (
    code === 429 ||
    code === 'RESOURCE_EXHAUSTED' ||
    /429|quota|RESOURCE_EXHAUSTED|rate.?limit/i.test(msg)
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function messagesToContents(messages) {
  return messages.map((msg) => ({
    role: msg.type === 'prompt' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));
}

export async function sendMessage(userMessage, history = [], options = {}) {
  const { model: optionsModel, config = {}, maxRetries = 3 } = options;
  const model = getModel(optionsModel);
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const ai = getClient();
  const contents = messagesToContents([...history, { type: 'prompt', text: userMessage }]);

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: mergedConfig,
      });

      const text = response.text;
      if (!text) {
        throw new Error('No response received from Gemini');
      }
      return text;
    } catch (err) {
      lastError = err;
      // Don't retry on 429 / quota — retrying won't help, just fail fast
      if (isQuotaError(err)) {
        throw new Error('API rate limit or quota exceeded. Try again in a few minutes.');
      }
      const isRetryable = /timeout|unavailable|internal|503|500/i.test(String(err?.message ?? ''));
      if (isRetryable && attempt < maxRetries) {
        const delay = getRetryDelayFromError(err) ?? (attempt === 0 ? 2000 : 10000);
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

export function isConfigured() {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
}
