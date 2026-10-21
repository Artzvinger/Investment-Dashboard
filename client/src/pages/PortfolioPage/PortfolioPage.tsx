import { useQueryClient } from '@tanstack/react-query';

import { STOCKS_QUERY_KEY } from '../../entities/stock/model/stockQueries';
import AssetList from '../../widgets/AssetList/ui/AssetList';

function PortfolioPage() {
    const queryClient = useQueryClient();

    const handleRefresh = () => {
        queryClient.invalidateQueries({
            queryKey: STOCKS_QUERY_KEY.all,
        });
    };

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
                    <button
                        type="button"
                        onClick={handleRefresh}
                    >
                        Обновить
                    </button>
                </div>
            </div>

            <AssetList />
        </main>
    );
}

export default PortfolioPage;
