export interface DraftImage {
  id: string;
  url: string; // base64 or hosted URL
  name?: string;
  size?: number;
}

export interface ArtworkAnalysis {
  subject: string;
  mood: string;
  colors: string[];
  style: string;
  story: string;
}

export type DraftStatus = 'draft' | 'edited' | 'shared';

export interface DraftItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  images: DraftImage[];
  caption: string;
  hashtags: string[];
  status: DraftStatus;
  analysis?: ArtworkAnalysis;
  tone?: string;
  userNote?: string;
}

export interface StudioProfile {
  studioName: string;
  artistName: string;
  handle: string;
  defaultTone: string;
  signatureText: string;
}

export interface UserSession {
  username: string;
  token: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
