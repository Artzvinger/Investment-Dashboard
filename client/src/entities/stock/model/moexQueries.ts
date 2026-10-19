import { useQuery } from '@tanstack/react-query';

import { stockApi } from '../api/stockApi';

export const MOEX_QUERY_KEY = {
    detail: (ticker: string) =>
        ['stocks', 'moex', ticker] as const,

    prices: (tickers: string[]) =>
        ['stocks', 'moex', 'prices', tickers] as const,
};

export function useMultipleStocks(
    tickers: string[],
) {
    return useQuery({
        queryKey: MOEX_QUERY_KEY.prices(tickers),
        queryFn: () =>
            stockApi.getMultipleMarketData(tickers),
        enabled: tickers.length > 0,
        staleTime: 10_000,
        refetchInterval: 10_000,
        retry: 2,
    });
}

export function useStock(ticker: string) {
    return useQuery({
        queryKey: MOEX_QUERY_KEY.detail(ticker),
        queryFn: () =>
            stockApi.getMarketData(ticker),
        enabled: Boolean(ticker),
        staleTime: 30_000,
    });
}