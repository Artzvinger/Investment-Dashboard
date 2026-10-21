import type { Stock } from '../../generated/prisma/client';

export interface StockDto {
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

export function toStockDto(stock: Stock): StockDto {
    return {
        id: stock.id,
        ticker: stock.ticker,
        name: stock.name,
        quantity: stock.quantity,
        purchasePrice: Number(stock.purchasePrice),
        currentPrice:
            stock.currentPrice == null
                ? null
                : Number(stock.currentPrice),
        changePercent: stock.changePercent,
        lastUpdate: stock.lastUpdate?.toISOString() ?? null,
        userId: stock.userId,
        createdAt: stock.createdAt.toISOString(),
        updatedAt: stock.updatedAt.toISOString(),
    };
}
