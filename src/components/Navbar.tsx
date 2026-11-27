import React, { useEffect, useId, useRef, useState } from 'react';
import { Palette, PlusCircle, BookOpen, CheckSquare, Settings, LogOut, Menu, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'create' | 'drafts' | 'edited' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  draftCount: number;
  editedCount: number;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  count?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  draftCount,
  editedCount,
}) => {
  const { username, logout } = useAuth();
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const lastCollapsedWidthRef = useRef<number>(0);

  const [isWide, setIsWide] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);

  const supportsPopover =
    typeof HTMLElement !== 'undefined' &&
    Object.hasOwn(HTMLElement.prototype, 'popover');

  const navItems: NavItem[] = [
    { id: 'create', label: 'Yeni İçerik', icon: PlusCircle },
    { id: 'drafts', label: 'Taslaklarım', icon: BookOpen, count: draftCount },
    { id: 'edited', label: 'Düzenlenenler', icon: CheckSquare, count: editedCount },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  useEffect(() => {
    const header = headerRef.current;
    const inner = innerRef.current;
    const menu = menuRef.current;
    if (!header || !inner || !menu) return;

    let rafId = 0;

    const syncLayout = (forceMeasure = false) => {
      const currentWidth = header.clientWidth;
      const currentlyWide = header.classList.contains('is-wide');

      // While collapsed, only remeasure when the header grows or item badges change
      if (!forceMeasure && !currentlyWide && currentWidth <= lastCollapsedWidthRef.current) {
        return;
      }

      let wasOpen = false;
      if (supportsPopover) {
        try {
          wasOpen = menu.matches(':popover-open');
        } catch {
          wasOpen = false;
        }
      }

      header.classList.add('is-measuring');
      header.classList.add('is-wide');
      menu.removeAttribute('popover');

      const fitsInline = inner.scrollWidth <= inner.clientWidth;

      if (fitsInline) {
        lastCollapsedWidthRef.current = 0;
        setIsWide(true);
        setMenuOpen(false);
        setFallbackOpen(false);
      } else {
        header.classList.remove('is-wide');
        menu.setAttribute('popover', 'auto');
        lastCollapsedWidthRef.current = header.clientWidth;
        setIsWide(false);

        if (wasOpen && supportsPopover) {
          try {
            menu.showPopover();
          } catch {
            // Ignore if popover cannot be reopened in current state
          }
        }
      }

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        header.classList.remove('is-measuring');
      });
    };

    lastCollapsedWidthRef.current = 0;
    syncLayout(true);

    const observer = new ResizeObserver(() => {
      syncLayout(false);
    });
    observer.observe(header);
    observer.observe(menu);

    let cancelled = false;
    document.fonts?.ready?.then(() => {
      if (!cancelled) syncLayout(true);
    });

    const handleToggle = (event: Event) => {
      const toggleEvent = event as ToggleEvent;
      setMenuOpen(toggleEvent.newState === 'open');
    };
    menu.addEventListener('toggle', handleToggle);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      menu.removeEventListener('toggle', handleToggle);
    };
  }, [draftCount, editedCount, supportsPopover]);

  useEffect(() => {
    if (supportsPopover || !fallbackOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !headerRef.current?.contains(target)) {
        setFallbackOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFallbackOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fallbackOpen, supportsPopover]);

  const handleSelectTab = (tab: ActiveTab) => {
    onTabChange(tab);
    if (!isWide) {
      if (supportsPopover) {
        try {
          menuRef.current?.hidePopover();
        } catch {
          // Ignore if already closed
        }
      } else {
        setFallbackOpen(false);
      }
    }
  };

  const handleMenuButtonClick = () => {
    if (!supportsPopover) {
      setFallbackOpen((prev) => !prev);
    }
  };

  const isMenuExpanded = supportsPopover ? menuOpen : fallbackOpen;

  return (
    <header
      ref={headerRef}
      className="site-header sticky top-0 z-40 bg-[#181818]/95 backdrop-blur-md border-b border-[#2A2A2A]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={innerRef}
          className="header-inner flex items-center justify-between h-16 gap-3 sm:gap-4"
        >
          {/* Studio Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-[#E0A96D] shadow-md shrink-0">
              <Palette className="w-5 h-5" aria-hidden={true} />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight leading-tight">
                  İçerik Stüdyosu
                </span>
                <span className="w-fit text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/30 leading-none">
                  Resim Atölyesi
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden md:block">Instagram Asistanı</p>
            </div>
          </div>

          {/* Primary Navigation (single semantic landmark for narrow popover and wide inline) */}
          <nav className="site-nav flex items-center" aria-label="Ana gezinme">
            <button
              type="button"
              onClick={handleMenuButtonClick}
              aria-controls={menuId}
              aria-expanded={isMenuExpanded}
              {...({
                popoverTarget: menuId,
                popoverTargetAction: 'toggle',
              } as Record<string, string>)}
              className="menu-button flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#1F1F1F] border border-[#2A2A2A] text-zinc-200 hover:text-white hover:border-[#E0A96D]/50 transition-colors"
            >
              <Menu className="w-4 h-4 text-[#E0A96D]" aria-hidden={true} />
              <span>Menü</span>
            </button>

            <ul
              ref={menuRef}
              id={menuId}
              className={`site-menu list-none ${!supportsPopover && fallbackOpen ? 'is-fallback-open' : ''}`}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <li key={item.id} className={isWide ? '' : 'w-full'}>
                    <button
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center justify-between gap-2 px-3.5 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                        isWide ? 'rounded-xl' : 'w-full rounded-lg'
                      } ${
                        isActive
                          ? 'bg-[#E0A96D] text-zinc-950 shadow-md shadow-[#E0A96D]/10'
                          : 'text-zinc-300 hover:text-white hover:bg-[#1F1F1F]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4 shrink-0" aria-hidden={true} />
                        <span>{item.label}</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        {typeof item.count === 'number' && item.count > 0 && (
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                              isActive
                                ? 'bg-zinc-950/20 text-zinc-950'
                                : 'bg-[#2A2A2A] text-zinc-300'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                        {!isWide && isActive && (
                          <Check className="w-3.5 h-3.5 text-zinc-950 shrink-0" aria-hidden={true} />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-zinc-200">{username || 'Sanatçı'}</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Aktif Oturum
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Güvenli Çıkış"
              aria-label="Güvenli Çıkış"
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-[#1F1F1F] transition-colors border border-transparent hover:border-[#2A2A2A]"
            >
              <LogOut className="w-4 h-4" aria-hidden={true} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
