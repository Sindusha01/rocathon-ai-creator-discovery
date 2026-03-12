import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { searchCreators } from '../src/api.js';
import { BrandProfile } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const query = process.argv[2] ?? 'smart home creators with high gmv';
  const brandProfileArg = process.argv[3];

  let brandProfile: BrandProfile = {
    brand_name: 'brand_smart_home',
    category: 'smart home',
    target_audience: ['tech buyers', 'home automation']
  };

  if (brandProfileArg) {
    const candidatePath = path.resolve(process.cwd(), brandProfileArg);
    const raw = await fs.readFile(candidatePath, 'utf8');
    brandProfile = JSON.parse(raw) as BrandProfile;
  }

  const ranked = await searchCreators(query, brandProfile);
  console.log(JSON.stringify(ranked.slice(0, 10), null, 2));
}

main().catch((error) => {
  console.error('search script failed:', error);
  process.exitCode = 1;
});
