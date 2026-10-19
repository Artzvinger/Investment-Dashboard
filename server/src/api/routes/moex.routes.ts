
import { Router } from 'express';

const router = Router();

interface IssBlock {
    columns: string[];
    data: (string | number | null)[][];
}

interface IssResponse {
    securities?: IssBlock;
    marketdata?: IssBlock;
}

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

router.get('/stocks/:ticker', async (req, res, next) => {
    try {
        const ticker = req.params.ticker.toUpperCase();

        if (!/^[A-Z0-9.-]{1,20}$/.test(ticker)) {
            res.status(400).json({
                message: 'Некорректный тикер акции',
            });
            return;
        }

        const url = new URL(
            `https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/${encodeURIComponent(ticker)}.json`,
        );

        url.searchParams.set('iss.meta', 'off');
        url.searchParams.set('iss.only', 'securities,marketdata');

        const response = await fetch(url, {
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            res.status(502).json({
                message: 'Не удалось получить данные Московской биржи',
            });
            return;
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
            res.status(404).json({
                message: `Акция ${ticker} не найдена или цена недоступна`,
            });
            return;
        }

        const change = market.LASTCHANGEPRCNT;

        res.json({
            ticker,
            name:
                security.SHORTNAME ??
                security.SECNAME ??
                ticker,
            currentPrice,
            changePercent:
                typeof change === 'number' &&
                Number.isFinite(change)
                    ? change
                    : null,
            lastUpdate: new Date().toISOString(),
        });
    } catch (error) {
        next(error);
    }
});

export default router;
