import type { MoexStock, Stock } from '../../../entities/stock/model/stockTypes';
import { formatMoney, formatPercent } from '../../../shared/lib/format';
import Modal from '../../../shared/ui/Modal/Modal';

interface AssetDetailsModalProps {
    stock: Stock;
    quote?: MoexStock;
    portfolioValue: number;
    onClose: () => void;
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleString('ru-RU');
}

function AssetDetailsModal({
                               stock,
                               quote,
                               portfolioValue,
                               onClose,
                           }: AssetDetailsModalProps) {
    const unitPrice =
        quote?.currentPrice ?? stock.currentPrice ?? stock.purchasePrice;

    const invested = stock.purchasePrice * stock.quantity;
    const value = unitPrice * stock.quantity;
    const profit = value - invested;

    const profitPercent =
        stock.purchasePrice > 0
            ? ((unitPrice - stock.purchasePrice) / stock.purchasePrice) * 100
            : 0;

    const dailyChangePercent = quote?.changePercent ?? stock.changePercent;

    const dailyChangeMoney =
        dailyChangePercent == null
            ? null
            : (unitPrice * dailyChangePercent * stock.quantity) / 100;

    const shareOfPortfolio =
        portfolioValue > 0 ? (value / portfolioValue) * 100 : 0;

    const profitClass =
        profit > 0
            ? 'asset-details__profit asset-details__profit--positive'
            : profit < 0
                ? 'asset-details__profit asset-details__profit--negative'
                : 'asset-details__profit';

    const dailyChange =
        dailyChangePercent == null || dailyChangeMoney == null
            ? '—'
            : `${dailyChangePercent > 0 ? '+' : ''}${dailyChangePercent.toFixed(2)}% (${dailyChangeMoney > 0 ? '+' : ''}${formatMoney(dailyChangeMoney)})`;

    const dailyChangeClass =
        dailyChangePercent == null
            ? ''
            : dailyChangePercent > 0
                ? 'text-positive'
                : dailyChangePercent < 0
                    ? 'text-negative'
                    : '';

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={`${stock.ticker} — ${stock.name}`}
        >
            <div className="asset-details">
                <div className={profitClass}>
                    <div className="asset-details__profit-label">
                        Прибыль / убыток
                    </div>

                    <div className="asset-details__profit-value">
                        <span>
                            {profit > 0 ? '+' : ''}
                            {formatMoney(profit)}
                        </span>

                        <span className="asset-details__profit-percent">
                            {formatPercent(profitPercent)}
                        </span>
                    </div>
                </div>

                <dl className="asset-details__list">
                    <div className="asset-details__row">
                        <dt>Количество</dt>
                        <dd>{stock.quantity} шт.</dd>
                    </div>

                    <div className="asset-details__row">
                        <dt>Цена покупки</dt>
                        <dd>{formatMoney(stock.purchasePrice)}</dd>
                    </div>

                    <div className="asset-details__row">
                        <dt>Текущая цена</dt>
                        <dd>{formatMoney(unitPrice)}</dd>
                    </div>

                    <div className="asset-details__row">
                        <dt>Вложено</dt>
                        <dd>{formatMoney(invested)}</dd>
                    </div>

                    <div className="asset-details__row">
                        <dt>Стоимость позиции</dt>
                        <dd>{formatMoney(value)}</dd>
                    </div>

                    <div className="asset-details__row">
                        <dt>Доля в портфеле</dt>
                        <dd>{shareOfPortfolio.toFixed(2)}%</dd>
                    </div>

                    <div className="asset-details__row">
                        <dt>Изменение за день</dt>
                        <dd className={dailyChangeClass}>
                            {dailyChange}
                        </dd>
                    </div>

                    <div className="asset-details__row">
                        <dt>Куплено</dt>
                        <dd>{formatDateTime(stock.createdAt)}</dd>
                    </div>

                    <div className="asset-details__row">
                        <dt>Данные MOEX</dt>
                        <dd>{formatDateTime(quote?.lastUpdate ?? null)}</dd>
                    </div>
                </dl>
            </div>
        </Modal>
    );
}

export default AssetDetailsModal;
