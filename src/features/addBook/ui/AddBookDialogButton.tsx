'use client';

import { useEffect, useRef, useState } from 'react';
import Dialog from '@/shared/ui/Dialog/Dialog';
import { Button } from '@/shared/ui/Button';
import { AddIcon } from '@/shared/ui/icons';
import { AddBookForm } from './AddBookForm';

export function AddBookDialogButton() {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  function clearCloseTimer() {
    if (!closeTimerRef.current) return;

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function closeDialog() {
    clearCloseTimer();
    setIsOpen(false);
  }

  useEffect(() => clearCloseTimer, []);

  return (
    <>
      <Dialog
        title="Добавить книгу"
        closeLabel="Вернуться к книгам"
        isOpen={isOpen}
        onClose={closeDialog}
        className="max-w-105 gap-5 px-5 py-10 md:px-8"
      >
        <AddBookForm />
      </Dialog>
      <Button
        type="button"
        variant="primary"
        className="h-10 gap-2 px-5 text-sm"
        onClick={() => {
          clearCloseTimer();
          setIsOpen(true);
        }}
      >
        <AddIcon className="h-4 w-4" />
        Добавить книгу
      </Button>
    </>
  );
}

export default AddBookDialogButton;
