import { CLIENT_URL, ELASTIC_SEARCH_URL } from "@notifications/config";
import { IEmailLocals, winstonLogger } from "@Akihira77/jobber-shared";
import { Channel, ConsumeMessage } from "amqplib";
import { Logger } from "winston";
import { createConnection } from "@notifications/queues/connection";
import { sendEmail } from "@notifications/queues/mail.transport";

const log: Logger = winstonLogger(
    `${ELASTIC_SEARCH_URL}`,
    "emailConsumer",
    "debug"
);

export async function consumeAuthEmailMessages(
    channel: Channel
): Promise<void> {
    try {
        if (!channel) {
            channel = (await createConnection()) as Channel;
        }

        const exchangeName = "jobber-email-notification";
        const routingKey = "auth-email";
        const queueName = "auth-email-queue";
        await channel.assertExchange(exchangeName, "direct");
        const jobberQueue = await channel.assertQueue(queueName, {
            durable: true,
            autoDelete: false
        });
        await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);

        // consume
        channel.consume(
            jobberQueue.queue,
            async (msg: ConsumeMessage | null) => {
                const {
                    receiverEmail,
                    username,
                    verifyLink,
                    resetLink,
                    template
                } = JSON.parse(msg!.content.toString());
                const locals: IEmailLocals = {
                    appLink: `${CLIENT_URL}`,
                    appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
                    username,
                    verifyLink,
                    resetLink
                };

                // send emails
                await sendEmail(template, receiverEmail, locals);

                // acknowledge
                channel.ack(msg!);
            }
        );
    } catch (error) {
        log.error(
            "NotificationService EmailConsumer consumeAuthEmailMessages(): method error:",
            error
        );
    }
}

export async function consumeOrderEmailMessages(
    channel: Channel
): Promise<void> {
    try {
        if (!channel) {
            channel = (await createConnection()) as Channel;
        }

        const exchangeName = "jobber-order-notification";
        const routingKey = "order-email";
        const queueName = "order-email-queue";
        await channel.assertExchange(exchangeName, "direct");
        const jobberQueue = await channel.assertQueue(queueName, {
            durable: true,
            autoDelete: false
        });
        await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);

        // consume
        channel.consume(
            jobberQueue.queue,
            async (msg: ConsumeMessage | null) => {
                const {
                    receiverEmail,
                    username,
                    template,
                    sender,
                    offerLink,
                    amount,
                    buyerUsername,
                    sellerUsername,
                    title,
                    description,
                    deliveryDays,
                    orderId,
                    orderDue,
                    requirements,
                    orderUrl,
                    originalDate,
                    newDate,
                    reason,
                    subject,
                    header,
                    type,
                    message,
                    serviceFee,
                    total
                } = JSON.parse(msg!.content.toString());

                const locals: IEmailLocals = {
                    appLink: `${CLIENT_URL}`,
                    appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
                    username,
                    sender,
                    offerLink,
                    amount,
                    buyerUsername,
                    sellerUsername,
                    title,
                    description,
                    deliveryDays,
                    orderId,
                    orderDue,
                    requirements,
                    orderUrl,
                    originalDate,
                    newDate,
                    reason,
                    subject,
                    header,
                    type,
                    message,
                    serviceFee,
                    total
                };

                // send emails
                if (template === "orderPlaced") {
                    await sendEmail("orderPlaced", receiverEmail, locals);
                    await sendEmail("orderReceipt", receiverEmail, locals);
                } else {
                    await sendEmail(template, receiverEmail, locals);
                }

                // acknowledge
                channel.ack(msg!);
            }
        );
    } catch (error) {
        log.error(
            "NotificationService EmailConsumer consumeAuthEmailMessages(): method error:",
            error
        );
    }
}
