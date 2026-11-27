import { Handler } from '@netlify/functions';
import {
  createSessionToken,
  verifyAuth,
  verifyPassword,
  hashPassword,
  jsonResponse,
} from './utils/auth';

export const handler: Handler = async (event) => {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    const action = event.queryStringParameters?.action || 'login';

    // 1. Session verification check
    if (event.httpMethod === 'GET' || action === 'verify') {
      const auth = verifyAuth(event.headers);
      if (!auth.authenticated) {
        return jsonResponse(401, { authenticated: false, error: auth.error });
      }
      return jsonResponse(200, {
        authenticated: true,
        user: { username: auth.user },
      });
    }

    // 2. Password Hash Generator Utility (used in Settings screen to easily configure .env)
    if (action === 'hash-helper') {
      const body = event.body ? JSON.parse(event.body) : {};
      const rawPassword = body.password;
      if (!rawPassword || typeof rawPassword !== 'string' || rawPassword.length < 6) {
        return jsonResponse(400, { error: 'Geçerli bir şifre belirtilmedi (en az 6 karakter olmalıdır).' });
      }
      const generatedHash = hashPassword(rawPassword);
      return jsonResponse(200, {
        success: true,
        hash: generatedHash,
        notice: 'Bu hash değerini Netlify Environment Variables içerisinde APP_PASSWORD_HASH anahtarına ekleyin.',
      });
    }

    // 3. User Login
    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { username, password } = body;

      if (!username || !password) {
        return jsonResponse(400, { error: 'Kullanıcı adı ve şifre zorunludur.' });
      }

      // Read configured credentials from environment variables
      const envUsername = process.env.APP_USERNAME || 'admin';
      const envPasswordHash = process.env.APP_PASSWORD_HASH;

      let isMatch = false;

      if (envPasswordHash) {
        // Enforce secure verification via bcrypt hash
        if (username === envUsername) {
          isMatch = verifyPassword(password, envPasswordHash);
        }
      } else {
        // Fallback for development if environment variable is not configured yet
        // Default dev credentials: admin / studio2026
        if (username === 'admin' && password === 'studio2026') {
          isMatch = true;
        }
      }

      if (!isMatch) {
        return jsonResponse(401, {
          error: 'Geçersiz kullanıcı adı veya şifre.',
        });
      }

      const token = createSessionToken(username);

      return jsonResponse(200, {
        success: true,
        token,
        user: {
          username,
        },
        devNotice: !envPasswordHash
          ? 'UYARI: Netlify üzerinde APP_PASSWORD_HASH henüz tanımlanmamış. Geliştirme modunda varsayılan şifre (studio2026) ile giriş yapıldı.'
          : undefined,
      });
    }

    return jsonResponse(405, { error: 'İzin verilmeyen HTTP yöntemi.' });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Kimlik doğrulama sırasında bir hata oluştu.',
      details: (error as Error).message,
    });
  }
};
