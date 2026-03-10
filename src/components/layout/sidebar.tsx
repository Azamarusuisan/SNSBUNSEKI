'use client';

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
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/today', label: '今日の運用', icon: CalendarCheck },
  { href: '/create', label: 'コンテンツ作成', icon: PenTool },
  { href: '/posts', label: '投稿ログ', icon: FileText },
  { href: '/analysis', label: '分析', icon: BarChart3 },
  { href: '/trends', label: '参考投稿', icon: Compass },
  { href: '/chat', label: 'AI相談', icon: MessageCircle },
  { href: '/settings', label: '設定', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-white border-r border-neutral-200">
      <div className="flex items-center h-14 px-5 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <h1 className="text-lg font-bold text-neutral-900">SNS Growth OS</h1>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
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
    </aside>
  );
}
