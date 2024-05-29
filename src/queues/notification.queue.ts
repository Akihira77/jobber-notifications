import { IEmailLocals } from "@Akihira77/jobber-shared";
import {
    CLIENT_URL,
    exchangeNamesAndRoutingKeys,
    RABBITMQ_ENDPOINT
} from "@notifications/config";
import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import { Logger } from "winston";
import { Value } from "@sinclair/typebox/value";
import {
    orderDeliveredSchema,
    orderExtensionApprovalSchema,
    orderExtensionSchema,
    orderPlacedSchema
} from "@notifications/schemas/emailLocal.schema";
import { sendEmail } from "./mail.transport";

export class NotificationQueue {
    constructor(
        private ch: Channel | null,
        private logger: (moduleName: string) => Logger
    ) {}

    async createConnection(): Promise<Channel> {
        try {
            const connection: Connection = await client.connect(
                `${RABBITMQ_ENDPOINT}`
            );
            this.ch = await connection.createChannel();
            this.logger("queues/connection.ts - createConnection()").info(
                "NotificationService connected to RabbitMQ successfully..."
            );
            this.closeConnection(this.ch, connection);

            return this.ch;
        } catch (error) {
            this.logger("queues/connection.ts - createConnection()").error(
                "NotificationService createConnection() method error:",
                error
            );
            process.exit(1);
        }
    }

