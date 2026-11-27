import { Handler } from '@netlify/functions';
import { verifyAuth, jsonResponse } from './utils/auth';
import { analyzeArtwork } from './utils/gemini';

export const handler: Handler = async (event) => {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Yalnızca POST istekleri kabul edilir.' });
  }

  // 1. Authenticate user
  const auth = verifyAuth(event.headers);
  if (!auth.authenticated) {
    return jsonResponse(401, { error: auth.error || 'Yetkisiz erişim. Lütfen giriş yapınız.' });
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { images, tone, userNote } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return jsonResponse(400, { error: 'Lütfen analiz edilecek en az bir fotoğraf yükleyin.' });
    }

    // Call Gemini Vision to analyze the photos
    const result = await analyzeArtwork(images, tone || 'atelier', userNote);

    return jsonResponse(200, {
      success: true,
      data: result,
    });
  } catch (error) {
    const message = (error as Error).message || 'Görsel analizi sırasında beklenmeyen bir hata oluştu.';
    return jsonResponse(500, {
      error: message,
    });
  }
};
