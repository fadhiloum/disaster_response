import OpenAI from "openai";

export const openaiModel = process.env.OPENAI_MODEL ?? "gpt-5.5";
export const openaiRequestTimeoutMs = Number.parseInt(
  process.env.OPENAI_REQUEST_TIMEOUT_MS ?? "8000",
  10,
);

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 0,
    timeout: Number.isFinite(openaiRequestTimeoutMs)
      ? openaiRequestTimeoutMs
      : 8000,
  });
}
