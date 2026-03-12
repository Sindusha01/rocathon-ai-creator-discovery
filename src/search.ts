import { pool } from './db.js';
import { getEmbedding } from './embed.js';
import { Candidate } from './types.js';
import { config } from './config.js';

export async function retrieveCandidates(query: string, limit = 50): Promise<Candidate[]> {
  const queryEmbedding = await getEmbedding(query);
  await pool.query(`SET ivfflat.probes = ${config.vectorProbes}`);

  const result = await pool.query(
    `
    SELECT
      id,
      username,
      bio,
      content_style_tags,
      projected_score,
      follower_count,
      total_gmv_30d,
      avg_views_30d,
      engagement_rate,
      gpm,
      1 - (embedding <=> $1::vector) AS semantic_score
    FROM creators
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    `,
    [JSON.stringify(queryEmbedding), limit]
  );

  return result.rows as Candidate[];
}
