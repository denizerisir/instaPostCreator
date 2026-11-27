import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error('SESSION_SECRET ortam değişkeni tanımlanmamış.');
  }
  return secret;
}

export interface SessionPayload {
  username: string;
  iat?: number;
  exp?: number;
}

export function createSessionToken(username: string): string {
  const secret = getSessionSecret();
  return jwt.sign({ username }, secret, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const secret = getSessionSecret();
    const decoded = jwt.verify(token, secret) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function extractTokenFromHeaders(headers: Record<string, string | undefined>): string | null {
  const authHeader = headers['authorization'] || headers['Authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Check cookie as fallback
  const cookieHeader = headers['cookie'] || headers['Cookie'];
  if (cookieHeader) {
    const match = cookieHeader.match(/studio_session=([^;]+)/);
    if (match) return match[1];
  }

  return null;
}

export function verifyAuth(headers: Record<string, string | undefined>): { authenticated: boolean; user?: string; error?: string } {
  const token = extractTokenFromHeaders(headers);
  if (!token) {
    return { authenticated: false, error: 'Oturum belirteci bulunamadı. Lütfen giriş yapın.' };
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return { authenticated: false, error: 'Oturum süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın.' };
  }

  return { authenticated: true, user: payload.username };
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function jsonResponse(statusCode: number, data: unknown, extraHeaders: Record<string, string> = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store, max-age=0',
      ...extraHeaders,
    },
    body: JSON.stringify(data),
  };
}
