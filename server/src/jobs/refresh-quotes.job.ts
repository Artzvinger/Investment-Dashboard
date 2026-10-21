import { fetchMoexQuote } from '../api/services/moex.service';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

const REFRESH_INTERVAL_MS = 30_000;

let timer: NodeJS.Timeout | null = null;
let isRunning = false;

async function refreshQuotes(): Promise<void> {
    if (isRunning) {
        return;
    }

    isRunning = true;

    try {
        const stocks = await prisma.stock.findMany({
            select: { ticker: true },
            distinct: ['ticker'],
        });

        if (stocks.length === 0) {
            return;
        }

        const results = await Promise.allSettled(
            stocks.map(({ ticker }) => fetchMoexQuote(ticker)),
        );

        for (const result of results) {
            if (result.status !== 'fulfilled' || !result.value) {
                continue;
            }

            const quote = result.value;

            await prisma.stock.updateMany({
                where: { ticker: quote.ticker },
                data: {
                    currentPrice: quote.currentPrice,
                    changePercent: quote.changePercent,
                    lastUpdate: new Date(quote.lastUpdate),
                },
            });
        }
    } catch (error) {
        logger.error('Failed to refresh stock quotes', {
            error:
                error instanceof Error
                    ? error.message
                    : String(error),
        });
    } finally {
        isRunning = false;
    }
}

export function startQuotesRefreshJob(): void {
    if (timer) {
        return;
    }

    void refreshQuotes();

    timer = setInterval(() => {
        void refreshQuotes();
    }, REFRESH_INTERVAL_MS);
}

export function stopQuotesRefreshJob(): void {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}
