
import { useStocksQuery } from '../../entities/stock/model/stockQueries';
import AddAssetForm from '../../widgets/AssetList/ui/AddAssetForm';

function PortfolioPage() {
    const {
        data: stocks,
        isLoading,
        isError,
        refetch,
    } = useStocksQuery();

    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>Портфель</h1>
                    <p className="page-subtitle">
                        Список активов инвестиционного портфеля
                    </p>
                </div>

                <div className="page-header__actions">
                    <AddAssetForm />

                    <button
                        type="button"
                        onClick={() => refetch()}
                    >
                        Обновить
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="card">
                    Загрузка акций...
                </div>
            )}

            {isError && (
                <div className="error-message">
                    <p>Не удалось загрузить акции. Проверь backend.</p>

                    <button
                        type="button"
                        onClick={() => refetch()}
                    >
                        Повторить
                    </button>
                </div>
            )}

            {!isLoading && !isError && stocks?.length === 0 && (
                <div className="empty-state card">
                    <h3>Пока нет акций</h3>
                    <p>
                        Добавь первую акцию, чтобы она появилась в портфеле.
                    </p>
                </div>
            )}

            {!isLoading && !isError && stocks && stocks.length > 0 && (
                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Тикер</th>
                            <th>Название</th>
                            <th>Количество</th>
                            <th>Цена покупки</th>
                            <th>Текущая цена</th>
                            <th>Изменение</th>
                        </tr>
                        </thead>

                        <tbody>
                        {stocks.map((stock) => (
                            <tr key={stock.id}>
                                <td>{stock.ticker}</td>
                                <td>{stock.name}</td>
                                <td>{stock.quantity}</td>

                                <td>
                                    {stock.purchasePrice.toLocaleString('ru-RU')} ₽
                                </td>

                                <td>
                                    {stock.currentPrice == null
                                        ? '—'
                                        : `${stock.currentPrice.toLocaleString('ru-RU')} ₽`}
                                </td>

                                <td
                                    className={
                                        stock.changePercent == null
                                            ? ''
                                            : stock.changePercent > 0
                                                ? 'text-positive'
                                                : stock.changePercent < 0
                                                    ? 'text-negative'
                                                    : ''
                                    }
                                >
                                    {stock.changePercent == null
                                        ? '—'
                                        : `${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}

export default PortfolioPage;