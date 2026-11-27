import React from 'react';
import { Palette, PlusCircle, BookOpen, CheckSquare, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'create' | 'drafts' | 'edited' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  draftCount: number;
  editedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  draftCount,
  editedCount,
}) => {
  const { username, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#181818]/90 backdrop-blur-md border-b border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Studio Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-[#E0A96D] shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">İçerik Stüdyosu</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/30">
                  Resim Atölyesi
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">Instagram Asistanı</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            <button
              onClick={() => onTabChange('create')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'create'
                  ? 'bg-[#E0A96D] text-zinc-950 shadow-md shadow-[#E0A96D]/10'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1F1F1F]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yeni İçerik</span>
            </button>

            <button
              onClick={() => onTabChange('drafts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'drafts'
                  ? 'bg-[#E0A96D] text-zinc-950 shadow-md shadow-[#E0A96D]/10'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1F1F1F]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Taslaklarım</span>
              {draftCount > 0 && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'drafts' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-[#2A2A2A] text-zinc-300'
                }`}>
                  {draftCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('edited')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'edited'
                  ? 'bg-[#E0A96D] text-zinc-950 shadow-md shadow-[#E0A96D]/10'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1F1F1F]'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Düzenlenenler</span>
              {editedCount > 0 && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'edited' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-[#2A2A2A] text-zinc-300'
                }`}>
                  {editedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-[#E0A96D] text-zinc-950 shadow-md shadow-[#E0A96D]/10'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1F1F1F]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Ayarlar</span>
            </button>
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-zinc-200">{username || 'Sanatçı'}</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Aktif Oturum
              </span>
            </div>

            <button
              onClick={logout}
              title="Güvenli Çıkış"
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-[#1F1F1F] transition-colors border border-transparent hover:border-[#2A2A2A]"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
