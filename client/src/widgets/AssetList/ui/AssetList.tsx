import { useMemo, useState } from 'react';

import { useMultipleStocks } from '../../../entities/stock/model/moexQueries';
import {
    useDeleteStockMutation,
    useStocksQuery,
} from '../../../entities/stock/model/stockQueries';
import {
    formatMoney,
    formatPercent,
} from '../../../shared/lib/format';

import AddAssetForm from './AddAssetForm';
import AssetDetailsModal from './AssetDetailsModal';
import AssetItem from './AssetItem';
import ConfirmDeleteModal from './ConfirmDeleteModal';

function AssetList() {
    const {
        data: stocks = [],
        isLoading,
        error,
    } = useStocksQuery();

    const deleteStockMutation = useDeleteStockMutation();

    const [selectedStockId, setSelectedStockId] = useState<number | null>(
        null,
    );

    const [pendingDelete, setPendingDelete] = useState<{
        id: number;
        ticker: string;
        name: string;
    } | null>(null);

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

    const totals = useMemo(() => {
        let invested = 0;
        let value = 0;

        for (const { stock, quote } of rows) {
            const unitPrice =
                quote?.currentPrice ??
                stock.currentPrice ??
                stock.purchasePrice;

            invested += stock.purchasePrice * stock.quantity;
            value += unitPrice * stock.quantity;
        }

        const profit = value - invested;
        const profitPercent =
            invested > 0 ? (profit / invested) * 100 : 0;

        return { invested, value, profit, profitPercent };
    }, [rows]);

    const lastUpdated = useMemo(() => {
        const timestamps = quotes
            .map((quote) => Date.parse(quote.lastUpdate))
            .filter((timestamp) => Number.isFinite(timestamp));

        if (timestamps.length === 0) {
            return null;
        }

        return new Date(Math.max(...timestamps));
    }, [quotes]);

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
        totals.profit > 0
            ? 'asset-list__profit asset-list__profit--positive'
            : totals.profit < 0
                ? 'asset-list__profit asset-list__profit--negative'
                : 'asset-list__profit';

    return (
        <div className="asset-list">
            <div className="asset-list__header">
                <div className="asset-list__profit-block">
                    <div className="asset-list__summary-label">
                        Общая прибыль
                    </div>

                    <div className={profitClass}>
                        <span className="asset-list__profit-value">
                            {totals.profit > 0 ? '+' : ''}
                            {formatMoney(totals.profit)}
                        </span>

                        <span className="asset-list__profit-percent">
                            {formatPercent(totals.profitPercent)}
                        </span>
                    </div>
                </div>

                <div className="asset-list__summary">
                    <div className="asset-list__summary-item">
                        <div className="asset-list__summary-label">
                            Стоимость портфеля
                        </div>

                        <div className="asset-list__summary-value">
                            {formatMoney(totals.value)}
                        </div>
                    </div>

                    <div className="asset-list__summary-item">
                        <div className="asset-list__summary-label">
                            Вложено
                        </div>

                        <div className="asset-list__summary-value">
                            {formatMoney(totals.invested)}
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

            {isLoading && (
                <div className="asset-list__loading">
                    ⏳ Загрузка акций...
                </div>
            )}

            {!isLoading && stocks.length === 0 && (
                <p className="asset-list__empty">
                    Нет акций. Нажмите «+ Добавить акцию»
                </p>
            )}

            {stocks.length > 0 && (
                <div className="asset-list__table">
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
                            onSelect={() => setSelectedStockId(stock.id)}
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
            )}

            {selectedRow && (
                <AssetDetailsModal
                    stock={selectedRow.stock}
                    quote={selectedRow.quote}
                    portfolioValue={totals.value}
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
