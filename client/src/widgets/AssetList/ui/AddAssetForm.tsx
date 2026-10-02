import { useState } from 'react';
import {
    useController,
    useForm,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../../../shared/ui/Modal/Modal';
import { useCreateStockMutation } from '../../../entities/stock/model/stockQueries';

const stockSchema = z.object({
    ticker: z
        .string()
        .min(1, 'Тикер обязателен')
        .max(10, 'Тикер слишком длинный')
        .regex(
            /^[A-Za-z]+$/,
            'Тикер должен содержать только буквы'
        ),

    quantity: z
        .number()
        .min(1, 'Количество должно быть больше 0')
        .max(1_000_000, 'Слишком много акций'),

    purchasePrice: z
        .number()
        .min(0.01, 'Цена должна быть больше 0')
        .max(10_000_000, 'Слишком высокая цена'),
});

type StockFormData = z.infer<typeof stockSchema>;

const defaultValues: StockFormData = {
    ticker: '',
    quantity: 1,
    purchasePrice: 0,
};

function AddAssetForm() {
    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<StockFormData>({
        resolver: zodResolver(stockSchema),
        defaultValues,
    });

    const createStockMutation =
        useCreateStockMutation();

    const tickerField = useController({
        name: 'ticker',
        control,
    });

    const quantityField = useController({
        name: 'quantity',
        control,
    });

    const purchasePriceField = useController({
        name: 'purchasePrice',
        control,
    });

    const onSubmit = (data: StockFormData) => {
        const ticker = data.ticker.toUpperCase();

        createStockMutation.mutate(
            {
                ticker,
                name: ticker,
                quantity: data.quantity,
                purchasePrice: data.purchasePrice,
            },
            {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            }
        );
    };

    const handleClose = () => {
        setIsModalOpen(false);
        reset();
    };

    return (
        <>
            <button
                type="button"
                className="add-asset-form__open-button"
                onClick={() => setIsModalOpen(true)}
            >
                <span>+</span>
                Добавить акцию
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title="➕ Добавить акцию"
            >
                <form
                    className="add-asset-form"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="add-asset-form__field">
                        <label htmlFor="ticker">
                            Тикер *
                        </label>

                        <input
                            id="ticker"
                            type="text"
                            {...tickerField.field}
                            placeholder="Например: SBER, GAZP, ROSN"
                            className={
                                errors.ticker
                                    ? 'add-asset-form__input add-asset-form__input--error'
                                    : 'add-asset-form__input'
                            }
                        />

                        {errors.ticker && (
                            <div className="add-asset-form__error">
                                {errors.ticker.message}
                            </div>
                        )}

                        <div className="add-asset-form__hint">
                            Введите символ акции
                            (например, SBER)
                        </div>
                    </div>

                    <div className="add-asset-form__field">
                        <label htmlFor="quantity">
                            Количество *
                        </label>

                        <input
                            id="quantity"
                            type="number"
                            {...quantityField.field}
                            onChange={(event) => {
                                quantityField.field.onChange(
                                    event.target.valueAsNumber
                                );
                            }}
                            placeholder="Сколько акций купили?"
                            className={
                                errors.quantity
                                    ? 'add-asset-form__input add-asset-form__input--error'
                                    : 'add-asset-form__input'
                            }
                        />

                        {errors.quantity && (
                            <div className="add-asset-form__error">
                                {errors.quantity.message}
                            </div>
                        )}
                    </div>

                    <div className="add-asset-form__field">
                        <label htmlFor="purchasePrice">
                            Цена покупки (₽) *
                        </label>

                        <input
                            id="purchasePrice"
                            type="number"
                            step="0.01"
                            {...purchasePriceField.field}
                            onChange={(event) => {
                                purchasePriceField.field.onChange(
                                    event.target.valueAsNumber
                                );
                            }}
                            placeholder="Цена за 1 акцию"
                            className={
                                errors.purchasePrice
                                    ? 'add-asset-form__input add-asset-form__input--error'
                                    : 'add-asset-form__input'
                            }
                        />

                        {errors.purchasePrice && (
                            <div className="add-asset-form__error">
                                {
                                    errors
                                        .purchasePrice
                                        .message
                                }
                            </div>
                        )}
                    </div>

                    <div className="add-asset-form__actions">
                        <button
                            type="button"
                            className="add-asset-form__cancel"
                            onClick={handleClose}
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            className="add-asset-form__submit"
                            disabled={
                                createStockMutation.isPending
                            }
                        >
                            {createStockMutation.isPending
                                ? 'Добавление...'
                                : '✅ Добавить'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default AddAssetForm;