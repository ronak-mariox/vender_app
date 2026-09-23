export function formatCurrencyCompact(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${Math.round(value)}`;
}

/** Best-effort display name for an uploaded document, extracted from its server URL. */
export function filenameFromUrl(url: string): string {
  if (!url) return '';
  const withoutQuery = url.split('?')[0];
  const segments = withoutQuery.split('/');
  return segments[segments.length - 1] || url;
}
