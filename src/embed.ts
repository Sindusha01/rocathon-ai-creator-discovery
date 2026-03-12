import OpenAI from 'openai';
import { config } from './config.js';

function normalize(vec: number[]): number[] {
  const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map((v) => v / mag);
}

function stableHash(token: string): number {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function localEmbedding(text: string, dim = config.embeddingDim): number[] {
  const vec = Array.from({ length: dim }, () => 0);
  const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    const h = stableHash(token);
    const index = h % dim;
    const sign = (h % 2 === 0) ? 1 : -1;
    vec[index] += sign * (1 + (token.length % 3) * 0.1);
  }

  return normalize(vec);
}

const openaiClient = config.openAiApiKey
  ? new OpenAI({ apiKey: config.openAiApiKey })
  : null;

export async function getEmbedding(text: string): Promise<number[]> {
  if (config.embeddingProvider === 'openai') {
    if (!openaiClient) {
      throw new Error('OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai');
    }

    const response = await openaiClient.embeddings.create({
      model: config.embeddingModel || 'text-embedding-3-small',
      input: text
    });

    const vector = response.data[0]?.embedding;
    if (!vector) {
      throw new Error('Embedding response was empty.');
    }
    return vector;
  }

  return localEmbedding(text);
}
