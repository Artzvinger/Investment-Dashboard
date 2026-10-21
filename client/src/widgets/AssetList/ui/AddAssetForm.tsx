import { useState } from 'react';
import {
    useController,
    useForm,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useStock } from '../../../entities/stock/model/moexQueries';
import { useCreateStockMutation } from '../../../entities/stock/model/stockQueries';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { parseDecimal } from '../../../shared/lib/number';
import { getCurrentUserId } from '../../../shared/session';
import Modal from '../../../shared/ui/Modal/Modal';

import {
    stockFormDefaults,
    stockFormSchema,
    type StockFormValues,
} from '../model/stockFormSchema';

function AddAssetForm() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<StockFormValues>({
        resolver: zodResolver(stockFormSchema),
        defaultValues: stockFormDefaults,
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
    const debouncedTicker = useDebouncedValue(ticker, 400);

    const marketQuery = useStock(debouncedTicker);
    const marketStock = marketQuery.data;

    const isDebouncing = ticker !== debouncedTicker;

    const onSubmit = (data: StockFormValues) => {
        if (!marketStock || marketStock.ticker !== ticker) {
            return;
        }

        createStockMutation.mutate(
            {
                ticker: marketStock.ticker,
                name: marketStock.name,
                quantity: parseDecimal(data.quantity),
                purchasePrice: parseDecimal(data.purchasePrice),
                userId: getCurrentUserId(),
                currentPrice: marketStock.currentPrice,
                changePercent: marketStock.changePercent,
                lastUpdate: marketStock.lastUpdate,
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
        ticker.length > 0 && (isDebouncing || marketQuery.isFetching);

    const hasMarketDataError =
        ticker.length > 0 &&
        !isDebouncing &&
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
                            autoComplete="off"
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
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            {...quantityField.field}
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
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            {...purchasePriceField.field}
                            placeholder="Например: 293.5 или 293,5"
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

                        <div className="add-asset-form__hint">
                            Дробные числа можно вводить через точку или запятую.
                        </div>

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
                                isDebouncing ||
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
