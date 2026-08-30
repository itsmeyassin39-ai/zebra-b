import { getToken } from '../store/auth';
import { getGoogleToken } from '../store/googleAuth';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = getToken() || getGoogleToken();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    const err = new Error(
      (data && typeof data === 'object' && 'error' in data ? (data as { error?: string }).error : undefined) ||
        `Erreur serveur (${res.status}).`
    ) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  return data as T;
}