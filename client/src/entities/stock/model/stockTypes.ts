export interface Stock {
    id: number;
    ticker: string;
    name: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number | null;
    changePercent: number | null;
    lastUpdate: string | null;
    profit: number | null;
    profitPercent: number | null;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export interface MoexStock {
    ticker: string;
    name: string;
    currentPrice: number;
    changePercent: number | null;
    lastUpdate: string;
}

export type CreateStockInput = Pick<
    Stock,
    'ticker' | 'name' | 'quantity' | 'purchasePrice' | 'userId'
> & {
    currentPrice?: number | null;
    changePercent?: number | null;
    lastUpdate?: string | null;
};

export type UpdateStockInput = Partial<
    Pick<
        Stock,
        'currentPrice' | 'changePercent' | 'lastUpdate'
    >
>;

export type StockFilter = 'all' | 'profitable' | 'losing';
export type StockSort = 'date' | 'ticker' | 'price' | 'profit';
export type SortOrder = 'asc' | 'desc';

export interface StocksQueryParams {
    search?: string;
    filter?: StockFilter;
    sort?: StockSort;
    order?: SortOrder;
    page?: number;
    limit?: number;
}

export interface PortfolioSummary {
    invested: number;
    value: number;
    profit: number;
    profitPercent: number;
}

export interface StocksPage {
    items: Stock[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: PortfolioSummary;
}
