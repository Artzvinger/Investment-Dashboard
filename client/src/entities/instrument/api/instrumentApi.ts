import { httpClient } from '../../../shared/api/httpClient';

import type {
    InstrumentMarket,
    InstrumentsQueryParams,
    InstrumentsResponse,
} from '../model/instrumentTypes';

export const instrumentApi = {
    async getByMarket(
        market: InstrumentMarket,
        params: InstrumentsQueryParams = {},
    ): Promise<InstrumentsResponse> {
        const { data } = await httpClient.get<InstrumentsResponse>(
            '/moex/instruments',
            {
                params: {
                    market,
                    ...params,
                },
            },
        );

        return data;
    },
};
