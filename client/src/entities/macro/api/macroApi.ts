import { httpClient } from '../../../shared/api/httpClient';

export interface MacroData {
    moexIndex: number;
    usdRub: number;
    keyRate: number;
    inflation: number;
}

export const macroApi = {
    async getMoexIndex(): Promise<number> {
        try {
            const { data } = await httpClient.get<{
                value?: number;
                currentValue?: number;
            }>('/moex/index');

            return data.value ?? data.currentValue ?? 0;
        } catch (error) {
            console.error('Ошибка получения индекса MOEX:', error);
            return 0;
        }
    },

    async getUsdRub(): Promise<number> {
        try {
            const { data } = await httpClient.get<{
                value?: number;
                price?: number;
            }>('/moex/usd');

            return data.value ?? data.price ?? 0;
        } catch (error) {
            console.error('Ошибка получения USD/RUB:', error);
            return 0;
        }
    },

    async getAll(): Promise<MacroData> {
        const [moexIndex, usdRub] = await Promise.all([
            this.getMoexIndex(),
            this.getUsdRub(),
        ]);

        return {
            moexIndex,
            usdRub,
            keyRate: 18.0,
            inflation: 7.2,
        };
    },
};