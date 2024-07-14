import { PORT } from "@notifications/config"
import { Logger } from "winston"
import { NotificationQueue } from "./queues/notification.queue"
import { ElasticSearchClient } from "./elasticsearch"
import { Context, Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { serve } from "@hono/node-server"

export async function start(
    app: Hono,
    logger: (moduleName?: string) => Logger
): Promise<void> {
    await startQueues(logger)
    startElasticSearch(logger)

    startServer(app, logger)
    app.get("/notification-health", (c: Context) => {
        return c.text("Notification service is healthy and OK.", StatusCodes.OK)
    })
}

async function startQueues(
    logger: (moduleName: string) => Logger
): Promise<void> {
    const queue = new NotificationQueue(logger)
    const pub = await queue.createConnection()
    const pubCh = await pub.createChannel()
    queue.consumeAuthEmailMessages(pubCh)
    queue.consumeOrderEmailMessages(pubCh)
    // Testing
    // const verificationLink = `${CLIENT_URL}/confirm_email?v_token=123213213adwawda`;
    // const messageDetails: IEmailMessageDetails = {
    //     receiverEmail: SENDER_EMAIL,
    //     resetLink: verificationLink,
    //     username: "Akihira",
    //     template: "verifyEmail" // must same as file name in emails folder,
    // };

    // await emailChanel.assertExchange("jobber-email-notification", "direct");

    // emailChanel.publish(
    //     "jobber-email-notification",
    //     "auth-email",
    //     Buffer.from(JSON.stringify(messageDetails))
    // );

    // await emailChanel.assertExchange("jobber-order-notification", "direct");

    // messageDetails.template = "orderPlaced";
    // emailChanel.publish(
    //     "jobber-order-notification",
    //     "order-email",
    //     Buffer.from(JSON.stringify(messageDetails))
    // );
}

async function startElasticSearch(
    logger: (moduleName: string) => Logger
): Promise<ElasticSearchClient> {
    const elastic = new ElasticSearchClient(logger)
    await elastic.checkConnection()

    return elastic
}

function startServer(hono: Hono, logger: (moduleName: string) => Logger): void {
    try {
        logger("server.ts - startServer()").info(
            `NotificationService has started with pid ${process.pid}`
        )

        serve({ fetch: hono.fetch, port: Number(PORT) }, (info) => {
            logger("server.ts - startServer()").info(
                `NotificationService running on port ${info.port}`
            )
        })
    } catch (error) {
        logger("server.ts - startServer()").error(
            "NotificationService startServer() method error:",
            error
        )
    }
}
