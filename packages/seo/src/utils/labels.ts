export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    seo: 'SEO',
    readability: 'Readability',
    technical: 'Technical',
  };
  return labels[category] || category;
} 