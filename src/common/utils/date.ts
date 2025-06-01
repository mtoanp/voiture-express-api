/**
 * 🕒 Format date to UTC string: YYYY-MM-DD HH:mm:ss (24h)
 * Always in UTC timezone
 */
export function formatTimestampUTC(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * 🕒 Format date to local server time: YYYY-MM-DD HH:mm:ss
 * Based on server's timezone (e.g. Europe/Paris on OVH VPS)
 */
export function formatTimestampLocal(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

/**
 * 🇫🇷 Format local server date à la française: DD-MM-YYYY HH:mm:ss
 */
export function formatTimestampFR(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}
