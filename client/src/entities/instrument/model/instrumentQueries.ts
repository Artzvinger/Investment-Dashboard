import {
    keepPreviousData,
    useQuery,
} from '@tanstack/react-query';

import { instrumentApi } from '../api/instrumentApi';

import type {
    InstrumentMarket,
    InstrumentsQueryParams,
} from './instrumentTypes';

export function useInstrumentsQuery(
    market: InstrumentMarket,
    params: InstrumentsQueryParams = {},
) {
    return useQuery({
        queryKey: ['instruments', market, params],
        queryFn: () => instrumentApi.getByMarket(market, params),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        refetchInterval: 60_000,
        retry: 2,
    });
}
