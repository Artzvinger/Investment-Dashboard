import type {
    InstrumentBoard,
    InstrumentDirection,
    InstrumentMarket,
} from '../../../entities/instrument/model/instrumentTypes';

interface InstrumentCatalogToolbarProps {
    market: InstrumentMarket;
    search: string;
    onSearchChange: (value: string) => void;
    direction: InstrumentDirection;
    onDirectionChange: (direction: InstrumentDirection) => void;
    board: InstrumentBoard;
    onBoardChange: (board: InstrumentBoard) => void;
}

const DIRECTIONS: { value: InstrumentDirection; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'up', label: 'Растущие' },
    { value: 'down', label: 'Падающие' },
];

const BOARDS: { value: InstrumentBoard; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'TQCB', label: 'Корпоративные' },
    { value: 'TQOB', label: 'ОФЗ' },
];

function chipClass(isActive: boolean): string {
    return isActive
        ? 'instrument-catalog__chip instrument-catalog__chip--active'
        : 'instrument-catalog__chip';
}

function InstrumentCatalogToolbar({
                                      market,
                                      search,
                                      onSearchChange,
                                      direction,
                                      onDirectionChange,
                                      board,
                                      onBoardChange,
                                  }: InstrumentCatalogToolbarProps) {
    return (
        <div className="instrument-catalog__toolbar">
            <input
                type="search"
                className="instrument-catalog__search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Поиск по тикеру или названию"
                aria-label="Поиск бумаг"
            />

            <div className="instrument-catalog__filters">
                {DIRECTIONS.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        className={chipClass(direction === item.value)}
                        onClick={() => onDirectionChange(item.value)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {market === 'bonds' && (
                <div className="instrument-catalog__filters">
                    {BOARDS.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            className={chipClass(board === item.value)}
                            onClick={() => onBoardChange(item.value)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default InstrumentCatalogToolbar;
