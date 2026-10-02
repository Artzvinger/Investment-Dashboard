import 'dotenv/config';

import { databaseConfig } from './database.config';

export const config = {
    port: Number(process.env.PORT) || 3000,
    corsOrigin:
        process.env.CORS_ORIGIN ||
        'http://localhost:5173',
    database: databaseConfig,
};

export { databaseConfig };