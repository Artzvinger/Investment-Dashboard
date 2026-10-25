import { fetchMoexQuote, type MoexQuote } from '../api/services/moex.service';
import { computeProfit } from '../lib/profit';
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
            select: {
                id: true,
                ticker: true,
                purchasePrice: true,
                quantity: true,
            },
        });

        if (stocks.length === 0) {
            return;
        }

        const tickers = Array.from(
            new Set(stocks.map((stock) => stock.ticker)),
        );

        const results = await Promise.allSettled(
            tickers.map((ticker) => fetchMoexQuote(ticker)),
        );

        const quotesByTicker = new Map<string, MoexQuote>();

        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                quotesByTicker.set(
                    result.value.ticker,
                    result.value,
                );
            }
        }

        for (const stock of stocks) {
            const quote = quotesByTicker.get(stock.ticker);

            if (!quote) {
                continue;
            }

            const profitData = computeProfit(
                Number(stock.purchasePrice),
                quote.currentPrice,
                stock.quantity,
            );

            await prisma.stock.update({
                where: { id: stock.id },
                data: {
                    currentPrice: quote.currentPrice,
                    changePercent: quote.changePercent,
                    lastUpdate: new Date(quote.lastUpdate),
                    ...profitData,
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
