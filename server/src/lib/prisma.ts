import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString =
    process.env.DATABASE_URL ??
    'postgresql://postgres:mysecretpassword@localhost:5432/specflow';

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
