import express from 'express';
import { z } from 'zod';
import { config } from './config.js';
import { retrieveCandidates } from './search.js';
import { rerank } from './rank.js';
import { expandQuery } from './utils.js';
import { BrandProfile } from './types.js';

const app = express();
app.use(express.json());

const bodySchema = z.object({
  query: z.string().min(1),
  brandProfile: z.object({
    brand_name: z.string().optional(),
    category: z.string().optional(),
    target_audience: z.array(z.string()).optional()
  }).optional()
});

export async function searchCreators(query: string, brandProfile: BrandProfile = {}) {
  const expanded = expandQuery(query, brandProfile);
  const candidates = await retrieveCandidates(expanded, 50);
  return rerank(expanded, candidates);
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const ranked = await searchCreators(query, {});
    res.json({
      query,
      count: ranked.length,
      results: ranked
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

app.post('/search', async (req, res) => {
  try {
    const parsed = bodySchema.parse(req.body);
    const ranked = await searchCreators(parsed.query, parsed.brandProfile ?? {});
    res.json({
      query: parsed.query,
      count: ranked.length,
      results: ranked
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
