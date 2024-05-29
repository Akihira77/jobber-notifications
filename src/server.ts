import "express-async-errors";
import http from "http";

import { Application } from "express";
import { PORT } from "@notifications/config";
import { healthRoute } from "@notifications/routes";
import { Logger } from "winston";
import { NotificationQueue } from "./queues/notification.queue";
import { ElasticSearchClient } from "./elasticsearch";

export async function start(
    app: Application,
    logger: (moduleName: string) => Logger
): Promise<void> {
    await startQueues(logger);
    startElasticSearch(logger);

    startServer(app, logger);
    app.use("", healthRoute());
}

async function startQueues(
    logger: (moduleName: string) => Logger
): Promise<void> {
    const queue = new NotificationQueue(null, logger);
    await queue.createConnection();
    queue.consumeAuthEmailMessages();
    queue.consumeOrderEmailMessages();
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
    const elastic = new ElasticSearchClient(logger);
    await elastic.checkConnection();

    return elastic;
}

function startServer(
    app: Application,
    logger: (moduleName: string) => Logger
): void {
    try {
        const httpServer: http.Server = new http.Server(app);
        logger("server.ts - startServer()").info(
            `NotificationService has started with pid ${process.pid}`
        );

        httpServer.listen(Number(PORT), () => {
            logger("server.ts - startServer()").info(
                `NotificationService running on port ${PORT}`
            );
        });
    } catch (error) {
        logger("server.ts - startServer()").error(
            "NotificationService startServer() method error:",
            error
        );
    }
}
