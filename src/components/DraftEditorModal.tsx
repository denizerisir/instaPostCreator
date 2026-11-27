import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Save,
  Tag,
  Palette,
  BookOpen,
  Send,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DraftItem, DraftStatus } from '../types';
import { apiRequest } from '../services/api';

interface DraftEditorModalProps {
  draft: DraftItem;
  onClose: () => void;
  onSave: (updated: DraftItem) => void;
  onDelete: (id: string) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const DraftEditorModal: React.FC<DraftEditorModalProps> = ({
  draft,
  onClose,
  onSave,
  onDelete,
  showToast,
}) => {
  const [caption, setCaption] = useState<string>(draft.caption);
  const [hashtags, setHashtags] = useState<string[]>(draft.hashtags || []);
  const [status, setStatus] = useState<DraftStatus>(draft.status);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [copiedSection, setCopiedSection] = useState<'caption' | 'hashtags' | 'both' | null>(null);

  // Regeneration state
  const [regeneratingCaption, setRegeneratingCaption] = useState<boolean>(false);
  const [regeneratingHashtags, setRegeneratingHashtags] = useState<boolean>(false);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [showTagInput, setShowTagInput] = useState<boolean>(false);

  // Copy helpers
  const copyToClipboard = async (text: string, type: 'caption' | 'hashtags' | 'both', title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(type);
      setTimeout(() => setCopiedSection(null), 2000);

      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#E0A96D', '#FFFFFF'],
        });
      } catch {}

      showToast(title, 'Metin panoya kopyalandı. Instagram uygulamasında yapıştırabilirsiniz.', 'success');
    } catch {
      showToast('Kopyalama Başarısız', 'Panoya kopyalama izni verilmedi.', 'error');
    }
  };

  const handleCopyCaption = () => {
    copyToClipboard(caption, 'caption', 'Açıklama Kopyalandı');
  };

  const handleCopyHashtags = () => {
    const formattedTags = hashtags.join(' ');
    copyToClipboard(formattedTags, 'hashtags', '5 Hashtag Kopyalandı');
  };

  const handleCopyBoth = () => {
    const combined = `${caption.trim()}\n\n.\n.\n${hashtags.join(' ')}`;
    copyToClipboard(combined, 'both', 'Açıklama + Hashtagler Birlikte Kopyalandı');
  };

  // Regeneration functions
  const handleRegenerateCaption = async () => {
    setRegeneratingCaption(true);
    try {
      const res = await apiRequest('/regenerate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'caption',
          currentAnalysis: draft.analysis,
          currentCaption: caption,
          toneKey: draft.tone || 'atelier',
        }),
      });

      if (res.data?.caption) {
        setCaption(res.data.caption);
        showToast('Açıklama Yenilendi', 'Yapay zekâ taze bir anlatımla yeni açıklama üretti.', 'success');
      }
    } catch (err: any) {
      showToast('Yenileme Hatası', err.message, 'error');
    } finally {
      setRegeneratingCaption(false);
    }
  };

  const handleRegenerateHashtags = async () => {
    setRegeneratingHashtags(true);
    try {
      const res = await apiRequest('/regenerate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'hashtags',
          currentAnalysis: draft.analysis,
          currentCaption: caption,
        }),
      });

      if (res.data?.hashtags && Array.isArray(res.data.hashtags)) {
        setHashtags(res.data.hashtags.slice(0, 5));
        showToast('Hashtagler Yenilendi', 'Eserle doğrudan alakalı tam 5 yeni hashtag oluşturuldu.', 'success');
      }
    } catch (err: any) {
      showToast('Yenileme Hatası', err.message, 'error');
    } finally {
      setRegeneratingHashtags(false);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    let tag = newTagInput.trim();
    if (!tag) return;
    if (!tag.startsWith('#')) tag = `#${tag}`;
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setHashtags(hashtags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = () => {
    const updated: DraftItem = {
      ...draft,
      caption,
      hashtags,
      status,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    showToast('Taslak Güncellendi', 'Yapılan değişiklikler kaydedildi.', 'success');
  };

  const activeImg = draft.images[activeImageIndex] || draft.images[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#1F1F1F]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/30">
              Taslak İnceleme & Düzenleme
            </span>
            <span className="text-xs text-zinc-400 hidden sm:inline">
              Oluşturulma: {new Date(draft.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-xl bg-[#E0A96D] hover:bg-[#F4D19B] text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Kaydet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2A2A2A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Photos & Artwork Analysis (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Main Active Photo */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#121212] border border-[#2A2A2A] shadow-inner group">
              {activeImg ? (
                <img
                  src={activeImg.url}
                  alt="Seçili Eser"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  Fotoğraf bulunamadı
                </div>
              )}
              <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-mono">
                {activeImageIndex + 1} / {draft.images.length}
              </span>
            </div>

            {/* Thumbnail selector if multiple images */}
            {draft.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {draft.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border transition-all ${
                      activeImageIndex === idx ? 'border-[#E0A96D] ring-2 ring-[#E0A96D]/30' : 'border-[#2A2A2A] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`Küçük Görsel ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* AI Art Analysis Card */}
            {draft.analysis && (
              <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#E0A96D] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Fotoğraf & Eser Analizi
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-500 font-medium">Konu & Kompozisyon:</span>
                    <p className="text-zinc-200 mt-0.5 leading-relaxed">{draft.analysis.subject}</p>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-medium">Atmosfer & Duygu:</span>
                    <p className="text-zinc-200 mt-0.5 leading-relaxed">{draft.analysis.mood}</p>
                  </div>

                  {draft.analysis.colors && draft.analysis.colors.length > 0 && (
                    <div>
                      <span className="text-zinc-500 font-medium">Renk Paleti:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {draft.analysis.colors.map((color, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-[#121212] border border-[#2A2A2A] text-[11px] text-zinc-300"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-zinc-500 font-medium">Stil & Teknik:</span>
                    <p className="text-zinc-300 mt-0.5 leading-relaxed">{draft.analysis.style}</p>
                  </div>

                  {draft.analysis.story && (
                    <div>
                      <span className="text-zinc-500 font-medium">Hikâye:</span>
                      <p className="text-zinc-400 mt-0.5 leading-relaxed text-[11px]">{draft.analysis.story}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Caption, Hashtags & Copying Tools (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. Quick Copy Action Bar (Top) */}
            <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl p-3 flex flex-wrap gap-2 items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-[#E0A96D]" />
                Hızlı Kopyalama:
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    copiedSection === 'caption'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#181818] text-zinc-300 border-[#2A2A2A] hover:border-[#E0A96D] hover:text-white'
                  }`}
                >
                  {copiedSection === 'caption' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Açıklamayı Kopyala</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyHashtags}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    copiedSection === 'hashtags'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#181818] text-zinc-300 border-[#2A2A2A] hover:border-[#E0A96D] hover:text-white'
                  }`}
                >
                  {copiedSection === 'hashtags' ? <Check className="w-3.5 h-3.5" /> : <Tag className="w-3.5 h-3.5" />}
                  <span>Hashtagleri Kopyala</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyBoth}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                    copiedSection === 'both'
                      ? 'bg-emerald-400 text-zinc-950'
                      : 'bg-[#E0A96D] hover:bg-[#F4D19B] text-zinc-950'
                  }`}
                >
                  {copiedSection === 'both' ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Açıklama + Hashtag Birlikte Kopyala</span>
                </button>
              </div>
            </div>

            {/* 2. Caption Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#E0A96D]" />
                  Instagram Açıklama Metni
                </label>
                
                <button
                  type="button"
                  disabled={regeneratingCaption}
                  onClick={handleRegenerateCaption}
                  className="text-xs text-[#E0A96D] hover:text-[#F4D19B] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                  title="Yapay zekâdan taze bir açıklama iste"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingCaption ? 'animate-spin' : ''}`} />
                  <span>{regeneratingCaption ? 'Yazılıyor...' : 'Yapay Zekâdan Yeniden Açıklama İste'}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={9}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Instagram paylaşım metni..."
                  className="w-full p-4 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#E0A96D] transition-colors leading-relaxed font-sans"
                />
                <div className="flex justify-between items-center text-[11px] text-zinc-500 px-1 mt-1">
                  <span>Karakter: {caption.length} / 2200</span>
                  <span>Kelime: {caption.trim() ? caption.trim().split(/\s+/).length : 0}</span>
                </div>
              </div>
            </div>

            {/* 3. 5 Hashtags Manager */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#E0A96D]" />
                  İlgili Hashtagler ({hashtags.length} / 5)
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTagInput(!showTagInput)}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Etiket Ekle</span>
                  </button>

                  <button
                    type="button"
                    disabled={regeneratingHashtags}
                    onClick={handleRegenerateHashtags}
                    className="text-xs text-[#E0A96D] hover:text-[#F4D19B] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingHashtags ? 'animate-spin' : ''}`} />
                    <span>{regeneratingHashtags ? 'Üretiliyor...' : 'Hashtagleri Yeniden Oluştur'}</span>
                  </button>
                </div>
              </div>

              {/* Tag Input Form if toggled */}
              {showTagInput && (
                <form onSubmit={handleAddCustomTag} className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="#etiket yazın..."
                    className="flex-1 px-3 py-1.5 bg-[#121212] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none focus:border-[#E0A96D]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#E0A96D] text-zinc-950 font-semibold text-xs rounded-lg"
                  >
                    Ekle
                  </button>
                </form>
              )}

              {/* Hashtag Badges */}
              <div className="flex flex-wrap gap-2 p-3 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl min-h-[48px]">
                {hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#121212] text-[#E0A96D] border border-[#2A2A2A] group hover:border-[#E0A96D]/50 transition-colors"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {hashtags.length === 0 && (
                  <span className="text-xs text-zinc-500 py-1">Hashtag bulunmuyor.</span>
                )}
              </div>
            </div>

            {/* 4. Draft Status & Delete Actions */}
            <div className="pt-2 border-t border-[#2A2A2A] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Taslak Durumu:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DraftStatus)}
                  className="bg-[#1F1F1F] border border-[#2A2A2A] text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#E0A96D]"
                >
                  <option value="draft">Taslak (İncelemede)</option>
                  <option value="edited">Düzenlendi (Paylaşıma Hazır)</option>
                  <option value="shared">Paylaşıldı (Instagram'da Yayınlandı)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Bu taslağı silmek istediğinizden emin misiniz?')) {
                    onDelete(draft.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Taslağı Sil</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