    async consumeAuthEmailMessages(): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }

            const { exchangeName, routingKey, queueName } =
                exchangeNamesAndRoutingKeys.email;
            await this.ch.assertExchange(exchangeName, "direct");
            const jobberQueue = await this.ch.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            });
            await this.ch.bindQueue(
                jobberQueue.queue,
                exchangeName,
                routingKey
            );

            // consume
            this.ch.consume(
                jobberQueue.queue,
                async (msg: ConsumeMessage | null) => {
                    const appLink = `${CLIENT_URL}`;
                    const appIcon = "https://i.ibb.co/Kyp2m0t/cover.png";
                    try {
                        const { template, receiverEmail } = JSON.parse(
                            msg!.content.toString()
                        );

                        if (template === "forgotPassword") {
                            const { resetLink, username } = JSON.parse(
                                msg!.content.toString()
                            );

                            const locals: IEmailLocals = {
                                appLink: appLink,
                                appIcon: appIcon,
                                username,
                                resetLink
                            };

                            sendEmail(
                                template,
                                receiverEmail,
                                locals,
                                this.logger
                            );

                            this.ch!.ack(msg!);
                        } else if (template === "resetPasswordSuccess") {
                            const { username } = JSON.parse(
                                msg!.content.toString()
                            );

                            const locals: IEmailLocals = {
                                appLink: appLink,
                                appIcon: appIcon,
                                username
                            };

                            sendEmail(
                                template,
                                receiverEmail,
                                locals,
                                this.logger
                            );

                            this.ch!.ack(msg!);
                        } else if (template === "verifyEmail") {
                            const { verifyLink } = JSON.parse(
                                msg!.content.toString()
                            );

                            const locals: IEmailLocals = {
                                appLink: appLink,
                                appIcon: appIcon,
                                verifyLink
                            };

                            sendEmail(
                                template,
                                receiverEmail,
                                locals,
                                this.logger
                            );

                            this.ch!.ack(msg!);
                        }

                        this.ch!.reject(msg!, false);
                    } catch (error) {
                        this.ch!.reject(msg!, false);

                        this.logger(
                            "queues/email.consumer.ts - consumeAuthEmailMessages()"
                        ).error(
                            "consuming message got errors. consumeAuthEmailMessages() method",
                            error
                        );
                    }
                }
            );
        } catch (error) {
            this.logger(
                "queues/email.consumer.ts - consumeAuthEmailMessages()"
            ).error(
                "NotificationService EmailConsumer consumeAuthEmailMessages(): method error:",
                error
            );
        }
    }

    async consumeOrderEmailMessages(): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }

            const { exchangeName, routingKey, queueName } =
                exchangeNamesAndRoutingKeys.order;
            await this.ch.assertExchange(exchangeName, "direct");
            const jobberQueue = await this.ch.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            });
            await this.ch.bindQueue(
                jobberQueue.queue,
                exchangeName,
                routingKey
            );

            // consume
            this.ch.consume(
                jobberQueue.queue,
                async (msg: ConsumeMessage | null) => {
                    try {
                        const { template } = JSON.parse(
                            msg!.content.toString()
                        );

                        if (template === "orderPlaced") {
                            this.orderPlaceHandler(msg!);
                            this.ch!.ack(msg!);
                            return;
                        } else if (template === "orderDelivered") {
                            this.orderDeliverHandler(msg!);
                            this.ch!.ack(msg!);
                            return;
                        } else if (template === "orderExtension") {
                            this.orderExtensionHandler(msg!);
                            this.ch!.ack(msg!);
                            return;
                        } else if (template === "orderExtensionApproval") {
                            this.orderExtensionApprovalHandler(msg!);
                            this.ch!.ack(msg!);
                            return;
                        }

                        this.ch!.reject(msg!, false);
                    } catch (error) {
                        this.ch!.reject(msg!, false);

                        this.logger(
                            "queues/email.consumer.ts - consumeOrderEmailMessages()"
                        ).error(
                            "consuming message got errors. consumeOrderEmailMessages() method",
                            error
                        );
                    }
                }
            );
        } catch (error) {
            this.logger(
                "queues/email.consumer.ts - consumeOrderEmailMessages()"
            ).error(
                "NotificationService EmailConsumer consumeOrderEmailMessages(): method error:",
                error
            );
        }
    }

    orderPlaceHandler(msg: ConsumeMessage) {
        try {
            const {
                orderId,
                buyerEmail,
                sellerEmail,
                orderDue,
                amount,
                buyerUsername,
                sellerUsername,
                title,
                description,
                requirements,
                serviceFee,
                total,
                orderUrl
            } = JSON.parse(msg!.content.toString());

            if (!Value.Check(orderPlacedSchema, msg!.content)) {
                throw new Error(
                    Value.Errors(
                        orderPlacedSchema,
                        msg!.content
                    ).First.toString()
                );
            }

            const locals: IEmailLocals = {
                appLink: `${CLIENT_URL}`,
                appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
                orderId,
                orderDue,
                amount,
                buyerUsername,
                sellerUsername,
                title,
                description,
                requirements,
                serviceFee,
                total,
                orderUrl
            };

            sendEmail("orderPlaced", sellerEmail, locals, this.logger);
            sendEmail("orderReceipt", buyerEmail, locals, this.logger);
        } catch (error) {
            throw error;
        }
    }

    orderDeliverHandler(msg: ConsumeMessage) {
        try {
            const {
                orderId,
                buyerUsername,
                sellerUsername,
                title,
                description,
                orderUrl,
                receiverEmail
            } = JSON.parse(msg!.content.toString());

            if (!Value.Check(orderDeliveredSchema, msg!.content)) {
                throw new Error(
                    Value.Errors(
                        orderDeliveredSchema,
                        msg!.content
                    ).First.toString()
                );
            }

            const locals: IEmailLocals = {
                appLink: `${CLIENT_URL}`,
                appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
                orderId,
                buyerUsername,
                sellerUsername,
                title,
                description,
                orderUrl
            };

            sendEmail("orderDelivered", receiverEmail, locals, this.logger);
        } catch (error) {
            throw error;
        }
    }

    orderExtensionHandler(msg: ConsumeMessage) {
        try {
            const {
                orderId,
                buyerUsername,
                sellerUsername,
                originalDate,
                newDate,
                reason,
                orderUrl,
                receiverEmail
            } = JSON.parse(msg!.content.toString());

            if (!Value.Check(orderExtensionSchema, msg!.content)) {
                throw new Error(
                    Value.Errors(
                        orderExtensionSchema,
                        msg!.content
                    ).First.toString()
                );
            }

            const locals: IEmailLocals = {
                appLink: `${CLIENT_URL}`,
                appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
                orderId,
                buyerUsername,
                sellerUsername,
                originalDate,
                newDate,
                reason,
                orderUrl
            };

            sendEmail("orderExtension", receiverEmail, locals, this.logger);
        } catch (error) {
            throw error;
        }
    }

    orderExtensionApprovalHandler(msg: ConsumeMessage) {
        try {
            const {
                subject,
                buyerUsername,
                sellerUsername,
                type,
                message,
                header,
                orderUrl,
                receiverEmail
            } = JSON.parse(msg!.content.toString());

            if (!Value.Check(orderExtensionApprovalSchema, msg?.content)) {
                throw new Error(
                    Value.Errors(
                        orderExtensionApprovalSchema,
                        msg?.content
                    ).First.toString()
                );
            }

            const locals: IEmailLocals = {
                appLink: `${CLIENT_URL}`,
                appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
                subject,
                buyerUsername,
                sellerUsername,
                header,
                type,
                message,
                orderUrl
            };

            sendEmail(
                "orderExtensionApproval",
                receiverEmail,
                locals,
                this.logger
            );
        } catch (error) {
            throw error;
        }
    }

    closeConnection(channel: Channel, connection: Connection): void {
        process.once("SIGINT", async () => {
            await channel.close();
            await connection.close();
        });
    }
}
