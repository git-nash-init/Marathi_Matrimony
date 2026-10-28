import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, title, message, confirmLabel, cancelLabel, busy = false, onConfirm, onCancel,
}) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title}>
    <p style={{ margin: '0 0 20px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{message}</p>
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
      <Button variant="outline" size="sm" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
      <Button variant="primary" size="sm" onClick={onConfirm} disabled={busy}>{confirmLabel}</Button>
    </div>
  </Modal>
);
