interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

function Pagination({
                        page,
                        totalPages,
                        onPageChange,
                    }: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="pagination">
            <button
                type="button"
                className="button-secondary"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ← Назад
            </button>

            <span className="pagination__info">
                Страница {page} из {totalPages}
            </span>

            <button
                type="button"
                className="button-secondary"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Вперёд →
            </button>
        </div>
    );
}

export default Pagination;
