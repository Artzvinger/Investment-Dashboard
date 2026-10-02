import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { stockApi } from '../api/stockApi';

import type {
    CreateStockInput,
    Stock,
    UpdateStockInput,
} from './stockTypes';

export const STOCKS_QUERY_KEY = {w
    all: ['stocks'] as const,

    detail: (id: number) =>
        ['stocks', id] as const,

    prices: (tickers: string[]) =>
        ['stocks', 'prices', tickers] as const,
};

export function useStocksQuery() {
    return useQuery({
        queryKey: STOCKS_QUERY_KEY.all,
        queryFn: () => stockApi.getAll(),
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
        mutationFn: (input: CreateStockInput) =>
            stockApi.create(input),

        onSuccess: (newStock) => {
            queryClient.setQueryData<Stock[]>(
                STOCKS_QUERY_KEY.all,
                (prev) => {
                    if (!prev) {
                        return [newStock];
                    }

                    if (
                        prev.some(
                            (stock) => stock.id === newStock.id
                        )
                    ) {
                        return prev;
                    }

                    return [newStock, ...prev];
                }
            );

            toast.success(
                `Акция ${newStock.ticker} добавлена!`
            );
        },

        onError: (error) => {
            console.error(
                'Ошибка создания акции:',
                error
            );

            toast.error(
                'Не удалось добавить акцию'
            );
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

        onSuccess: (updatedStock) => {
            queryClient.setQueryData<Stock[]>(
                STOCKS_QUERY_KEY.all,
                (prev) => {
                    if (!prev) {
                        return [updatedStock];
                    }

                    return prev.map((stock) =>
                        stock.id === updatedStock.id
                            ? updatedStock
                            : stock
                    );
                }
            );
        },

        onError: (error) => {
            console.error(
                'Ошибка обновления акции:',
                error
            );

            toast.error(
                'Не удалось обновить цену'
            );
        },
    });
}

export function useDeleteStockMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            stockApi.delete(id),

        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<Stock[]>(
                STOCKS_QUERY_KEY.all,
                (prev) => {
                    if (!prev) {
                        return [];
                    }

                    return prev.filter(
                        (stock) =>
                            stock.id !== deletedId
                    );
                }
            );

            toast.success('Акция удалена');
        },

        onError: (error) => {
            console.error(
                'Ошибка удаления акции:',
                error
            );

            toast.error(
                'Не удалось удалить акцию'
            );
        },
    });
}
