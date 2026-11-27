import { Handler } from '@netlify/functions';
import { verifyAuth, jsonResponse } from './utils/auth';
import { regenerateContent } from './utils/gemini';

export const handler: Handler = async (event) => {
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

  // Verify auth
  const auth = verifyAuth(event.headers);
  if (!auth.authenticated) {
    return jsonResponse(401, { error: auth.error || 'Yetkisiz erişim.' });
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { type, currentAnalysis, currentCaption, toneKey, userGuidance } = body;

    if (!type || (type !== 'caption' && type !== 'hashtags')) {
      return jsonResponse(400, { error: "Geçersiz işlem tipi. 'caption' veya 'hashtags' olmalıdır." });
    }

    const result = await regenerateContent({
      type,
      currentAnalysis,
      currentCaption,
      toneKey,
      userGuidance,
    });

    return jsonResponse(200, {
      success: true,
      data: result,
    });
  } catch (error) {
    return jsonResponse(500, {
      error: (error as Error).message || 'Yeniden üretim sırasında bir hata oluştu.',
    });
  }
};
