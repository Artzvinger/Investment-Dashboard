import 'dotenv/config';

import { prisma } from '../lib/prisma';

async function main(): Promise<void> {
    const { count } = await prisma.stock.deleteMany();

    console.log(`Таблица Stock очищена. Удалено записей: ${count}`);
}

main()
    .catch((error: unknown) => {
        console.error('Не удалось очистить таблицу Stock:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
