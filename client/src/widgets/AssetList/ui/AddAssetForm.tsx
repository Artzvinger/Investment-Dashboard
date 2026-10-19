import { useState } from 'react';
import {
    useController,
    useForm,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useStock } from '../../../entities/stock/model/moexQueries';
import { useCreateStockMutation } from '../../../entities/stock/model/stockQueries';
import Modal from '../../../shared/ui/Modal/Modal';
import { getCurrentUserId } from '../../../shared/session';

const stockSchema = z.object({
    ticker: z
        .string()
        .min(1, 'Тикер обязателен')
        .max(10, 'Тикер слишком длинный')
        .regex(
            /^[A-Za-z]+$/,
            'Тикер должен содержать только буквы',
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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<StockFormData>({
        resolver: zodResolver(stockSchema),
        defaultValues,
    });

    const createStockMutation = useCreateStockMutation();

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

    const ticker = tickerField.field.value.trim().toUpperCase();

    const marketQuery = useStock(ticker);
    const marketStock = marketQuery.data;

    const onSubmit = (data: StockFormData) => {
        if (!marketStock || marketStock.ticker !== ticker) {
            return;
        }

        createStockMutation.mutate(
            {
                ticker: marketStock.ticker,
                name: marketStock.name,
                quantity: data.quantity,
                purchasePrice: data.purchasePrice,
                userId: getCurrentUserId(),
            },
            {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            },
        );
    };

    const handleClose = () => {
        setIsModalOpen(false);
        reset();
        createStockMutation.reset();
    };

    const isMarketDataLoading =
        ticker.length > 0 && marketQuery.isFetching;

    const hasMarketDataError =
        ticker.length > 0 &&
        marketQuery.isError &&
        !marketQuery.isFetching;

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
                            Введите тикер акции Московской биржи
                        </div>

                        {isMarketDataLoading && (
                            <div className="add-asset-form__hint">
                                Поиск акции...
                            </div>
                        )}

                        {hasMarketDataError && (
                            <div className="add-asset-form__error">
                                Не удалось получить котировку.
                                Проверьте тикер и попробуйте ещё раз.
                            </div>
                        )}

                        {marketStock && marketStock.ticker === ticker && (
                            <div className="add-asset-form__hint">
                                <div>
                                    Название: {marketStock.name}
                                </div>

                                <div>
                                    Текущая цена:{' '}
                                    {marketStock.currentPrice.toFixed(2)} ₽
                                </div>

                                {marketStock.changePercent !== null && (
                                    <div
                                        style={{
                                            color:
                                                marketStock.changePercent > 0
                                                    ? 'green'
                                                    : marketStock.changePercent < 0
                                                        ? 'red'
                                                        : 'gray',
                                        }}
                                    >
                                        Изменение:{' '}
                                        {marketStock.changePercent > 0
                                            ? '+'
                                            : ''}
                                        {marketStock.changePercent.toFixed(2)}%
                                    </div>
                                )}
                            </div>
                        )}
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
                                    event.target.valueAsNumber,
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
                                    event.target.valueAsNumber,
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
                                {errors.purchasePrice.message}
                            </div>
                        )}

                        {marketStock && marketStock.ticker === ticker && (
                            <div className="add-asset-form__hint">
                                Рыночная цена сейчас:{' '}
                                {marketStock.currentPrice.toFixed(2)} ₽
                            </div>
                        )}
                    </div>

                    {createStockMutation.isError && (
                        <div className="add-asset-form__error">
                            Не удалось добавить акцию. Попробуйте ещё раз.
                        </div>
                    )}

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
                                createStockMutation.isPending ||
                                !marketStock ||
                                marketStock.ticker !== ticker ||
                                marketQuery.isFetching
                            }
                        >
                            {createStockMutation.isPending
                                ? 'Добавление...'
                                : 'Добавить'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default AddAssetForm;