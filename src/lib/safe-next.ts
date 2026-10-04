/** Only same-site paths that start with a single slash are allowed. */
export function safeNextPath(raw: string | null | undefined, fallback = '/account'): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(raw)) return fallback;

  try {
    const url = new URL(raw, 'http://saathchalo.invalid');
    if (url.origin !== 'http://saathchalo.invalid') return fallback;
  } catch {
    return fallback;
  }

  return raw;
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
