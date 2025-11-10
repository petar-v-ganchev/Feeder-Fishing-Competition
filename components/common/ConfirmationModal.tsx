
import React from 'react';
import { Button } from './Button';
import { Card } from './Card';

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
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
      <Card className="w-full max-w-md">
        <h2 id="confirmation-title" className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} className="!w-auto !py-2 px-6">
              {cancelText}
            </Button>
          )}
          <Button variant={confirmVariant} onClick={onConfirm} className="!w-auto !py-2 px-6">
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
};
