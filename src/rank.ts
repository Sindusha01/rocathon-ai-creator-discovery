import { Candidate, RankedCreator } from './types.js';

function minMaxNormalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 1);
  return values.map((value) => (value - min) / (max - min));
}

function safeLog(value?: number | null): number {
  return value && value > 0 ? Math.log10(value + 1) : 0;
}

function getWeights(query: string) {
  const q = query.toLowerCase();
  const performanceTerms = ['gmv', 'roi', 'converting', 'best sellers', 'viral', 'engagement', 'high performing'];
  const styleTerms = ['cozy', 'luxury', 'minimalist', 'funny', 'vibe', 'aesthetic', 'edgy', 'playful'];

  const perfHit = performanceTerms.some((term) => q.includes(term));
  const styleHit = styleTerms.some((term) => q.includes(term));

  if (perfHit && !styleHit) return { semantic: 0.35, projected: 0.65 };
  if (styleHit && !perfHit) return { semantic: 0.55, projected: 0.45 };
  return { semantic: 0.45, projected: 0.55 };
}

function computeAuxBusinessSignal(candidate: Candidate): number {
  const gmv = safeLog(candidate.total_gmv_30d);
  const views = safeLog(candidate.avg_views_30d);
  const followers = safeLog(candidate.follower_count);
  const engagement = candidate.engagement_rate ?? 0;

  return (
    0.45 * gmv +
    0.20 * views +
    0.10 * followers +
    0.25 * engagement
  );
}

function computePenalty(candidate: Candidate): number {
  let penalty = 0;
  if ((candidate.total_gmv_30d ?? 0) <= 0) penalty += 0.08;
  if ((candidate.avg_views_30d ?? 0) <= 0) penalty += 0.03;
  if ((candidate.engagement_rate ?? 0) < 0.01) penalty += 0.02;
  return penalty;
}

export function rerank(query: string, candidates: Candidate[]): RankedCreator[] {
  if (candidates.length === 0) return [];

  const weights = getWeights(query);
  const semanticNorm = minMaxNormalize(candidates.map((candidate) => candidate.semantic_score));
  const projectedNorm = minMaxNormalize(candidates.map((candidate) => candidate.projected_score));
  const auxBusinessRaw = candidates.map(computeAuxBusinessSignal);
  const auxBusinessNorm = minMaxNormalize(auxBusinessRaw);

  const ranked = candidates.map((candidate, index) => {
    const baseScore =
      weights.semantic * semanticNorm[index] +
      weights.projected * projectedNorm[index] +
      0.08 * auxBusinessNorm[index];

    const penalty = computePenalty(candidate);
    const finalScore = baseScore - penalty;

    const explanation: string[] = [];
    if (semanticNorm[index] > 0.75) explanation.push('strong semantic match');
    if (projectedNorm[index] > 0.75) explanation.push('strong projected business score');
    if (auxBusinessNorm[index] > 0.75) explanation.push('good recent business metrics');
    if (penalty > 0) explanation.push('penalized for weak commerce signals');

    return {
      ...candidate,
      semantic_norm: Number(semanticNorm[index].toFixed(6)),
      projected_norm: Number(projectedNorm[index].toFixed(6)),
      aux_business_norm: Number(auxBusinessNorm[index].toFixed(6)),
      final_score: Number(finalScore.toFixed(6)),
      explanation
    } satisfies RankedCreator;
  });

  return ranked.sort((a, b) => b.final_score - a.final_score);
}
