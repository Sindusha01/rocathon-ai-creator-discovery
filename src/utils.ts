import { BrandProfile, CreatorInput } from './types.js';

export function buildSearchText(creator: CreatorInput): string {
  const bio = creator.bio ?? '';
  const tags = (creator.content_style_tags ?? []).join(', ');
  const metrics = creator.metrics ?? {};
  const demographics = metrics.demographics ?? {};

  const pieces = [
    `username: ${creator.username}`,
    `bio: ${bio}`,
    tags ? `style tags: ${tags}` : '',
    metrics.total_gmv_30d != null ? `gmv_30d: ${metrics.total_gmv_30d}` : '',
    metrics.avg_views_30d != null ? `avg_views_30d: ${metrics.avg_views_30d}` : '',
    metrics.engagement_rate != null ? `engagement_rate: ${metrics.engagement_rate}` : '',
    demographics.major_gender ? `major_gender: ${demographics.major_gender}` : '',
    demographics.age_ranges?.length ? `age_ranges: ${demographics.age_ranges.join(', ')}` : ''
  ].filter(Boolean);

  return pieces.join('\n');
}

export function expandQuery(query: string, brandProfile: BrandProfile): string {
  const extras = [
    brandProfile.brand_name ? `brand: ${brandProfile.brand_name}` : '',
    brandProfile.category ? `category: ${brandProfile.category}` : '',
    brandProfile.target_audience?.length ? `target audience: ${brandProfile.target_audience.join(', ')}` : ''
  ].filter(Boolean);

  return [query, ...extras].join(' | ');
}
