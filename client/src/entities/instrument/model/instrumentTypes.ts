export type InstrumentMarket = 'shares' | 'bonds';
export type InstrumentDirection = 'all' | 'up' | 'down';
export type InstrumentBoard = 'all' | 'TQBR' | 'TQCB' | 'TQOB';

export interface Instrument {
    ticker: string;
    name: string;
    board: string;
    price: number | null;
    changePercent: number | null;
    lotSize: number | null;
}

export interface InstrumentsQueryParams {
    search?: string;
    direction?: InstrumentDirection;
    board?: InstrumentBoard;
    page?: number;
    limit?: number;
}

export interface InstrumentsResponse {
    items: Instrument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    fetchedAt: string;
}
