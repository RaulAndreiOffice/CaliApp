// Pulls the friendly message the API sent back, if any. Returns `fallback`
// (the page's own RO/EN string) when the server didn't say anything useful.
// Avoids raw stack traces or terms that blame the user.
export function getServerErrorMessage(err: unknown, fallback: string): string {
  const candidate = (err as {
    response?: { data?: { error?: { message?: string } } };
  })?.response?.data?.error?.message;

  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate;
  }
  return fallback;
}
