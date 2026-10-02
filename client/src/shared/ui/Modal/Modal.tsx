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
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div onClick={handleOverlayClick}>
            <div>
                <button
                    type="button"
                    onClick={onClose}
                >
                    ×
                </button>

                {title && <h2>{title}</h2>}

                {children}
            </div>
        </div>
    );
}

export default Modal;
