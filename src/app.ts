import { start } from "@notifications/server"
import { winstonLogger } from "@Akihira77/jobber-shared"
import { ELASTIC_SEARCH_URL } from "./config"
import { Logger } from "winston"
import { Hono } from "hono"

import { EventEmitter } from "events"

EventEmitter.setMaxListeners(20)

process.once("SIGINT", () => {
    process.exit(1)
})

process.once("SIGTERM", () => {
    process.exit(1)
})

async function main(): Promise<void> {
    const logger = (moduleName?: string): Logger =>
        winstonLogger(
            `${ELASTIC_SEARCH_URL}`,
            moduleName ?? "Notification Service",
            "debug"
        )
    const app = new Hono()
    await start(app, logger)
}

main()
