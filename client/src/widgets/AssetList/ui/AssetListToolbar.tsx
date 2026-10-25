import type {
    SortOrder,
    StockFilter,
    StockSort,
} from '../../../entities/stock/model/stockTypes';

interface AssetListToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    filter: StockFilter;
    onFilterChange: (filter: StockFilter) => void;
    sort: StockSort;
    order: SortOrder;
    onSortChange: (sort: StockSort, order: SortOrder) => void;
}

const FILTERS: { value: StockFilter; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'profitable', label: 'Прибыльные' },
    { value: 'losing', label: 'Убыточные' },
];

const SORTS: { value: StockSort; label: string }[] = [
    { value: 'date', label: 'По дате' },
    { value: 'ticker', label: 'По тикеру' },
    { value: 'price', label: 'По цене' },
    { value: 'profit', label: 'По прибыли' },
];

function AssetListToolbar({
                              search,
                              onSearchChange,
                              filter,
                              onFilterChange,
                              sort,
                              order,
                              onSortChange,
                          }: AssetListToolbarProps) {
    return (
        <div className="asset-list__toolbar">
            <input
                type="search"
                className="asset-list__search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Поиск по тикеру или названию"
                aria-label="Поиск акций"
            />

            <div className="asset-list__filters">
                {FILTERS.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        className={
                            filter === item.value
                                ? 'asset-list__chip asset-list__chip--active'
                                : 'asset-list__chip'
                        }
                        onClick={() => onFilterChange(item.value)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="asset-list__sort">
                <select
                    value={sort}
                    onChange={(event) =>
                        onSortChange(
                            event.target.value as StockSort,
                            order,
                        )
                    }
                    aria-label="Сортировка"
                >
                    {SORTS.map((item) => (
                        <option
                            key={item.value}
                            value={item.value}
                        >
                            {item.label}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="asset-list__order"
                    onClick={() =>
                        onSortChange(
                            sort,
                            order === 'asc' ? 'desc' : 'asc',
                        )
                    }
                    aria-label={
                        order === 'asc'
                            ? 'По возрастанию'
                            : 'По убыванию'
                    }
                >
                    {order === 'asc' ? '↑' : '↓'}
                </button>
            </div>
        </div>
    );
}

export default AssetListToolbar;
