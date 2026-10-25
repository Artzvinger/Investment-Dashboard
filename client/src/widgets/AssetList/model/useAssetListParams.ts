import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import type {
    SortOrder,
    StockFilter,
    StockSort,
} from '../../../entities/stock/model/stockTypes';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';

export interface AssetListParams {
    search: string;
    filter: StockFilter;
    sort: StockSort;
    order: SortOrder;
    page: number;
    limit: number;
}

const DEFAULT_LIMIT = 10;

function parseFilter(value: string | null): StockFilter {
    return value === 'profitable' || value === 'losing'
        ? value
        : 'all';
}

function parseSort(value: string | null): StockSort {
    return value === 'ticker' ||
        value === 'price' ||
        value === 'profit'
        ? value
        : 'date';
}

function parseOrder(value: string | null): SortOrder {
    return value === 'asc' ? 'asc' : 'desc';
}

export function useAssetListParams() {
    const [searchParams, setSearchParams] = useSearchParams();

    const params: AssetListParams = {
        search: searchParams.get('search') ?? '',
        filter: parseFilter(searchParams.get('filter')),
        sort: parseSort(searchParams.get('sort')),
        order: parseOrder(searchParams.get('order')),
        page: Math.max(
            1,
            Number(searchParams.get('page') ?? 1) || 1,
        ),
        limit: DEFAULT_LIMIT,
    };

    const updateParams = useCallback(
        (patch: Partial<AssetListParams>) => {
            const next = new URLSearchParams(searchParams);

            for (const [key, value] of Object.entries(patch)) {
                if (value === undefined) {
                    next.delete(key);
                    continue;
                }

                const isDefault =
                    value === '' ||
                    (key === 'filter' && value === 'all') ||
                    (key === 'sort' && value === 'date') ||
                    (key === 'order' && value === 'desc') ||
                    (key === 'page' && value === 1);

                if (isDefault) {
                    next.delete(key);
                } else {
                    next.set(key, String(value));
                }
            }

            setSearchParams(next, { replace: true });
        },
        [searchParams, setSearchParams],
    );

    const [searchInput, setSearchInput] = useState(params.search);
    const debouncedSearch = useDebouncedValue(searchInput, 400);

    useEffect(() => {
        setSearchInput(params.search);
    }, [params.search]);

    useEffect(() => {
        if (debouncedSearch === params.search) {
            return;
        }

        updateParams({ search: debouncedSearch, page: 1 });
    }, [debouncedSearch, params.search, updateParams]);

    return {
        params,
        searchInput,
        setSearchInput,
        updateParams,
    };
}
