import { Handler } from '@netlify/functions';
import { verifyAuth, jsonResponse } from './utils/auth';
import { getStore } from '@netlify/blobs';

export interface DraftItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    url: string; // Base64 or CDN URL
    name?: string;
  }>;
  caption: string;
  hashtags: string[];
  status: 'draft' | 'edited' | 'shared';
  analysis?: {
    subject: string;
    mood: string;
    colors: string[];
    style: string;
    story: string;
  };
  tone?: string;
}

// In-memory fallback cache for development or when Netlify Blobs context is not present
const devMemoryStore = new Map<string, DraftItem>();

async function getDraftsStore() {
  try {
    // Only attempt Netlify Blobs if context or token is present
    if (process.env.NETLIFY_BLOBS_CONTEXT || process.env.SITE_ID || process.env.NETLIFY_SITE_ID) {
      return getStore('studio_drafts');
    }
  } catch {
    // fallback
  }
  return null;
}

export const handler: Handler = async (event) => {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  // 1. Authenticate
  const auth = verifyAuth(event.headers);
  if (!auth.authenticated) {
    return jsonResponse(401, { error: auth.error || 'Yetkisiz erişim.' });
  }

  const store = await getDraftsStore();

  try {
    // GET: List all drafts or get one
    if (event.httpMethod === 'GET') {
      const draftId = event.queryStringParameters?.id;

      if (draftId) {
        if (store) {
          const item = await store.get(draftId, { type: 'json' });
          if (!item) return jsonResponse(404, { error: 'Taslak bulunamadı.' });
          return jsonResponse(200, { draft: item });
        } else {
          const item = devMemoryStore.get(draftId);
          if (!item) return jsonResponse(404, { error: 'Taslak bulunamadı.' });
          return jsonResponse(200, { draft: item });
        }
      }

      // List all
      let drafts: DraftItem[] = [];
      if (store) {
        const { blobs } = await store.list();
        for (const blob of blobs) {
          const item = (await store.get(blob.key, { type: 'json' })) as DraftItem;
          if (item) drafts.push(item);
        }
      } else {
        drafts = Array.from(devMemoryStore.values());
      }

      // Sort newest first
      drafts.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

      return jsonResponse(200, { drafts });
    }

    // POST: Create new draft
    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const newDraft: DraftItem = {
        id: body.id || `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: body.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        images: body.images || [],
        caption: body.caption || '',
        hashtags: body.hashtags || [],
        status: body.status || 'draft',
        analysis: body.analysis,
        tone: body.tone,
      };

      if (store) {
        await store.setJSON(newDraft.id, newDraft);
      } else {
        devMemoryStore.set(newDraft.id, newDraft);
      }

      return jsonResponse(201, { success: true, draft: newDraft });
    }

    // PUT: Update existing draft
    if (event.httpMethod === 'PUT') {
      const body = event.body ? JSON.parse(event.body) : {};
      const draftId = body.id || event.queryStringParameters?.id;

      if (!draftId) {
        return jsonResponse(400, { error: 'Güncellenecek taslak ID belirtilmedi.' });
      }

      let existing: DraftItem | null = null;
      if (store) {
        existing = (await store.get(draftId, { type: 'json' })) as DraftItem;
      } else {
        existing = devMemoryStore.get(draftId) || null;
      }

      const updatedDraft: DraftItem = {
        ...(existing || {}),
        ...body,
        id: draftId,
        updatedAt: new Date().toISOString(),
      };

      if (store) {
        await store.setJSON(draftId, updatedDraft);
      } else {
        devMemoryStore.set(draftId, updatedDraft);
      }

      return jsonResponse(200, { success: true, draft: updatedDraft });
    }

    // DELETE: Delete draft
    if (event.httpMethod === 'DELETE') {
      const draftId = event.queryStringParameters?.id;
      if (!draftId) {
        return jsonResponse(400, { error: 'Silinecek taslak ID belirtilmedi.' });
      }

      if (store) {
        await store.delete(draftId);
      } else {
        devMemoryStore.delete(draftId);
      }

      return jsonResponse(200, { success: true, message: 'Taslak başarıyla silindi.' });
    }

    return jsonResponse(405, { error: 'Desteklenmeyen HTTP yöntemi.' });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Taslak işlemi gerçekleştirilirken bir hata oluştu.',
      details: (error as Error).message,
    });
  }
};
