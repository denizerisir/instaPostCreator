import React, { useState } from 'react';
import { Copy, Check, Calendar, FileEdit, Trash2, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DraftItem } from '../types';

interface DraftCardProps {
  draft: DraftItem;
  onEdit: (draft: DraftItem) => void;
  onDelete: (id: string) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const DraftCard: React.FC<DraftCardProps> = ({ draft, onEdit, onDelete, showToast }) => {
  const [copiedType, setCopiedType] = useState<'caption' | 'both' | null>(null);

  const mainImage = draft.images[0]?.url;

  const copyBoth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const combined = `${draft.caption.trim()}\n\n.\n.\n${draft.hashtags.join(' ')}`;
    navigator.clipboard.writeText(combined);
    setCopiedType('both');
    setTimeout(() => setCopiedType(null), 2000);

    try {
      confetti({ particleCount: 20, spread: 35, origin: { y: 0.8 }, colors: ['#E0A96D'] });
    } catch {}

    showToast('Kopyalandı', 'Açıklama ve 5 hashtag birlikte panoya kopyalandı.', 'success');
  };

  const copyCaption = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(draft.caption);
    setCopiedType('caption');
    setTimeout(() => setCopiedType(null), 2000);
    showToast('Açıklama Kopyalandı', 'Sadece açıklama metni panoya alındı.', 'success');
  };

  const getStatusBadge = () => {
    switch (draft.status) {
      case 'shared':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Paylaşıldı</span>;
      case 'edited':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Düzenlendi</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">Taslak</span>;
    }
  };

  return (
    <div
      onClick={() => onEdit(draft)}
      className="group bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden hover:border-[#E0A96D]/50 transition-all shadow-lg flex flex-col cursor-pointer"
    >
      {/* Thumbnail Header */}
      <div className="relative aspect-[4/3] bg-[#121212] overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt="Taslak Görseli"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600">
            Fotoğraf yok
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
          {getStatusBadge()}
          {draft.images.length > 1 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
              +{draft.images.length - 1} Fotoğraf
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Bu taslağı silmek istediğinizden emin misiniz?')) {
              onDelete(draft.id);
            }
          }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 text-zinc-400 hover:text-rose-400 hover:bg-black/90 transition-colors opacity-0 group-hover:opacity-100"
          title="Taslağı Sil"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-2">
          {/* Date */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(draft.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Caption Excerpt */}
          <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed font-sans">
            {draft.caption || 'Açıklama girilmemiş...'}
          </p>

          {/* Hashtags preview */}
          {draft.hashtags && draft.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {draft.hashtags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F1F1F] text-[#E0A96D] border border-[#2A2A2A]"
                >
                  {tag}
                </span>
              ))}
              {draft.hashtags.length > 3 && (
                <span className="text-[10px] text-zinc-500 py-0.5">
                  +{draft.hashtags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#2A2A2A] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(draft);
            }}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold transition-colors"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Düzenle</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={copyCaption}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                copiedType === 'caption'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#1F1F1F] text-zinc-300 border-[#2A2A2A] hover:border-[#E0A96D]'
              }`}
              title="Açıklamayı Kopyala"
            >
              {copiedType === 'caption' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={copyBoth}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                copiedType === 'both'
                  ? 'bg-emerald-400 text-zinc-950'
                  : 'bg-[#E0A96D] hover:bg-[#F4D19B] text-zinc-950 shadow'
              }`}
              title="Açıklama + 5 Hashtag Birlikte Kopyala"
            >
              {copiedType === 'both' ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
              <span className="text-[11px]">Tümünü Kopyala</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
