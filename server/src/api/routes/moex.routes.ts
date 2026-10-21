import { Router } from 'express';

import {
    fetchMoexQuote,
    isValidTicker,
    type MoexQuote,
} from '../services/moex.service';

const router = Router();

const MAX_BATCH_TICKERS = 50;

router.get('/stocks/:ticker', async (req, res, next) => {
    try {
        const ticker = req.params.ticker.toUpperCase();

        if (!isValidTicker(ticker)) {
            res.status(400).json({
                message: 'Некорректный тикер акции',
            });
            return;
        }

        const quote = await fetchMoexQuote(ticker);

        if (!quote) {
            res.status(404).json({
                message: `Акция ${ticker} не найдена или цена недоступна`,
            });
            return;
        }

        res.json(quote);
    } catch (error) {
        next(error);
    }
});

router.get('/quotes', async (req, res, next) => {
    try {
        const rawTickers =
            typeof req.query.tickers === 'string'
                ? req.query.tickers
                : '';

        const tickers = Array.from(
            new Set(
                rawTickers
                    .split(',')
                    .map((ticker) => ticker.trim().toUpperCase())
                    .filter((ticker) => ticker.length > 0),
            ),
        );

        if (tickers.length === 0) {
            res.json([]);
            return;
        }

        if (tickers.length > MAX_BATCH_TICKERS) {
            res.status(400).json({
                message: `Слишком много тикеров (максимум ${MAX_BATCH_TICKERS})`,
            });
            return;
        }

        const invalidTicker = tickers.find(
            (ticker) => !isValidTicker(ticker),
        );

        if (invalidTicker) {
            res.status(400).json({
                message: `Некорректный тикер: ${invalidTicker}`,
            });
            return;
        }

        const results = await Promise.allSettled(
            tickers.map((ticker) => fetchMoexQuote(ticker)),
        );

        const quotes = results
            .filter(
                (
                    result,
                ): result is PromiseFulfilledResult<MoexQuote | null> =>
                    result.status === 'fulfilled',
            )
            .map((result) => result.value)
            .filter((quote): quote is MoexQuote => quote !== null);

        res.json(quotes);
    } catch (error) {
        next(error);
    }
});

export default router;
