import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import type {
    InstrumentBoard,
    InstrumentDirection,
} from '../../../entities/instrument/model/instrumentTypes';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';

export interface InstrumentCatalogParams {
    search: string;
    direction: InstrumentDirection;
    board: InstrumentBoard;
    page: number;
    limit: number;
}

const DEFAULT_LIMIT = 25;

function parseDirection(value: string | null): InstrumentDirection {
    return value === 'up' || value === 'down' ? value : 'all';
}

function parseBoard(value: string | null): InstrumentBoard {
    return value === 'TQBR' ||
        value === 'TQCB' ||
        value === 'TQOB'
        ? value
        : 'all';
}

export function useInstrumentCatalogParams() {
    const [searchParams, setSearchParams] = useSearchParams();

    const params: InstrumentCatalogParams = {
        search: searchParams.get('search') ?? '',
        direction: parseDirection(searchParams.get('direction')),
        board: parseBoard(searchParams.get('board')),
        page: Math.max(
            1,
            Number(searchParams.get('page') ?? 1) || 1,
        ),
        limit: DEFAULT_LIMIT,
    };

    const updateParams = useCallback(
        (patch: Partial<InstrumentCatalogParams>) => {
            const next = new URLSearchParams(searchParams);

            for (const [key, value] of Object.entries(patch)) {
                if (value === undefined) {
                    next.delete(key);
                    continue;
                }

                const isDefault =
                    value === '' ||
                    (key === 'direction' && value === 'all') ||
                    (key === 'board' && value === 'all') ||
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
