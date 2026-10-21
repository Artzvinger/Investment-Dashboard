
import { useEffect, type ReactNode, type MouseEvent } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

function Modal({
                   isOpen,
                   onClose,
                   title,
                   children,
               }: ModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={handleOverlayClick}
        >
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label={title || 'Диалоговое окно'}
            >
                <button
                    type="button"
                    className="modal__close"
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    ×
                </button>

                {title && (
                    <h2 className="modal__title">
                        {title}
                    </h2>
                )}

                <div className="modal__content">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
