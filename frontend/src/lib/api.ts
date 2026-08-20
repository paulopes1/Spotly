/**
 * Cliente HTTP mínimo com gestão de sessão.
 *
 * Decisão: o access token vive SÓ em memória (variável de módulo) — nunca em
 * localStorage, reduzindo a superfície de XSS. Quando um request devolve 401,
 * tentamos uma vez o refresh silencioso (cookie httpOnly) e repetimos o
 * request. O refresh token nunca é visível ao JavaScript.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function rawRequest(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}/api${path}`, {
    ...options,
    credentials: 'include', // cookie httpOnly do refresh viaja nas rotas /auth
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res = await rawRequest(path, options);

  // Access token expirado → tenta renovar uma única vez e repete.
  if (res.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await rawRequest(path, options);
  }

  if (!res.ok) {
    let message = 'Algo deu errado. Tente novamente.';
    try {
      const body = await res.json();
      message = Array.isArray(body.message) ? body.message[0] : (body.message ?? message);
    } catch {
      /* corpo não-JSON */
    }
    if (res.status === 429) message = 'Muitas requisições em sequência. Aguarde um minuto e tente de novo.';
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function tryRefresh(): Promise<{ accessToken: string; user: { id: string; email: string; name: string } } | null> {
  try {
    const res = await rawRequest('/auth/refresh', { method: 'POST' });
    if (!res.ok) return null;
    const data = await res.json();
    accessToken = data.accessToken;
    return data;
  } catch {
    return null;
  }
}
