import { api } from '../api/client';

const TOKEN_LOCAL = 'zebra_token_v1';
const TOKEN_SESSION = 'zebra_token_tmp_v1';
const EMAIL_LOCAL = 'zebra_email_v1';
const EMAIL_SESSION = 'zebra_email_tmp_v1';

export function getToken(): string | null {
  try {
    return (
      sessionStorage.getItem(TOKEN_SESSION) ||
      localStorage.getItem(TOKEN_LOCAL) ||
      null
    );
  } catch {
    return null;
  }
}

export function isSessionValid(): boolean {
  return Boolean(getToken());
}

export function getRememberedEmail(): string {
  try {
    return localStorage.getItem(EMAIL_LOCAL) || sessionStorage.getItem(EMAIL_SESSION) || '';
  } catch {
    return '';
  }
}

export function saveSession(token: string, remember: boolean, email: string): void {
  try {
    sessionStorage.removeItem(TOKEN_SESSION);
    localStorage.removeItem(TOKEN_LOCAL);
    // On stocke toujours la session en localStorage pour rester connecté même
    // si le navigateur est fermé et rouvert (le `remember` garde uniquement sa
    // sémantique, mais la connexion est persistée dans tous les cas).
    localStorage.setItem(TOKEN_LOCAL, token);
    localStorage.setItem(EMAIL_LOCAL, email);
  } catch {
    // storage unavailable
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(TOKEN_SESSION);
    localStorage.removeItem(TOKEN_LOCAL);
    sessionStorage.removeItem(EMAIL_SESSION);
    localStorage.removeItem(EMAIL_LOCAL);
  } catch {
    // storage unavailable
  }
}

export async function login(email: string, password: string, remember: boolean): Promise<void> {
  const data = await api<{ token: string }>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  saveSession(data.token, remember, email);
}

export async function logout(): Promise<void> {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch {
    // best effort
  }
  clearSession();
}