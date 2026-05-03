// US Eastern Time midnight cutoff — works for both EST (-5) and EDT (-4)
export function getCutoffDate(days: number): Date {
  const now = new Date();

  // Get ET year/month/day using Intl API
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(now);

  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  const year = get('year');
  const month = get('month');
  const day = get('day');

  // Brute-force UTC hour that gives ET midnight (hour = 0)
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/New_York', hour: 'numeric', hour12: false,
  });
  for (let h = 0; h < 24; h++) {
    const d = new Date(Date.UTC(year, month - 1, day, h));
    if (fmt.format(d) === '0') {
      if (days === 1) return d;
      return new Date(d.getTime() - (days - 1) * 86400000);
    }
  }

  // Fallback: assume -4 offset (EDT)
  const d = new Date(Date.UTC(year, month - 1, day, 4));
  if (days === 1) return d;
  return new Date(d.getTime() - (days - 1) * 86400000);
}
