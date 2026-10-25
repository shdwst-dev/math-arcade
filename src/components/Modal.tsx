import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

type ModalProps = {
  /** Id del elemento que titula el diálogo (para lectores de pantalla). */
  labelledBy: string;
  /** Si se define, Esc cierra el diálogo. Los modales de fin de juego no lo definen. */
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal accesible: enfoca su contenido, atrapa el Tab, cierra con Esc y
 * devuelve el foco al cerrar. Se pinta en `body` porque la animación de entrada
 * del layout deja un `transform` que rompería el `position: fixed`.
 */
export const Modal: React.FC<ModalProps> = ({
  labelledBy,
  onClose,
  className,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panelRef.current)?.focus();
    return () => previous?.focus?.();
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && onClose) {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
    );
    if (items.length === 0) return;
    const firstItem = items[0];
    const lastItem = items[items.length - 1];
    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={clsx(
          'max-h-full w-full max-w-md overflow-y-auto focus:outline-none',
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
