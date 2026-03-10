'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

const iconMap: Record<ToastType, string> = {
  success: '\u2713',
  error: '\u2715',
  info: '\u2139',
  warning: '\u26A0',
};

const styleMap: Record<ToastType, string> = {
  success: 'bg-white border-green-200 text-green-800',
  error: 'bg-white border-red-200 text-red-800',
  info: 'bg-white border-blue-200 text-blue-800',
  warning: 'bg-white border-amber-200 text-amber-800',
};

const iconBgMap: Record<ToastType, string> = {
  success: 'bg-green-100 text-green-600',
  error: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-600',
  warning: 'bg-amber-100 text-amber-600',
};

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const enterTimer = requestAnimationFrame(() => setVisible(true));
    const dismissTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(item.id), 300);
    }, 3000);
    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [item.id, onDismiss]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onDismiss(item.id), 300);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-black/5 backdrop-blur-sm transition-all duration-300 ease-out max-w-sm w-full pointer-events-auto',
        styleMap[item.type],
        visible && !exiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
      )}
    >
      <span
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
          iconBgMap[item.type],
        )}
      >
        {iconMap[item.type]}
      </span>
      <p className="text-sm font-medium flex-1 leading-snug">{item.message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
      >
        <X className="w-3.5 h-3.5 opacity-50" />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(item => (
        <Toast key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
