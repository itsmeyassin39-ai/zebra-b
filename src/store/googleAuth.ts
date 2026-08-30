const GOOGLE_TOKEN_KEY = 'zebra_site_v1';

export function getGoogleToken(): string | null {
  try {
    return localStorage.getItem(GOOGLE_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function isGoogleLoggedIn(): boolean {
  return Boolean(getGoogleToken());
}

export function saveGoogleSession(token: string): void {
  try {
    localStorage.setItem(GOOGLE_TOKEN_KEY, token);
  } catch {
    // storage unavailable
  }
}

export function clearGoogleSession(): void {
  try {
    localStorage.removeItem(GOOGLE_TOKEN_KEY);
  } catch {
    // storage unavailable
  }
}