/** Only allow redirects back into this app (prevents open redirects via location state). */
export const safeRedirect = (value: unknown): string =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
