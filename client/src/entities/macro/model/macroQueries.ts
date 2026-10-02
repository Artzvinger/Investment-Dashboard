import { useQuery } from '@tanstack/react-query';

import { macroApi } from '../api/macroApi';

export const MACRO_KEYS = {
    all: ['macro'] as const,
    index: ['macro', 'index'] as const,
    usd: ['macro', 'usd'] as const,
    allData: ['macro', 'all'] as const,
};

export function useMacroData() {
    return useQuery({
        queryKey: MACRO_KEYS.allData,
        queryFn: () => macroApi.getAll(),
        staleTime: 30_000,
        refetchInterval: 30_000,
        retry: 2,
    });
}