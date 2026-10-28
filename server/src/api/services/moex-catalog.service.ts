const ISS_BASE =
    'https://iss.moex.com/iss/engines/stock/markets';

const CACHE_TTL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 15_000;

export type InstrumentMarket = 'shares' | 'bonds';
export type InstrumentDirection = 'all' | 'up' | 'down';
export type InstrumentBoard = 'all' | 'TQBR' | 'TQCB' | 'TQOB';

export interface InstrumentDto {
    ticker: string;
    name: string;
    board: string;
    price: number | null;
    changePercent: number | null;
    lotSize: number | null;
}

export interface InstrumentsQuery {
    search: string;
    direction: InstrumentDirection;
    board: InstrumentBoard;
    page: number;
    limit: number;
}

export interface InstrumentsResponseDto {
    items: InstrumentDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    fetchedAt: string;
}

interface CachedList {
    items: InstrumentDto[];
    fetchedAt: string;
    expiresAt: number;
}

interface IssBlock {
    columns: string[];
    data: (string | number | null)[][];
}

interface IssResponse {
    securities?: IssBlock;
    marketdata?: IssBlock;
}

const MARKET_BOARDS: Record<InstrumentMarket, string[]> = {
    shares: ['TQBR'],
    bonds: ['TQCB', 'TQOB'],
};

const cache = new Map<InstrumentMarket, CachedList>();

function rowsToObjects(
    block: IssBlock | undefined,
): Record<string, string | number | null>[] {
    if (!block?.data.length) {
        return [];
    }

    return block.data.map((row) => {
        const record: Record<string, string | number | null> = {};

        block.columns.forEach((column, index) => {
            record[column] = row[index] ?? null;
        });

        return record;
    });
}

function toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

export function parseInstrumentsQuery(
    query: Record<string, unknown>,
): InstrumentsQuery {
    const rawPage = Number(query.page);
    const rawLimit = Number(query.limit);

    const direction: InstrumentDirection =
        query.direction === 'up' || query.direction === 'down'
            ? query.direction
            : 'all';

    const board: InstrumentBoard =
        query.board === 'TQBR' ||
        query.board === 'TQCB' ||
        query.board === 'TQOB'
            ? query.board
            : 'all';

    return {
        search:
            typeof query.search === 'string'
                ? query.search.trim()
                : '',
        direction,
        board,
        page:
            Number.isInteger(rawPage) && rawPage > 0
                ? rawPage
                : 1,
        limit:
            Number.isInteger(rawLimit) && rawLimit > 0
                ? Math.min(rawLimit, 100)
                : 25,
    };
}

async function fetchBoard(
    market: InstrumentMarket,
    board: string,
): Promise<InstrumentDto[]> {
    const url = new URL(
        `${ISS_BASE}/${market}/boards/${board}/securities.json`,
    );

    url.searchParams.set('iss.meta', 'off');
    url.searchParams.set('iss.only', 'securities,marketdata');

    const response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new Error(
            `MOEX catalog request failed with status ${response.status}`,
        );
    }

    const result = (await response.json()) as IssResponse;
    const securities = rowsToObjects(result.securities);
    const marketdata = rowsToObjects(result.marketdata);

    const marketBySecid = new Map<
        string,
        Record<string, string | number | null>
    >();

    for (const row of marketdata) {
        const secid = String(row.SECID ?? '');

        if (secid) {
            marketBySecid.set(secid, row);
        }
    }

    const items: InstrumentDto[] = [];

    for (const row of securities) {
        if (row.STATUS !== 'A') {
            continue;
        }

        const ticker = String(row.SECID ?? '');

        if (!ticker) {
            continue;
        }

        const marketRow = marketBySecid.get(ticker);

        const price = toNumber(
            marketRow?.LAST ??
                marketRow?.LCLOSEPRICE ??
                marketRow?.MARKETPRICE ??
                row.PREVPRICE,
        );

        items.push({
            ticker,
            name: String(row.SHORTNAME ?? row.SECNAME ?? ticker),
            board,
            price,
            changePercent: toNumber(marketRow?.LASTCHANGEPRCNT),
            lotSize: toNumber(row.LOTSIZE),
        });
    }

    return items;
}

async function getInstrumentList(
    market: InstrumentMarket,
): Promise<CachedList> {
    const cached = cache.get(market);

    if (cached && cached.expiresAt > Date.now()) {
        return cached;
    }

    const boards = MARKET_BOARDS[market];
    const results = await Promise.allSettled(
        boards.map((board) => fetchBoard(market, board)),
    );

    const byTicker = new Map<string, InstrumentDto>();
    let hasSuccess = false;

    for (const result of results) {
        if (result.status !== 'fulfilled') {
            continue;
        }

        hasSuccess = true;

        for (const item of result.value) {
            if (!byTicker.has(item.ticker)) {
                byTicker.set(item.ticker, item);
            }
        }
    }

    if (!hasSuccess) {
        throw new Error('Failed to load MOEX instruments');
    }

    const list: CachedList = {
        items: Array.from(byTicker.values()).sort((a, b) =>
            a.ticker.localeCompare(b.ticker),
        ),
        fetchedAt: new Date().toISOString(),
        expiresAt: Date.now() + CACHE_TTL_MS,
    };

    cache.set(market, list);

    return list;
}

export async function getInstruments(
    market: InstrumentMarket,
    query: InstrumentsQuery,
): Promise<InstrumentsResponseDto> {
    const list = await getInstrumentList(market);

    let items = list.items;

    if (query.search) {
        const search = query.search.toLowerCase();

        items = items.filter(
            (item) =>
                item.ticker.toLowerCase().includes(search) ||
                item.name.toLowerCase().includes(search),
        );
    }

    if (query.direction === 'up') {
        items = items.filter(
            (item) => (item.changePercent ?? 0) > 0,
        );
    } else if (query.direction === 'down') {
        items = items.filter(
            (item) => (item.changePercent ?? 0) < 0,
        );
    }

    if (market === 'bonds' && query.board !== 'all') {
        items = items.filter((item) => item.board === query.board);
    }

    const total = items.length;
    const totalPages = Math.max(
        1,
        Math.ceil(total / query.limit),
    );
    const page = Math.min(
        Math.max(1, query.page),
        totalPages,
    );
    const start = (page - 1) * query.limit;

    return {
        items: items.slice(start, start + query.limit),
        total,
        page,
        limit: query.limit,
        totalPages,
        fetchedAt: list.fetchedAt,
    };
}
