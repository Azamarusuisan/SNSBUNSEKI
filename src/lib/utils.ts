import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function platformLabel(platform: string): string {
  const labels: Record<string, string> = {
    x: 'X',
    instagram: 'Instagram',
    note: 'note',
    general: '全般',
    video: '動画',
    other: 'その他',
  };
  return labels[platform] || platform;
}

export function platformColor(platform: string): string {
  const colors: Record<string, string> = {
    x: 'bg-neutral-900 text-white',
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    note: 'bg-green-600 text-white',
    general: 'bg-gray-500 text-white',
    video: 'bg-blue-600 text-white',
  };
  return colors[platform] || 'bg-gray-400 text-white';
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    todo: '未着手',
    done: '完了',
    postponed: '延期',
    skipped: 'スキップ',
  };
  return labels[status] || status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    todo: 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
    postponed: 'bg-orange-100 text-orange-800',
    skipped: 'bg-gray-100 text-gray-600',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
