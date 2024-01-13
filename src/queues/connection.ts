import { winstonLogger } from "@Akihira77/jobber-shared";
import { ELASTIC_SEARCH_URL, RABBITMQ_ENDPOINT } from "@notifications/config";
import client, { Connection, Channel } from "amqplib";
import { Logger } from "winston";

const log: Logger = winstonLogger(
    `${ELASTIC_SEARCH_URL}`,
    "notificationQueueConnection",
    "debug"
);

export async function createConnection(): Promise<Channel | undefined> {
    try {
        const connection: Connection = await client.connect(
            `${RABBITMQ_ENDPOINT}`
        );
        const channel: Channel = await connection.createChannel();
        log.info("Notification server connected to queue successfully...");
        closeConnection;

        return channel;
    } catch (error) {
        log.error(
            "NotificationService createConnection() method error:",
            error
        );
        return undefined;
    }
}

function closeConnection(channel: Channel, connection: Connection): void {
    process.once("SIGINT", async () => {
        await channel.close();
        await connection.close();
    });
}