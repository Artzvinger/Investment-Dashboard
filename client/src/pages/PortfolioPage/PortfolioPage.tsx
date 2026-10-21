import AssetList from '../../widgets/AssetList/ui/AssetList';

function PortfolioPage() {
    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>Портфель</h1>
                    <p className="page-subtitle">
                        Список активов инвестиционного портфеля
                    </p>
                </div>
            </div>

            <AssetList />
        </main>
    );
}

export default PortfolioPage;
