import type { MoexStock, Stock } from '../../../entities/stock/model/stockTypes';
import { formatMoney } from '../../../shared/lib/format';

interface AssetItemProps {
    stock: Stock;
    quote?: MoexStock;
    onRemove: (id: number) => void;
}

function AssetItem({
                       stock,
                       quote,
                       onRemove,
                   }: AssetItemProps) {
    const unitPrice =
        quote?.currentPrice ?? stock.currentPrice ?? stock.purchasePrice;

    const profitMoney =
        (unitPrice - stock.purchasePrice) * stock.quantity;

    const profitPercent =
        stock.purchasePrice > 0
            ? ((unitPrice - stock.purchasePrice) / stock.purchasePrice) * 100
            : 0;

    const direction =
        profitPercent > 0
            ? '↑'
            : profitPercent < 0
                ? '↓'
                : '→';

    const changeClass =
        profitPercent > 0
            ? 'asset-item__change asset-item__change--positive'
            : profitPercent < 0
                ? 'asset-item__change asset-item__change--negative'
                : 'asset-item__change';

    return (
        <div className="asset-item">
            <div className="asset-item__info">
                <div className="asset-item__ticker">
                    {stock.ticker}
                </div>

                <div className="asset-item__name">
                    {stock.name}
                </div>
            </div>

            <div className="asset-item__quantity">
                {stock.quantity} шт.
            </div>

            <div className="asset-item__price">
                {formatMoney(stock.purchasePrice)}
            </div>

            <div className="asset-item__price">
                {formatMoney(unitPrice)}
            </div>

            <div className={changeClass}>
                <div className="asset-item__change-value">
                    {direction}{' '}
                    {Math.abs(profitPercent).toFixed(2)}%
                </div>

                <div className="asset-item__change-money">
                    {profitMoney > 0 ? '+' : ''}
                    {formatMoney(profitMoney)}
                </div>
            </div>

            <button
                type="button"
                className="asset-item__remove"
                onClick={() => {
                    if (
                        window.confirm(
                            `Удалить ${stock.ticker} из портфеля?`,
                        )
                    ) {
                        onRemove(stock.id);
                    }
                }}
            >
                Удалить
            </button>
        </div>
    );
}

export default AssetItem;
