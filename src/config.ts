import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/rocathon',
  embeddingProvider: process.env.EMBEDDING_PROVIDER ?? 'openai',
  openAiApiKey: process.env.OPENAI_API_KEY ?? '',
  embeddingModel: process.env.EMBEDDING_MODEL ?? '',
  embeddingDim: Number(process.env.EMBEDDING_DIM ?? 1536),
  vectorProbes: Number(process.env.VECTOR_PROBES ?? 10)
};
