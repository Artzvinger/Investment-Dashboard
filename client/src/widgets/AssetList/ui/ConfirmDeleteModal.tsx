import Modal from '../../../shared/ui/Modal/Modal';

interface ConfirmDeleteModalProps {
    ticker: string;
    name: string;
    isDeleting: boolean;
    isError: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmDeleteModal({
                                ticker,
                                name,
                                isDeleting,
                                isError,
                                onConfirm,
                                onCancel,
                            }: ConfirmDeleteModalProps) {
    return (
        <Modal
            isOpen
            onClose={onCancel}
            title="Удалить акцию?"
        >
            <div className="confirm-delete">
                <p className="confirm-delete__text">
                    Вы уверены, что хотите удалить{' '}
                    <strong>{ticker}</strong>
                    {name ? ` (${name})` : ''} из портфеля?
                </p>

                <p className="confirm-delete__hint">
                    Это действие нельзя отменить.
                </p>

                {isError && (
                    <p className="confirm-delete__error">
                        Не удалось удалить акцию. Попробуйте ещё раз.
                    </p>
                )}

                <div className="confirm-delete__actions">
                    <button
                        type="button"
                        className="button-secondary"
                        onClick={onCancel}
                        disabled={isDeleting}
                    >
                        Отмена
                    </button>

                    <button
                        type="button"
                        className="button-danger"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Удаление...' : 'Удалить'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmDeleteModal;
