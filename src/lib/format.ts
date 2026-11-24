const dateFormatter = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short' });

/** "Nov 2026" style dates used across project listings. */
export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}
