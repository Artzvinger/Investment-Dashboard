export interface Stock {
    id: number;
    ticker: string;
    name: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number | null;
    changePercent: number | null;
    lastUpdate: string | null;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export type CreateStockInput = Pick<
    Stock,
    'ticker' | 'name' | 'quantity' | 'purchasePrice'
>;

export type UpdateStockInput = Partial<
    Pick<
        Stock,
        'currentPrice' | 'changePercent' | 'lastUpdate'
    >
>;