import { Prisma } from '../../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import { toStockDto, type StockDto } from '../dto/stock.dto';

export type StockFilter = 'all' | 'profitable' | 'losing';
export type StockSort = 'date' | 'ticker' | 'price' | 'profit';
export type SortOrder = 'asc' | 'desc';

export interface StocksPageParams {
    search: string;
    filter: StockFilter;
    sort: StockSort;
    order: SortOrder;
    page: number;
    limit: number;
}

export interface PortfolioSummaryDto {
    invested: number;
    value: number;
    profit: number;
    profitPercent: number;
}

export interface StocksPageDto {
    items: StockDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: PortfolioSummaryDto;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export function parseStocksPageParams(
    query: Record<string, unknown>,
): StocksPageParams {
    const rawPage = Number(query.page);
    const rawLimit = Number(query.limit);

    const filter: StockFilter =
        query.filter === 'profitable' || query.filter === 'losing'
            ? query.filter
            : 'all';

    const sort: StockSort =
        query.sort === 'ticker' ||
        query.sort === 'price' ||
        query.sort === 'profit'
            ? query.sort
            : 'date';

    const order: SortOrder =
        query.order === 'asc' ? 'asc' : 'desc';

    return {
        search:
            typeof query.search === 'string'
                ? query.search.trim()
                : '',
        filter,
        sort,
        order,
        page:
            Number.isInteger(rawPage) && rawPage > 0
                ? rawPage
                : 1,
        limit:
            Number.isInteger(rawLimit) && rawLimit > 0
                ? Math.min(rawLimit, MAX_LIMIT)
                : DEFAULT_LIMIT,
    };
}

export async function getStocksPage(
    params: StocksPageParams,
): Promise<StocksPageDto> {
    const { search, filter, sort, order, page, limit } = params;

    const where: Prisma.StockWhereInput = {
        ...(search
            ? {
                  OR: [
                      {
                          ticker: {
                              contains: search,
                              mode: 'insensitive',
                          },
                      },
                      {
                          name: {
                              contains: search,
                              mode: 'insensitive',
                          },
                      },
                  ],
              }
            : {}),
        ...(filter === 'profitable'
            ? { profit: { gt: 0 } }
            : {}),
        ...(filter === 'losing' ? { profit: { lt: 0 } } : {}),
    };

    const orderBy: Prisma.StockOrderByWithRelationInput =
        sort === 'profit'
            ? { profit: order }
            : sort === 'price'
                ? { purchasePrice: order }
                : sort === 'ticker'
                    ? { ticker: order }
                    : { createdAt: order };

    const [items, total, allStocks] = await prisma.$transaction([
        prisma.stock.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.stock.count({ where }),
        prisma.stock.findMany({
            select: {
                purchasePrice: true,
                currentPrice: true,
                quantity: true,
            },
        }),
    ]);

    let invested = 0;
    let value = 0;

    for (const stock of allStocks) {
        const currentPrice =
            stock.currentPrice == null
                ? Number(stock.purchasePrice)
                : Number(stock.currentPrice);

        invested += Number(stock.purchasePrice) * stock.quantity;
        value += currentPrice * stock.quantity;
    }

    const profit = value - invested;
    const profitPercent =
        invested > 0 ? (profit / invested) * 100 : 0;

    return {
        items: items.map(toStockDto),
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        summary: {
            invested,
            value,
            profit,
            profitPercent,
        },
    };
}
