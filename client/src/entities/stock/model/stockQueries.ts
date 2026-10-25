import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import { stockApi } from '../api/stockApi';

import type {
    CreateStockInput,
    StocksQueryParams,
    UpdateStockInput,
} from './stockTypes';

export const STOCKS_QUERY_KEY = {
    all: ['stocks'] as const,
    list: (params: StocksQueryParams) =>
        ['stocks', 'list', params] as const,
    detail: (id: number) => ['stocks', id] as const,
    prices: (tickers: string[]) => ['stocks', 'prices', tickers] as const,
};

export function useStocksQuery(
    params: StocksQueryParams = {},
) {
    return useQuery({
        queryKey: STOCKS_QUERY_KEY.list(params),
        queryFn: () => stockApi.getAll(params),
        placeholderData: keepPreviousData,
        staleTime: 10_000,
        refetchInterval: 10_000,
        retry: 2,
    });
}

export function useStockQuery(id: number) {
    return useQuery({
        queryKey: STOCKS_QUERY_KEY.detail(id),
        queryFn: () => stockApi.getOne(id),
        enabled: Boolean(id),
        staleTime: 30_000,
    });
}

export function useCreateStockMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateStockInput) => stockApi.create(input),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: STOCKS_QUERY_KEY.all,
            });
        },
    });
}

export function useUpdateStockMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         id,
                         updates,
                     }: {
            id: number;
            updates: UpdateStockInput;
        }) => stockApi.update(id, updates),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: STOCKS_QUERY_KEY.all,
            });
        },
    });
}

export function useDeleteStockMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => stockApi.delete(id),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: STOCKS_QUERY_KEY.all,
            });
        },
    });
}