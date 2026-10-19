import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../utils/errors";
import { logger } from "../../utils/logger";

export function errorMiddleware(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message, details: err.details });
        return;
    }

    const error = err as Error;
    logger.error("Unhandled error", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Internal server error" });
}