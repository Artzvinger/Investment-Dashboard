export interface ProfitData {
    profit: number | null;
    profitPercent: number | null;
}

export function computeProfit(
    purchasePrice: number,
    currentPrice: number | null,
    quantity: number,
): ProfitData {
    if (currentPrice == null || purchasePrice <= 0) {
        return {
            profit: null,
            profitPercent: null,
        };
    }

    const profit = (currentPrice - purchasePrice) * quantity;
    const profitPercent =
        ((currentPrice - purchasePrice) / purchasePrice) * 100;

    return { profit, profitPercent };
}
