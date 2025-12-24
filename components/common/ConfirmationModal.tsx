import React from 'react';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Ok',
  cancelText = 'Cancel',
  confirmVariant = 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-m bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-in fade-in zoom-in duration-200">
        <div className="bg-surface border border-outline rounded-large shadow-elevation-3 p-[20px]">
          <h2 className="text-title-large font-medium text-onSurface mb-s">{title}</h2>
          <p className="text-body-secondary text-onSurfaceVariant mb-l">{message}</p>
          <div className="flex flex-col gap-s">
            <Button onClick={onConfirm} variant={confirmVariant}>
              {confirmText}
            </Button>
            {onCancel && (
              <Button onClick={onCancel} variant="secondary">
                {cancelText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};