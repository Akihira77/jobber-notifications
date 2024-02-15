import "express-async-errors";
import http from "http";

import { winstonLogger } from "@Akihira77/jobber-shared";
import { Logger } from "winston";
import { Application } from "express";
import { ELASTIC_SEARCH_URL, PORT } from "@notifications/config";
import { healthRoute } from "@notifications/routes";
import { checkConnection } from "@notifications/elasticsearch";
import { createConnection } from "@notifications/queues/connection";
import { Channel } from "amqplib";
import {
    consumeAuthEmailMessages,
    consumeOrderEmailMessages
} from "@notifications/queues/email.consumer";

const log: Logger = winstonLogger(
    `${ELASTIC_SEARCH_URL}`,
    "notificationServer",
    "debug"
);

export function start(app: Application): void {
    startServer(app);
    app.use("", healthRoute());

    startQueues();

    startElasticSearch();
}

async function startQueues(): Promise<void> {
    const emailChanel = (await createConnection()) as Channel;

    await consumeAuthEmailMessages(emailChanel);
    await consumeOrderEmailMessages(emailChanel);

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

function startElasticSearch(): void {
    checkConnection();
}

function startServer(app: Application): void {
    try {
        const httpServer: http.Server = new http.Server(app);
        log.info(
            `Worker with process id of ${process.pid} of notification server has started`
        );

        httpServer.listen(Number(PORT), () => {
            log.info(`Notification server running on port ${PORT}`);
        });
    } catch (error) {
        log.error("NotificationService startServer() method error:", error);
    }
}
