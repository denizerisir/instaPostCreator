import { DraftItem, StudioProfile } from '../types';

const TOKEN_KEY = 'studio_auth_token';
const USER_KEY = 'studio_auth_user';
const DRAFTS_LOCAL_KEY = 'studio_local_drafts';
const SETTINGS_KEY = 'studio_settings';

export const storage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): string | null {
    return localStorage.getItem(USER_KEY);
  },
  setUser(user: string) {
    localStorage.setItem(USER_KEY, user);
  },
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },

  getLocalDrafts(): DraftItem[] {
    try {
      const data = localStorage.getItem(DRAFTS_LOCAL_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  setLocalDrafts(drafts: DraftItem[]) {
    try {
      localStorage.setItem(DRAFTS_LOCAL_KEY, JSON.stringify(drafts));
    } catch (e) {
      console.warn('LocalStorage limit reached for images, optimizing...', e);
    }
  },

  getSettings(): StudioProfile {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      studioName: 'Atölye Kolektif',
      artistName: 'İbrahim Çam',
      handle: '@resimstudyosu',
      defaultTone: 'atelier',
      signatureText: 'Atölyemizden yeni bir çalışma. Detaylar ve atölye randevusu için biyografideki bağlantıyı ziyaret edebilirsiniz.',
    };
  },
  setSettings(settings: StudioProfile) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
};

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = storage.getToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || `İşlem başarısız oldu (${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}
