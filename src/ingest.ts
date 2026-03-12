import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';
import { getEmbedding } from './embed.js';
import { CreatorInput } from './types.js';
import { buildSearchText } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const filePath = process.argv[2] || path.resolve(__dirname, '../data/creators.json');
  const raw = await fs.readFile(filePath, 'utf8');
  const creators = JSON.parse(raw) as CreatorInput[];

  console.log(`Loaded ${creators.length} creators from ${filePath}`);

  await pool.query('TRUNCATE TABLE creators RESTART IDENTITY');
  await pool.query(`SET ivfflat.probes = ${Number.isFinite(10) ? 10 : 10}`);

  for (let index = 0; index < creators.length; index += 1) {
    const creator = creators[index];
    const searchText = buildSearchText(creator);
    const embedding = await getEmbedding(searchText);

    await pool.query(
      `
      INSERT INTO creators (
        username,
        bio,
        content_style_tags,
        projected_score,
        follower_count,
        total_gmv_30d,
        avg_views_30d,
        engagement_rate,
        gpm,
        major_gender,
        gender_pct,
        age_ranges,
        search_text,
        embedding
      ) VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14
      )
      `,
      [
        creator.username,
        creator.bio ?? '',
        creator.content_style_tags ?? [],
        creator.projected_score ?? 0,
        creator.metrics?.follower_count ?? null,
        creator.metrics?.total_gmv_30d ?? null,
        creator.metrics?.avg_views_30d ?? null,
        creator.metrics?.engagement_rate ?? null,
        creator.metrics?.gpm ?? null,
        creator.metrics?.demographics?.major_gender ?? null,
        creator.metrics?.demographics?.gender_pct ?? null,
        creator.metrics?.demographics?.age_ranges ?? [],
        searchText,
        JSON.stringify(embedding)
      ]
    );

    if ((index + 1) % 25 === 0 || index === creators.length - 1) {
      console.log(`Ingested ${index + 1}/${creators.length}`);
    }
  }

  console.log('Ingestion completed.');
}

main()
  .catch((error) => {
    console.error('ingest failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
