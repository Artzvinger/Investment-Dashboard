import { httpClient } from '../../../shared/api/httpClient';

import type {
    Stock,
    CreateStockInput,
    UpdateStockInput,
} from '../model/stockTypes';

export const stockApi = {
    async getAll(): Promise<Stock[]> {
        const { data } = await httpClient.get<Stock[]>('/stocks');

        return data;
    },

    async getOne(id: number): Promise<Stock> {
        const { data } = await httpClient.get<Stock>(`/stocks/${id}`);

        return data;
    },

    async create(input: CreateStockInput): Promise<Stock> {
        const { data } = await httpClient.post<Stock>('/stocks', input);

        return data;
    },

    async update(
        id: number,
        updates: UpdateStockInput
    ): Promise<Stock> {
        const { data } = await httpClient.patch<Stock>(
            `/stocks/${id}`,
            updates
        );

        return data;
    },

    async delete(id: number): Promise<void> {
        await httpClient.delete(`/stocks/${id}`);
    },
};
