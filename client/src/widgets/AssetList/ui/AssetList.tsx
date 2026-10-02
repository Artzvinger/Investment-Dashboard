import AddAssetForm from './AddAssetForm';
import AssetItem from './AssetItem';

import {
    useDeleteStockMutation,
    useStocksQuery,
} from '../../../entities/stock/model/stockQueries';

function AssetList() {
    const {
        data: stocks = [],
        isLoading,
        error,
    } = useStocksQuery();

    const deleteStockMutation =
        useDeleteStockMutation();

    const removeStock = (id: number) => {
        deleteStockMutation.mutate(id);
    };

    const totalValue = stocks.reduce(
        (sum, stock) =>
            sum +
            (stock.currentPrice ??
                stock.purchasePrice) *
            stock.quantity,
        0
    );

    const totalProfit = stocks.reduce(
        (sum, stock) =>
            sum +
            ((stock.currentPrice ??
                    stock.purchasePrice) -
                stock.purchasePrice) *
            stock.quantity,
        0
    );

    if (error) {
        return (
            <div className="asset-list__error">
                Не удалось загрузить акции
            </div>
        );
    }

    return (
        <div className="asset-list">
            <div className="asset-list__header">
                <h2 className="asset-list__title">
                    📈 Мои акции
                </h2>

                <div className="asset-list__summary">
                    <div className="asset-list__summary-label">
                        Общая стоимость
                    </div>

                    <div className="asset-list__summary-value">
                        ₽{totalValue.toFixed(2)}
                    </div>

                    <div
                        className={
                            totalProfit >= 0
                                ? 'asset-list__profit asset-list__profit--positive'
                                : 'asset-list__profit asset-list__profit--negative'
                        }
                    >
                        {totalProfit >= 0 ? '+' : ''}
                        {totalProfit.toFixed(2)} ₽
                    </div>
                </div>
            </div>

            <AddAssetForm />

            {isLoading && (
                <div className="asset-list__loading">
                    ⏳ Загрузка акций...
                </div>
            )}

            {!isLoading && stocks.length === 0 ? (
                <p className="asset-list__empty">
                    Нет акций. Нажмите "+ Добавить акцию"
                </p>
            ) : (
                <div className="asset-list__table">
                    <div className="asset-list__table-header">
                        <div>Акция</div>
                        <div>Кол-во</div>
                        <div>Цена покупки</div>
                        <div>Текущая цена</div>
                        <div>Прибыль</div>
                    </div>

                    {stocks.map((stock) => (
                        <AssetItem
                            key={stock.id}
                            stock={stock}
                            onRemove={removeStock}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default AssetList;