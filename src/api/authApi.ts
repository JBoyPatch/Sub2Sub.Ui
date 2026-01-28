export type AuthUserDto = {
  ok: boolean;
  id?: string | null;
  username: string;
  email?: string | null;
  avatarUrl?: string | null;
  credits?: number;
  accessToken?: string | null;
  type?: string | null; // 'User' | 'Admin'
  message?: string | null;
};

const DEFAULT_BASE = '';
const baseUrl = import.meta.env.DEV
  ? '/api/$default'
  : (import.meta.env.VITE_API_BASE_URL as string) || DEFAULT_BASE;

async function request<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Auth API error: ${res.status} ${txt}`);
  }

  return (await res.json()) as T;
}

export async function signup(username: string, email: string | null, passwordHash: string): Promise<AuthUserDto> {
  return await request<AuthUserDto>('/auth/signup', { username, email, passwordHash });
}

export async function login(username: string, passwordHash: string): Promise<AuthUserDto> {
  return await request<AuthUserDto>('/auth/login', { username, passwordHash });
}

export async function hashPassword(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(plain);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
