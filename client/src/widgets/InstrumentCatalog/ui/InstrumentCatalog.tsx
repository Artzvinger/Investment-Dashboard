import { useEffect } from 'react';

import { useInstrumentsQuery } from '../../../entities/instrument/model/instrumentQueries';
import type { InstrumentMarket } from '../../../entities/instrument/model/instrumentTypes';
import Pagination from '../../../shared/ui/Pagination/Pagination';

import { useInstrumentCatalogParams } from '../model/useInstrumentCatalogParams';
import InstrumentCatalogToolbar from './InstrumentCatalogToolbar';

interface InstrumentCatalogProps {
    market: InstrumentMarket;
}

const MARKET_TITLES: Record<InstrumentMarket, string> = {
    shares: '📈 Все акции MOEX',
    bonds: '🏦 Все облигации MOEX',
};

function formatPrice(
    value: number | null,
    market: InstrumentMarket,
): string {
    if (value == null) {
        return '—';
    }

    const formatted = value.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return market === 'bonds' ? `${formatted}%` : `${formatted} ₽`;
}

function InstrumentCatalog({ market }: InstrumentCatalogProps) {
    const {
        params,
        searchInput,
        setSearchInput,
        updateParams,
    } = useInstrumentCatalogParams();

    const {
        data,
        isLoading,
        isFetching,
        error,
    } = useInstrumentsQuery(market, params);

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;
    const page = data?.page ?? params.page;

    useEffect(() => {
        if (data && params.page > data.totalPages) {
            updateParams({ page: data.totalPages });
        }
    }, [data, params.page, updateParams]);

    const updatedAt = data?.fetchedAt
        ? new Date(data.fetchedAt).toLocaleTimeString('ru-RU')
        : '—';

    const hasFilters =
        Boolean(params.search) ||
        params.direction !== 'all' ||
        (market === 'bonds' && params.board !== 'all');

    return (
        <div className="instrument-catalog">
            <div className="instrument-catalog__header">
                <div>
                    <h1>{MARKET_TITLES[market]}</h1>
                    <p className="page-subtitle">
                        Список бумаг с Московской биржи. Обновляется
                        автоматически.
                    </p>
                </div>

                <div className="instrument-catalog__updated">
                    Найдено: {total} · Обновлено: {updatedAt}
                    {isFetching && !isLoading ? ' · обновление…' : ''}
                </div>
            </div>

            <InstrumentCatalogToolbar
                market={market}
                search={searchInput}
                onSearchChange={setSearchInput}
                direction={params.direction}
                onDirectionChange={(direction) =>
                    updateParams({ direction, page: 1 })
                }
                board={params.board}
                onBoardChange={(board) =>
                    updateParams({ board, page: 1 })
                }
            />

            {isLoading && (
                <div className="card">
                    Загрузка списка…
                </div>
            )}

            {error && (
                <div className="error-message">
                    Не удалось получить список с MOEX. Попробуйте
                    позже.
                </div>
            )}

            {!isLoading && !error && total === 0 && (
                <div className="empty-state card">
                    {hasFilters
                        ? 'Ничего не найдено. Попробуйте изменить поиск или фильтры.'
                        : 'Список пока пуст.'}
                </div>
            )}

            {!isLoading && !error && total > 0 && (
                <>
                    <div
                        className={
                            isFetching
                                ? 'table-container instrument-catalog__table instrument-catalog__table--fetching'
                                : 'table-container instrument-catalog__table'
                        }
                    >
                        <table>
                            <thead>
                            <tr>
                                <th>Тикер</th>
                                <th>Название</th>
                                <th>
                                    {market === 'bonds'
                                        ? 'Цена, %'
                                        : 'Цена, ₽'}
                                </th>
                                <th>Изменение</th>
                            </tr>
                            </thead>

                            <tbody>
                            {items.map((item) => (
                                <tr key={`${item.board}:${item.ticker}`}>
                                    <td>{item.ticker}</td>
                                    <td>{item.name}</td>
                                    <td>
                                        {formatPrice(item.price, market)}
                                    </td>
                                    <td
                                        className={
                                            item.changePercent == null
                                                ? ''
                                                : item.changePercent > 0
                                                    ? 'text-positive'
                                                    : item.changePercent < 0
                                                        ? 'text-negative'
                                                        : ''
                                        }
                                    >
                                        {item.changePercent == null
                                            ? '—'
                                            : `${item.changePercent > 0 ? '+' : ''}${item.changePercent.toFixed(2)}%`}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={(page) =>
                            updateParams({ page })
                        }
                    />
                </>
            )}
        </div>
    );
}

export default InstrumentCatalog;
