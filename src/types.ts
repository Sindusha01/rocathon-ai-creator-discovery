export type CreatorInput = {
  username: string;
  bio?: string;
  content_style_tags?: string[];
  projected_score?: number;
  metrics?: {
    follower_count?: number;
    total_gmv_30d?: number;
    avg_views_30d?: number;
    engagement_rate?: number;
    gpm?: number;
    demographics?: {
      major_gender?: string;
      gender_pct?: number;
      age_ranges?: string[];
    };
  };
};

export type BrandProfile = {
  brand_name?: string;
  category?: string;
  target_audience?: string[];
};

export type Candidate = {
  id: number;
  username: string;
  bio: string;
  content_style_tags: string[];
  projected_score: number;
  follower_count?: number | null;
  total_gmv_30d?: number | null;
  avg_views_30d?: number | null;
  engagement_rate?: number | null;
  gpm?: number | null;
  semantic_score: number;
};

export type RankedCreator = Candidate & {
  semantic_norm: number;
  projected_norm: number;
  aux_business_norm: number;
  final_score: number;
  explanation: string[];
};
