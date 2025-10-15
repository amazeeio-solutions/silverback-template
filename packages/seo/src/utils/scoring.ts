export const SCORE_EXPLANATIONS = {
  overall: `
Yoast SEO Scoring Guide:
• 0-40: Poor - Critical issues need attention
• 41-70: OK - Room for improvement
• 71-100: Good - Well optimized
  `,
  seo: {
    title: 'SEO Score Guide:',
    ranges: [
      {
        score: 1,
        label: 'Critical',
        desc: 'Missing essential elements (title, meta)',
      },
      {
        score: 3,
        label: 'Poor',
        desc: 'Missing recommended elements (images, links)',
      },
      { score: 6, label: 'OK', desc: 'Basic requirements met' },
      { score: 9, label: 'Good', desc: 'Well optimized' },
    ],
  },
  readability: {
    title: 'Readability Score Guide:',
    ranges: [
      { score: 3, label: 'Poor', desc: 'Text is difficult to read' },
      { score: 6, label: 'OK', desc: 'Text needs some improvements' },
      { score: 9, label: 'Good', desc: 'Text is easy to read' },
    ],
  },
  technical: {
    title: 'Technical Score Guide:',
    ranges: [
      { score: 1, label: 'Critical', desc: 'Missing required elements' },
      { score: 4, label: 'Poor', desc: 'Below recommended standards' },
      { score: 7, label: 'OK', desc: 'Meets basic requirements' },
      { score: 9, label: 'Good', desc: 'Follows best practices' },
    ],
  },
};

export function formatScore(score: number): string {
  return `${Math.round(score)}/10`;
}

export function getScoreExplanation(score: number): string {
  if (score >= 8) {
    return 'Good - Your content is well optimized';
  } else if (score >= 6) {
    return 'OK - Some improvements could be made';
  } else {
    return 'Poor - Significant improvements are needed';
  }
}

export function getCategoryScoreExplanation(
  category: string,
  score: number,
): string {
  const categoryInfo = SCORE_EXPLANATIONS[category];
  if (!categoryInfo) return SCORE_EXPLANATIONS.overall;

  const range =
    categoryInfo.ranges.find((r) => score <= r.score) ||
    categoryInfo.ranges[categoryInfo.ranges.length - 1];

  return `${categoryInfo.title}
${range.label} (${score}/10) - ${range.desc}`;
}
