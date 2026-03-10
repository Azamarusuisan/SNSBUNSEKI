'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, description, size = 'md', children }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // Body scroll lock + escape key
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    // Auto-focus first button in content
    requestAnimationFrame(() => {
      const firstButton = contentRef.current?.querySelector('button:not([data-modal-close])');
      if (firstButton instanceof HTMLElement) firstButton.focus();
    });

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-modal-backdrop-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Content */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full bg-white rounded-xl shadow-xl animate-modal-content-in',
          sizeClasses[size]
        )}
      >
        {/* Close button */}
        <button
          data-modal-close
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors"
          aria-label="閉じる"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-6">
          {title && (
            <div className="mb-4 pr-6">
              <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
              {description && (
                <p className="text-sm text-neutral-500 mt-1">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }
  return modal;
}
