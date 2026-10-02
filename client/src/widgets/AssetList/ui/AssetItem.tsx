import type { Stock } from '../../../entities/stock/model/stockTypes';

interface AssetItemProps {
    stock: Stock;
    onRemove: (id: number) => void;
}

function AssetItem({
                       stock,
                       onRemove,
                   }: AssetItemProps) {
    const changePercent = stock.changePercent ?? 0;
    const currentPrice =
        stock.currentPrice ?? stock.purchasePrice;

    const isPositive = changePercent > 0;

    return (
        <div className="asset-item">
            <div className="asset-item__info">
                <div className="asset-item__ticker">
                    {stock.ticker}
                </div>

                <div className="asset-item__name">
                    {stock.name}
                </div>

                <div className="asset-item__quantity">
                    Кол-во: {stock.quantity}
                </div>
            </div>

            <div className="asset-item__actions">
                <div className="asset-item__price">
                    ₽{currentPrice.toFixed(2)}
                </div>

                <div
                    className={
                        isPositive
                            ? 'asset-item__change asset-item__change--positive'
                            : 'asset-item__change asset-item__change--negative'
                    }
                >
                    {isPositive ? '↑' : '↓'}{' '}
                    {Math.abs(changePercent).toFixed(2)}%
                </div>

                <button
                    type="button"
                    className="asset-item__remove"
                    onClick={() => onRemove(stock.id)}
                >
                    Удалить
                </button>
            </div>
        </div>
    );
}

export default AssetItem;