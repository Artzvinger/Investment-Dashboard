import { Router } from 'express';

import { prisma } from '../../lib/prisma';
import { toStockDto } from '../dto/stock.dto';

const router = Router();

router.get('/', async (_req, res, next) => {
    try {
        const stocks = await prisma.stock.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(stocks.map(toStockDto));
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: 'Некорректный ID акции' });
            return;
        }

        const stock = await prisma.stock.findUnique({
            where: { id },
        });

        if (!stock) {
            res.status(404).json({ message: 'Акция не найдена' });
            return;
        }

        res.json(toStockDto(stock));
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const {
            ticker,
            name,
            quantity,
            purchasePrice,
            userId,
            currentPrice,
            changePercent,
            lastUpdate,
        } = req.body;

        if (
            typeof ticker !== 'string' ||
            !ticker.trim() ||
            typeof name !== 'string' ||
            !name.trim() ||
            !Number.isInteger(quantity) ||
            quantity <= 0 ||
            typeof purchasePrice !== 'number' ||
            !Number.isFinite(purchasePrice) ||
            purchasePrice <= 0 ||
            !Number.isInteger(userId) ||
            userId <= 0
        ) {
            res.status(400).json({ message: 'Некорректные данные акции' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(400).json({ message: 'Пользователь не найден' });
            return;
        }

        const normalizedTicker = ticker.trim().toUpperCase();

        const marketData = {
            ...(typeof currentPrice === 'number' &&
            Number.isFinite(currentPrice) &&
            currentPrice > 0
                ? { currentPrice }
                : {}),
            ...(typeof changePercent === 'number' &&
            Number.isFinite(changePercent)
                ? { changePercent }
                : {}),
            ...(typeof lastUpdate === 'string' &&
            !Number.isNaN(Date.parse(lastUpdate))
                ? { lastUpdate: new Date(lastUpdate) }
                : {}),
        };

        const existingStock = await prisma.stock.findFirst({
            where: {
                ticker: normalizedTicker,
                userId,
            },
        });

        if (existingStock) {
            const totalQuantity =
                existingStock.quantity + quantity;

            const weightedPurchasePrice =
                (Number(existingStock.purchasePrice) *
                    existingStock.quantity +
                    purchasePrice * quantity) /
                totalQuantity;

            const mergedStock = await prisma.stock.update({
                where: { id: existingStock.id },
                data: {
                    name: name.trim(),
                    quantity: totalQuantity,
                    purchasePrice: weightedPurchasePrice,
                    ...marketData,
                },
            });

            res.json(toStockDto(mergedStock));
            return;
        }

        const stock = await prisma.stock.create({
            data: {
                ticker: normalizedTicker,
                name: name.trim(),
                quantity,
                purchasePrice,
                userId,
                ...marketData,
            },
        });

        res.status(201).json(toStockDto(stock));
    } catch (error) {
        if ((error as { code?: string }).code === 'P2002') {
            res.status(409).json({
                message: 'Такая акция уже есть в портфеле',
            });
            return;
        }

        next(error);
    }
});

router.patch('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: 'Некорректный ID акции' });
            return;
        }

        const existingStock = await prisma.stock.findUnique({
            where: { id },
        });

        if (!existingStock) {
            res.status(404).json({ message: 'Акция не найдена' });
            return;
        }

        const {
            ticker,
            name,
            quantity,
            purchasePrice,
            currentPrice,
            changePercent,
            lastUpdate,
        } = req.body;

        if (
            (ticker !== undefined &&
                (typeof ticker !== 'string' || !ticker.trim())) ||
            (name !== undefined &&
                (typeof name !== 'string' || !name.trim())) ||
            (quantity !== undefined &&
                (!Number.isInteger(quantity) || quantity <= 0)) ||
            (purchasePrice !== undefined &&
                (typeof purchasePrice !== 'number' ||
                    !Number.isFinite(purchasePrice) ||
                    purchasePrice <= 0)) ||
            (currentPrice !== undefined &&
                currentPrice !== null &&
                (typeof currentPrice !== 'number' ||
                    !Number.isFinite(currentPrice) ||
                    currentPrice <= 0)) ||
            (changePercent !== undefined &&
                changePercent !== null &&
                (typeof changePercent !== 'number' ||
                    !Number.isFinite(changePercent))) ||
            (lastUpdate !== undefined &&
                lastUpdate !== null &&
                (typeof lastUpdate !== 'string' ||
                    Number.isNaN(Date.parse(lastUpdate))))
        ) {
            res.status(400).json({ message: 'Некорректные данные акции' });
            return;
        }

        const stock = await prisma.stock.update({
            where: { id },
            data: {
                ...(ticker !== undefined && {
                    ticker: ticker.trim().toUpperCase(),
                }),
                ...(name !== undefined && { name: name.trim() }),
                ...(quantity !== undefined && { quantity }),
                ...(purchasePrice !== undefined && { purchasePrice }),
                ...(currentPrice !== undefined && { currentPrice }),
                ...(changePercent !== undefined && { changePercent }),
                ...(lastUpdate !== undefined && {
                    lastUpdate:
                        lastUpdate === null ? null : new Date(lastUpdate),
                }),
            },
        });

        res.json(toStockDto(stock));
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: 'Некорректный ID акции' });
            return;
        }

        const stock = await prisma.stock.findUnique({
            where: { id },
        });

        if (!stock) {
            res.status(404).json({ message: 'Акция не найдена' });
            return;
        }

        await prisma.stock.delete({
            where: { id },
        });

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;