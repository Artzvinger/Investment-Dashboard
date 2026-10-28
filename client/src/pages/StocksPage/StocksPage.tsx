import InstrumentCatalog from '../../widgets/InstrumentCatalog/ui/InstrumentCatalog';

function StocksPage() {
    return (
        <main className="page">
            <InstrumentCatalog market="shares" />
        </main>
    );
}

export default StocksPage;
