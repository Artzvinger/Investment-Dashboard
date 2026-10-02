import "dotenv/config";

import { createServer } from "node:http";

import { createApp } from "./app";
import { config } from "./config/index";
import { logger } from "./utils/logger";

async function bootstrap(): Promise<void> {
    const app = createApp();
    const httpServer = createServer(app);

    httpServer.listen(config.port, () => {
        logger.info(`Server listening on port ${config.port}`);
    });
}

bootstrap().catch((error: Error) => {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
});