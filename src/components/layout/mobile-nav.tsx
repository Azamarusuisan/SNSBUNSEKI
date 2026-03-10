'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarCheck,
  PenTool,
  FileText,
  BarChart3,
  Compass,
  MessageCircle,
  Settings,
  MoreHorizontal,
  X,
} from 'lucide-react';

const mainItems = [
  { href: '/dashboard', label: 'ホーム', icon: LayoutDashboard },
  { href: '/today', label: '今日', icon: CalendarCheck },
  { href: '/create', label: '作成', icon: PenTool },
  { href: '/chat', label: 'AI相談', icon: MessageCircle },
];

const moreItems = [
  { href: '/posts', label: '投稿管理', icon: FileText },
  { href: '/analysis', label: '分析', icon: BarChart3 },
  { href: '/trends', label: 'トレンド', icon: Compass },
  { href: '/settings', label: '設定', icon: Settings },
];

const moreHrefs = new Set(moreItems.map(item => item.href));

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isMoreActive = moreHrefs.has(pathname);

  const close = useCallback(() => setIsOpen(false), []);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Slide-up drawer */}
      <div
        className={cn(
          'lg:hidden fixed bottom-16 left-0 right-0 z-50 transition-transform duration-300 ease-out',
          'pb-[env(safe-area-inset-bottom)]',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="bg-white rounded-t-2xl shadow-lg border border-neutral-200 border-b-0 mx-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-sm font-semibold text-neutral-900">その他のメニュー</span>
            <button
              onClick={close}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="px-3 pb-4 space-y-1">
            {moreItems.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom navigation bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {mainItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg text-xs transition-colors',
                  isActive
                    ? 'text-brand-600 font-semibold'
                    : 'text-neutral-400'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg text-xs transition-colors',
              isMoreActive || isOpen
                ? 'text-brand-600 font-semibold'
                : 'text-neutral-400'
            )}
            aria-label="その他のメニューを開く"
            aria-expanded={isOpen}
          >
            <MoreHorizontal className="w-5 h-5" />
            その他
          </button>
        </div>
      </nav>
    </>
  );
}
