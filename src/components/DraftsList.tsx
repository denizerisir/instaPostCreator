import React, { useState } from 'react';
import { Search, Filter, BookOpen, PlusCircle } from 'lucide-react';
import { DraftItem, DraftStatus } from '../types';
import { DraftCard } from './DraftCard';

interface DraftsListProps {
  drafts: DraftItem[];
  defaultStatusFilter?: 'all' | 'edited' | 'shared';
  onEditDraft: (draft: DraftItem) => void;
  onDeleteDraft: (id: string) => void;
  onNavigateCreate: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const DraftsList: React.FC<DraftsListProps> = ({
  drafts,
  defaultStatusFilter = 'all',
  onEditDraft,
  onDeleteDraft,
  onNavigateCreate,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DraftStatus>(defaultStatusFilter as any);

  // Filter drafts
  const filteredDrafts = drafts.filter((draft) => {
    // Status filter
    if (statusFilter !== 'all' && draft.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inCaption = draft.caption.toLowerCase().includes(q);
      const inTags = draft.hashtags.some((t) => t.toLowerCase().includes(q));
      const inSubject = draft.analysis?.subject?.toLowerCase().includes(q) || false;
      return inCaption || inTags || inSubject;
    }

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {defaultStatusFilter === 'edited' ? 'Düzenlenen İçerikler' : 'İçerik Taslaklarım'}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {defaultStatusFilter === 'edited'
              ? 'Kontrol edilip paylaşıma hazır hale getirilen ve yayınlanan içerikleriniz.'
              : 'Yapay zekâ tarafından oluşturulan tüm içerik taslaklarınız ve arşiviniz.'}
          </p>
        </div>

        <button
          onClick={onNavigateCreate}
          className="px-4 py-2.5 rounded-xl bg-[#E0A96D] hover:bg-[#F4D19B] text-zinc-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni İçerik Oluştur</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Açıklama, etiket veya konu ara..."
            className="w-full pl-10 pr-4 py-2 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E0A96D]"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-zinc-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filtre:
          </span>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-zinc-200 text-zinc-950'
                : 'bg-[#1F1F1F] text-zinc-400 hover:text-white border border-[#2A2A2A]'
            }`}
          >
            Tümü ({drafts.length})
          </button>

          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'draft'
                ? 'bg-[#E0A96D] text-zinc-950'
                : 'bg-[#1F1F1F] text-zinc-400 hover:text-white border border-[#2A2A2A]'
            }`}
          >
            Taslaklar ({drafts.filter((d) => d.status === 'draft').length})
          </button>

          <button
            onClick={() => setStatusFilter('edited')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'edited'
                ? 'bg-amber-400 text-zinc-950'
                : 'bg-[#1F1F1F] text-zinc-400 hover:text-white border border-[#2A2A2A]'
            }`}
          >
            Düzenlendi ({drafts.filter((d) => d.status === 'edited').length})
          </button>

          <button
            onClick={() => setStatusFilter('shared')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'shared'
                ? 'bg-emerald-400 text-zinc-950'
                : 'bg-[#1F1F1F] text-zinc-400 hover:text-white border border-[#2A2A2A]'
            }`}
          >
            Paylaşıldı ({drafts.filter((d) => d.status === 'shared').length})
          </button>
        </div>
      </div>

      {/* Drafts Grid */}
      {filteredDrafts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onEdit={onEditDraft}
              onDelete={onDeleteDraft}
              showToast={showToast}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-zinc-500 mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-zinc-200">
              {searchQuery ? 'Aramanızla eşleşen taslak bulunamadı' : 'Henüz içerik taslağınız yok'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Farklı bir arama terimi deneyebilir veya filtreyi değiştirebilirsiniz.'
                : 'Eserlerinizin fotoğraflarını yükleyerek yapay zekâ destekli ilk Instagram taslağınızı oluşturun.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={onNavigateCreate}
              className="px-4 py-2 rounded-xl bg-[#E0A96D] hover:bg-[#F4D19B] text-zinc-950 text-xs font-bold transition-all shadow"
            >
              Fotoğraf Yükle ve Başla
            </button>
          )}
        </div>
      )}

    </div>
  );
};
