import { httpClient } from '../../../shared/api/httpClient';

import type {
    CreateStockInput,
    MoexStock,
    Stock,
    UpdateStockInput,
} from '../model/stockTypes';

export const stockApi = {
    async getAll(): Promise<Stock[]> {
        const { data } = await httpClient.get('/stocks');

        if (!Array.isArray(data)) {
            throw new Error('API /stocks должен возвращать массив акций');
        }

        return data as Stock[];
    },

    async getOne(id: number): Promise<Stock> {
        const { data } = await httpClient.get<Stock>(`/stocks/${id}`);

        return data;
    },

    async create(input: CreateStockInput): Promise<Stock> {
        const payload = {
            ticker: input.ticker.trim().toUpperCase(),
            name: input.name.trim(),
            quantity: Number(input.quantity),
            purchasePrice: Number(input.purchasePrice),
            userId: input.userId,
            currentPrice: input.currentPrice ?? undefined,
            changePercent: input.changePercent ?? undefined,
            lastUpdate: input.lastUpdate ?? undefined,
        };

        const { data } = await httpClient.post<Stock>(
            '/stocks',
            payload,
        );

        return data;
    },

    async update(
        id: number,
        updates: UpdateStockInput,
    ): Promise<Stock> {
        const { data } = await httpClient.patch<Stock>(
            `/stocks/${id}`,
            updates,
        );

        return data;
    },

    async delete(id: number): Promise<void> {
        await httpClient.delete(`/stocks/${id}`);
    },

    async getMarketData(ticker: string): Promise<MoexStock> {
        const { data } = await httpClient.get<MoexStock>(
            `/moex/stocks/${encodeURIComponent(ticker)}`,
        );

        return data;
    },

    async getMultipleMarketData(
        tickers: string[],
    ): Promise<MoexStock[]> {
        if (tickers.length === 0) {
            return [];
        }

        const { data } = await httpClient.get<MoexStock[]>(
            '/moex/quotes',
            {
                params: {
                    tickers: tickers.join(','),
                },
            },
        );

        return data;
    },
};