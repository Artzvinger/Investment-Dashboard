import cors from 'cors';
import express, { type Express } from 'express';
import moexRoutes from './api/routes/moex.routes';
import { errorMiddleware } from './api/middleware/error.middleware';
import { config } from './config/index';
import stocksRoutes from './api/routes/stocks.routes';

export function createApp(): Express {
    const app = express();

    app.use(
        cors({
            origin: config.corsOrigin,
        }),
    );

    app.use(express.json());

    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok' });
    });

    app.use('/api/stocks', stocksRoutes);
    app.use('/api/moex', moexRoutes);
    app.use('/api/stocks', stocksRoutes);

    app.use(errorMiddleware);

    return app;
}