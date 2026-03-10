'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig = {
  danger: {
    icon: AlertCircle,
    iconClass: 'text-red-500 bg-red-50',
    buttonVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500 bg-amber-50',
    buttonClass: 'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400',
  },
  info: {
    icon: Info,
    iconClass: 'text-brand-600 bg-brand-50',
    buttonVariant: 'primary' as const,
  },
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '確認',
  cancelLabel = 'キャンセル',
  variant = 'info',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm">
      <div className="flex gap-4">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', config.iconClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
          <p className="text-sm text-neutral-500 mt-1">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          {cancelLabel}
        </Button>
        {'buttonVariant' in config ? (
          <Button variant={config.buttonVariant} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onConfirm}
            className={config.buttonClass}
          >
            {confirmLabel}
          </Button>
        )}
      </div>
    </Modal>
  );
}
