CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS creators (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  bio TEXT NOT NULL,
  content_style_tags TEXT[] NOT NULL DEFAULT '{}',
  projected_score DOUBLE PRECISION NOT NULL,
  follower_count DOUBLE PRECISION,
  total_gmv_30d DOUBLE PRECISION,
  avg_views_30d DOUBLE PRECISION,
  engagement_rate DOUBLE PRECISION,
  gpm DOUBLE PRECISION,
  major_gender TEXT,
  gender_pct DOUBLE PRECISION,
  age_ranges TEXT[] NOT NULL DEFAULT '{}',
  search_text TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creators_embedding
ON creators
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_creators_projected_score
ON creators (projected_score DESC);
