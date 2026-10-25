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
    profit: number | null;
    profitPercent: number | null;
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
        profit:
            stock.profit == null ? null : Number(stock.profit),
        profitPercent: stock.profitPercent,
        userId: stock.userId,
        createdAt: stock.createdAt.toISOString(),
        updatedAt: stock.updatedAt.toISOString(),
    };
}
