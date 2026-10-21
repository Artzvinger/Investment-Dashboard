const MOEX_ISSU_URL =
    'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities';

const CACHE_TTL_MS = 10_000;
const REQUEST_TIMEOUT_MS = 8_000;

interface IssBlock {
    columns: string[];
    data: (string | number | null)[][];
}

interface IssResponse {
    securities?: IssBlock;
    marketdata?: IssBlock;
}

export interface MoexQuote {
    ticker: string;
    name: string;
    currentPrice: number;
    changePercent: number | null;
    lastUpdate: string;
}

interface CachedQuote {
    quote: MoexQuote;
    expiresAt: number;
}

const quoteCache = new Map<string, CachedQuote>();

function getRow(
    block: IssBlock | undefined,
): Record<string, string | number | null> | null {
    if (!block?.data.length) {
        return null;
    }

    return Object.fromEntries(
        block.columns.map((column, index) => [
            column,
            block.data[0][index] ?? null,
        ]),
    );
}

export function isValidTicker(ticker: string): boolean {
    return /^[A-Z0-9.-]{1,20}$/.test(ticker);
}

export async function fetchMoexQuote(
    ticker: string,
): Promise<MoexQuote | null> {
    const cached = quoteCache.get(ticker);

    if (cached && cached.expiresAt > Date.now()) {
        return cached.quote;
    }

    const url = new URL(
        `${MOEX_ISSU_URL}/${encodeURIComponent(ticker)}.json`,
    );

    url.searchParams.set('iss.meta', 'off');
    url.searchParams.set('iss.only', 'securities,marketdata');

    const response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new Error(
            `MOEX request failed with status ${response.status}`,
        );
    }

    const result = (await response.json()) as IssResponse;

    const security = getRow(result.securities);
    const market = getRow(result.marketdata);

    const currentPrice = market?.LAST;

    if (
        !security ||
        !market ||
        typeof currentPrice !== 'number' ||
        !Number.isFinite(currentPrice) ||
        currentPrice <= 0
    ) {
        return null;
    }

    const change = market.LASTCHANGEPRCNT;

    const quote: MoexQuote = {
        ticker,
        name: String(
            security.SHORTNAME ?? security.SECNAME ?? ticker,
        ),
        currentPrice,
        changePercent:
            typeof change === 'number' && Number.isFinite(change)
                ? change
                : null,
        lastUpdate: new Date().toISOString(),
    };

    quoteCache.set(ticker, {
        quote,
        expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return quote;
}
