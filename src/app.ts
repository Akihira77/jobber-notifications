import { winstonLogger } from "@Akihira77/jobber-shared";
import { Logger } from "winston";
import { ELASTIC_SEARCH_URL } from "@notifications/config";
import express, { Express } from "express";
import { start } from "@notifications/server";

const log: Logger = winstonLogger(
    `${ELASTIC_SEARCH_URL}`,
    "notificationServiceApp",
    "debug"
);

function initialize(): void {
    const app: Express = express();
    start(app);
    log.info("Notification Service Initialize");
}

initialize();
