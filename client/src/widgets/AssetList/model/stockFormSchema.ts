import { z } from 'zod';

import { parseDecimal } from '../../../shared/lib/number';

export const stockFormSchema = z.object({
    ticker: z
        .string()
        .min(1, 'Тикер обязателен')
        .max(20, 'Тикер слишком длинный')
        .regex(
            /^[A-Za-z0-9.-]+$/,
            'Тикер может содержать буквы, цифры, точку и дефис',
        ),

    quantity: z
        .string()
        .min(1, 'Укажите количество')
        .refine((value) => {
            const quantity = parseDecimal(value);

            return (
                Number.isInteger(quantity) &&
                quantity >= 1 &&
                quantity <= 1_000_000
            );
        }, 'Количество должно быть целым числом от 1 до 1 000 000'),

    purchasePrice: z
        .string()
        .min(1, 'Укажите цену')
        .refine((value) => {
            const price = parseDecimal(value);

            return (
                Number.isFinite(price) &&
                price >= 0.01 &&
                price <= 10_000_000
            );
        }, 'Цена должна быть от 0.01 до 10 000 000'),
});

export type StockFormValues = z.infer<typeof stockFormSchema>;

export const stockFormDefaults: StockFormValues = {
    ticker: '',
    quantity: '1',
    purchasePrice: '',
};
