import express, { Express } from "express";
import { start } from "@notifications/server";
import { winstonLogger } from "@Akihira77/jobber-shared";
import { ELASTIC_SEARCH_URL } from "./config";
import { Logger } from "winston";

async function main(): Promise<void> {
    const logger = (moduleName?: string): Logger =>
    winstonLogger(
        `${ELASTIC_SEARCH_URL}`,
        moduleName ?? "Notification Service",
        "debug"
    );
    const app: Express = express();
    await start(app, logger);
}

main();
