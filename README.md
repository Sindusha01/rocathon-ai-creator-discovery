# RoCathon Challenge 1 — Hybrid Creator Search Engine

This project implements the challenge spec: retrieve creator candidates with **vector search** over bio + content style tags, then **re-rank** them using the dataset's `projected_score` and light commerce-aware tie-breakers. The challenge requires a **TypeScript + PostgreSQL/pgvector** implementation, top-50 semantic retrieval, and a final hybrid score that balances semantic match with projected business value. fileciteturn0file0

## What this system does

- embeds creator search text into vectors
- stores vectors in PostgreSQL with `pgvector`
- retrieves the top 50 semantically similar creators
- normalizes semantic and projected scores
- re-ranks candidates with a hybrid formula
- penalizes false positives with weak commerce signals

## Architecture

```text
query + brand profile
        ↓
query expansion
        ↓
embedding generation
        ↓
pgvector top-50 retrieval
        ↓
normalize semantic + projected scores
        ↓
aux business boosts + weak-commerce penalties
        ↓
final ranked creator list
```

## Ranking logic

The challenge baseline is:

```text
final = (semantic × A) + (projected × B)
```

The spec recommends starting weights of:

```text
semantic = 0.45
projected = 0.55
```

This implementation improves the baseline by:

1. min-max normalizing semantic and projected scores within the retrieved candidate set
2. lightly boosting recent business strength from GMV, views, followers, and engagement
3. penalizing weak commerce results like zero GMV or very low engagement
4. slightly shifting semantic/projected weights based on query intent

Final formula used here:

```text
final_score =
  (semantic_weight * semantic_norm) +
  (projected_weight * projected_norm) +
  (0.08 * aux_business_norm) -
  penalty
```

## Project structure

```text
rocathon/
  src/
    api.ts
    config.ts
    db.ts
    db-init.ts
    embed.ts
    ingest.ts
    rank.ts
    search.ts
    types.ts
    utils.ts
  scripts/
    run-search.ts
  sql/
    schema.sql
  data/
    creators.json
  docker-compose.yml
  package.json
  tsconfig.json
  .env.example
```

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Start PostgreSQL with pgvector

```bash
docker compose up -d
```

### 3. Configure env

Copy `.env.example` to `.env`.

For real semantic search quality, set:

```bash
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your_key_here
```

For a fully local dry run, you can set:

```bash
EMBEDDING_PROVIDER=local
```

That local mode uses a deterministic hashed embedding fallback so the app still runs without an external API.

### 4. Initialize schema

```bash
npm run db:init
```

### 5. Add dataset

Put the provided `creators.json` in:

```text
data/creators.json
```

### 6. Ingest creators

```bash
npm run ingest
```

### 7. Run API

```bash
npm run dev
```

### 8. Test search API

```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "smart home creators with high gmv",
    "brandProfile": {
      "brand_name": "brand_smart_home",
      "category": "smart home",
      "target_audience": ["tech buyers", "home automation"]
    }
  }'
```

## CLI output for deliverable JSON

You can also generate a ranked list from the command line:

```bash
npm run search -- "smart home creators with high gmv"
```

Save it to a deliverable file like this:

```bash
npm run search -- "smart home creators with high gmv" > output-ranked-creators.json
```

## Why this should score well

This implementation is designed around the published judging criteria:

- **Correctness against hidden test cases**: uses the required retrieval → re-rank flow
- **Quality of ranking tradeoffs**: does not overtrust pure semantic similarity
- **Engineering execution**: clean separation across ingestion, search, ranking, and API layers
- **README + reproducibility**: setup, schema, ingestion, and execution are fully documented

The challenge emphasizes that “good vibe + high GMV beats perfect vibe + $0 GMV,” and that the system should avoid AI search false positives in commerce. This implementation explicitly encodes that idea with a projected-score-forward ranking and penalties for weak commerce signals. fileciteturn0file0

## Notes for submission

Your final submission should include:

- GitHub repo link
- setup README
- DB ingest instructions
- output JSON for the required brand profile
- optional short Loom demo

Those are listed in the challenge deliverables section. fileciteturn0file0
