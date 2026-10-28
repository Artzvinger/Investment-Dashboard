import { useEffect, useMemo, useState } from 'react';

import { useMultipleStocks } from '../../../entities/stock/model/moexQueries';
import {
    useDeleteStockMutation,
    useStocksQuery,
} from '../../../entities/stock/model/stockQueries';
import {
    formatMoney,
    formatPercent,
} from '../../../shared/lib/format';
import Pagination from '../../../shared/ui/Pagination/Pagination';

import { useAssetListParams } from '../model/useAssetListParams';

import AddAssetForm from './AddAssetForm';
import AssetDetailsModal from './AssetDetailsModal';
import AssetItem from './AssetItem';
import AssetListToolbar from './AssetListToolbar';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const EMPTY_SUMMARY = {
    invested: 0,
    value: 0,
    profit: 0,
    profitPercent: 0,
};

function AssetList() {
    const {
        params,
        searchInput,
        setSearchInput,
        updateParams,
    } = useAssetListParams();

    const {
        data,
        isLoading,
        isFetching,
        error,
    } = useStocksQuery(params);

    const deleteStockMutation = useDeleteStockMutation();

    const [selectedStockId, setSelectedStockId] = useState<number | null>(
        null,
    );

    const [pendingDelete, setPendingDelete] = useState<{
        id: number;
        ticker: string;
        name: string;
    } | null>(null);

    const stocks = data?.items ?? [];
    const summary = data?.summary ?? EMPTY_SUMMARY;
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const tickers = useMemo(
        () => Array.from(new Set(stocks.map((stock) => stock.ticker))),
        [stocks],
    );

    const { data: quotes = [] } = useMultipleStocks(tickers);

    const quotesByTicker = useMemo(
        () => new Map(quotes.map((quote) => [quote.ticker, quote] as const)),
        [quotes],
    );

    const rows = useMemo(
        () =>
            stocks.map((stock) => ({
                stock,
                quote: quotesByTicker.get(stock.ticker),
            })),
        [stocks, quotesByTicker],
    );

    const lastUpdated = useMemo(() => {
        const timestamps = quotes
            .map((quote) => Date.parse(quote.lastUpdate))
            .filter((timestamp) => Number.isFinite(timestamp));

        if (timestamps.length === 0) {
            return null;
        }

        return new Date(Math.max(...timestamps));
    }, [quotes]);

    useEffect(() => {
        if (data && params.page > data.totalPages) {
            updateParams({ page: data.totalPages });
        }
    }, [data, params.page, updateParams]);

    const selectedRow =
        rows.find(({ stock }) => stock.id === selectedStockId) ?? null;

    const confirmDelete = () => {
        if (!pendingDelete) {
            return;
        }

        deleteStockMutation.mutate(pendingDelete.id, {
            onSuccess: () => {
                setPendingDelete(null);
            },
        });
    };

    const cancelDelete = () => {
        deleteStockMutation.reset();
        setPendingDelete(null);
    };

    if (error) {
        return (
            <div className="asset-list__error">
                Не удалось загрузить акции. Проверь, что backend запущен.
            </div>
        );
    }

    const profitClass =
        summary.profit > 0
            ? 'asset-list__profit asset-list__profit--positive'
            : summary.profit < 0
                ? 'asset-list__profit asset-list__profit--negative'
                : 'asset-list__profit';

    const hasFilters =
        Boolean(params.search) || params.filter !== 'all';

    return (
        <div className="asset-list">
            <div className="asset-list__header">
                <div className="asset-list__profit-block">
                    <div className="asset-list__summary-label">
                        Общая прибыль
                    </div>

                    <div className={profitClass}>
                        <span className="asset-list__profit-value">
                            {summary.profit > 0 ? '+' : ''}
                            {formatMoney(summary.profit)}
                        </span>

                        <span className="asset-list__profit-percent">
                            {formatPercent(summary.profitPercent)}
                        </span>
                    </div>
                </div>

                <div className="asset-list__summary">
                    <div className="asset-list__summary-item">
                        <div className="asset-list__summary-label">
                            Стоимость портфеля
                        </div>

                        <div className="asset-list__summary-value">
                            {formatMoney(summary.value)}
                        </div>
                    </div>

                    <div className="asset-list__summary-item">
                        <div className="asset-list__summary-label">
                            Вложено
                        </div>

                        <div className="asset-list__summary-value">
                            {formatMoney(summary.invested)}
                        </div>
                    </div>

                    <div className="asset-list__summary-item">
                        <div className="asset-list__summary-label">
                            MOEX
                        </div>

                        <div className="asset-list__summary-value asset-list__summary-value--time">
                            {lastUpdated
                                ? lastUpdated.toLocaleTimeString('ru-RU')
                                : '—'}
                        </div>
                    </div>
                </div>
            </div>

            <AddAssetForm />

            <AssetListToolbar
                search={searchInput}
                onSearchChange={setSearchInput}
                filter={params.filter}
                onFilterChange={(filter) =>
                    updateParams({ filter, page: 1 })
                }
                sort={params.sort}
                order={params.order}
                onSortChange={(sort, order) =>
                    updateParams({ sort, order, page: 1 })
                }
            />

            {isLoading && (
                <div className="asset-list__loading">
                    ⏳ Загрузка акций...
                </div>
            )}

            {!isLoading && total === 0 && (
                <p className="asset-list__empty">
                    {hasFilters
                        ? 'Ничего не найдено. Попробуйте изменить поиск или фильтры.'
                        : 'Нет акций. Нажмите «+ Добавить акцию»'}
                </p>
            )}

            {total > 0 && (
                <>
                    <div
                        className={
                            isFetching
                                ? 'asset-list__table asset-list__table--fetching'
                                : 'asset-list__table'
                        }
                    >
                        <div className="asset-list__table-header">
                            <div>Акция</div>
                            <div>Кол-во</div>
                            <div>Цена покупки</div>
                            <div>Текущая цена</div>
                            <div>Изменение</div>
                            <div></div>
                        </div>

                        {rows.map(({ stock, quote }) => (
                            <AssetItem
                                key={stock.id}
                                stock={stock}
                                quote={quote}
                                onSelect={() =>
                                    setSelectedStockId(stock.id)
                                }
                                onRequestRemove={() => {
                                    deleteStockMutation.reset();
                                    setPendingDelete({
                                        id: stock.id,
                                        ticker: stock.ticker,
                                        name: stock.name,
                                    });
                                }}
                            />
                        ))}
                    </div>

                    <Pagination
                        page={params.page}
                        totalPages={totalPages}
                        onPageChange={(page) =>
                            updateParams({ page })
                        }
                    />
                </>
            )}

            {selectedRow && (
                <AssetDetailsModal
                    stock={selectedRow.stock}
                    quote={selectedRow.quote}
                    portfolioValue={summary.value}
                    onClose={() => setSelectedStockId(null)}
                />
            )}

            {pendingDelete && (
                <ConfirmDeleteModal
                    ticker={pendingDelete.ticker}
                    name={pendingDelete.name}
                    isDeleting={deleteStockMutation.isPending}
                    isError={deleteStockMutation.isError}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
}

export default AssetList;
