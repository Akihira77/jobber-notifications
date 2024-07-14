import { IEmailLocals } from "@Akihira77/jobber-shared"
import {
    CLIENT_URL,
    exchangeNamesAndRoutingKeys,
    RABBITMQ_ENDPOINT
} from "@notifications/config"
import client, { Connection, Channel, ConsumeMessage } from "amqplib"
import { Logger } from "winston"
import { Value } from "@sinclair/typebox/value"
import {
    orderDeliveredSchema,
    orderExtensionApprovalSchema,
    orderExtensionSchema,
    orderPlacedSchema
} from "@notifications/schemas/emailLocal.schema"
import { sendEmail } from "./mail.transport"
import typia from "typia"

export class NotificationQueue {
    constructor(private logger: (moduleName: string) => Logger) {}

    async createConnection(): Promise<Connection> {
        try {
            const connection: Connection = await client.connect(
                `${RABBITMQ_ENDPOINT}`
            )
            const ch = await connection.createChannel()
            this.logger("queues/connection.ts - createConnection()").info(
                "NotificationService connected to RabbitMQ successfully..."
            )
            this.closeConnection(ch, connection)

            return connection
        } catch (error) {
            this.logger("queues/connection.ts - createConnection()").error(
                "NotificationService createConnection() method error:",
                error
            )
            process.exit(1)
        }
    }

    async consumeAuthEmailMessages(ch: Channel): Promise<void> {
        try {
            const { exchangeName, routingKey, queueName } =
                exchangeNamesAndRoutingKeys.email
            await ch.assertExchange(exchangeName, "direct")
            const jobberQueue = await ch.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            })
            await ch.bindQueue(jobberQueue.queue, exchangeName, routingKey)

            // consume
            ch.consume(
                jobberQueue.queue,
                async (msg: ConsumeMessage | null) => {
                    const appLink = `${CLIENT_URL}`
                    const appIcon = "https://i.ibb.co/Kyp2m0t/cover.png"
                    try {
                        const { template, receiverEmail } =
                            typia.json.isParse<any>(msg!.content.toString())

                        if (template === "forgotPassword") {
                            const { resetLink, username } =
                                typia.json.isParse<any>(msg!.content.toString())

                            const locals: IEmailLocals = {
                                appLink: appLink,
                                appIcon: appIcon,
                                username,
                                resetLink
                            }

                            sendEmail(
                                template,
                                receiverEmail,
                                locals,
                                this.logger
                            )

                            ch!.ack(msg!)
                        } else if (template === "resetPasswordSuccess") {
                            const { username } = typia.json.isParse<any>(
                                msg!.content.toString()
                            )

                            const locals: IEmailLocals = {
                                appLink: appLink,
                                appIcon: appIcon,
                                username
                            }

                            sendEmail(
                                template,
                                receiverEmail,
                                locals,
                                this.logger
                            )

                            ch!.ack(msg!)
                        } else if (template === "verifyEmail") {
                            const { verifyLink } = typia.json.isParse<any>(
                                msg!.content.toString()
                            )

                            const locals: IEmailLocals = {
                                appLink: appLink,
                                appIcon: appIcon,
                                verifyLink
                            }

                            sendEmail(
                                template,
                                receiverEmail,
                                locals,
                                this.logger
                            )

                            ch!.ack(msg!)
                        }

                        ch!.reject(msg!, false)
                    } catch (error) {
                        ch!.reject(msg!, false)

                        this.logger(
                            "queues/email.consumer.ts - consumeAuthEmailMessages()"
                        ).error(
                            "consuming message got errors. consumeAuthEmailMessages() method",
                            error
                        )
                    }
                }
            )
        } catch (error) {
            this.logger(
                "queues/email.consumer.ts - consumeAuthEmailMessages()"
            ).error(
                "NotificationService EmailConsumer consumeAuthEmailMessages(): method error:",
                error
            )
        }
    }

    async consumeOrderEmailMessages(ch: Channel): Promise<void> {
        try {
            const { exchangeName, routingKey, queueName } =
                exchangeNamesAndRoutingKeys.order
            await ch.assertExchange(exchangeName, "direct")
            const jobberQueue = await ch.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            })
            await ch.bindQueue(jobberQueue.queue, exchangeName, routingKey)

            // consume
            ch.consume(
                jobberQueue.queue,
                async (msg: ConsumeMessage | null) => {
                    try {
                        const { template } = typia.json.isParse<any>(
                            msg!.content.toString()
                        )

                        if (template === "orderPlaced") {
                            this.orderPlaceHandler(msg!)
                            ch!.ack(msg!)
                            return
                        } else if (template === "orderDelivered") {
                            this.orderDeliverHandler(msg!)
                            ch!.ack(msg!)
                            return
                        } else if (template === "orderExtension") {
                            this.orderExtensionHandler(msg!)
                            ch!.ack(msg!)
                            return
                        } else if (template === "orderExtensionApproval") {
                            this.orderExtensionApprovalHandler(msg!)
                            ch!.ack(msg!)
                            return
                        }

                        ch!.reject(msg!, false)
                    } catch (error) {
                        ch!.reject(msg!, false)

                        this.logger(
                            "queues/email.consumer.ts - consumeOrderEmailMessages()"
                        ).error(
                            "consuming message got errors. consumeOrderEmailMessages() method",
                            error
                        )
                    }
                }
            )
        } catch (error) {
            this.logger(
                "queues/email.consumer.ts - consumeOrderEmailMessages()"
            ).error(
                "NotificationService EmailConsumer consumeOrderEmailMessages(): method error:",
                error
            )
        }
    }

    orderPlaceHandler(msg: ConsumeMessage) {
        try {
            const data = typia.json.isParse<any>(msg!.content.toString())

            console.log(data, Value.Errors(orderPlacedSchema, data).First())
            if (!Value.Check(orderPlacedSchema, data)) {
                throw new Error(
                    Value.Errors(orderPlacedSchema, data).First()?.message
                )
            }

            const locals: IEmailLocals = {
                appLink: `${CLIENT_URL}`,
                appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
                orderId: data.orderId,
                orderDue: data.orderDue,
                amount: data.amount,
                buyerUsername: data.buyerUsername,
                sellerUsername: data.sellerUsername,
                title: data.title,
                description: data.description,
                requirements: data.requirements,
                serviceFee: data.serviceFee,
                total: data.total,
                orderUrl: data.orderUrl
            }

            sendEmail("orderPlaced", data.sellerEmail, locals, this.logger)
            sendEmail("orderReceipt", data.buyerEmail, locals, this.logger)
        } catch (error) {
            this.logger("queues/notification.queue.ts - ").error(error)
            throw error
        }
    }

    orderDeliverHandler(msg: ConsumeMessage) {
        try {
            // {
            //     orderId,
            //     buyerUsername,
            //     sellerUsername,
            //     title,
            //     description,
            //     orderUrl,
            //     receiverEmail
            // }
            const data = typia.json.isParse<any>(msg!.content.toString())

            if (!Value.Check(orderDeliveredSchema, data)) {
                throw new Error(
                    Value.Errors(orderDeliveredSchema, data).First()?.message
                )
            }

            const locals: IEmailLocals = {
                appLink: `${CLIENT_URL}`,
                appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
                orderId: data.orderId,
                buyerUsername: data.buyerUsername,
                sellerUsername: data.sellerUsername,
                title: data.title,
                description: data.description,
                orderUrl: data.orderUrl
            }

            sendEmail("orderDelivered", data.receiverEmail, locals, this.logger)
        } catch (error) {
            this.logger("queues/notification.queue.ts - ").error(error)
            throw error
        }
    }

    orderExtensionHandler(msg: ConsumeMessage) {
        try {
            // {
            //     orderId,
            //     buyerUsername,
            //     sellerUsername,
            //     originalDate,
            //     newDate,
            //     reason,
            //     orderUrl,
            //     receiverEmail
            // }
            const data = typia.json.isParse<any>(msg!.content.toString())

            if (!Value.Check(orderExtensionSchema, data)) {
                throw new Error(
                    Value.Errors(orderExtensionSchema, data).First()?.message
                )
            }

            const locals: IEmailLocals = {
                appLink: `${CLIENT_URL}`,
                appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
                orderId: data.orderId,
                buyerUsername: data.buyerUsername,
                sellerUsername: data.sellerUsername,
                originalDate: data.originalDate,
                newDate: data.newDate,
                reason: data.reason,
                orderUrl: data.orderUrl
            }

            sendEmail("orderExtension", data.receiverEmail, locals, this.logger)
        } catch (error) {
            this.logger("queues/notification.queue.ts - ").error(error)
            throw error
        }
    }

    orderExtensionApprovalHandler(msg: ConsumeMessage) {
        try {
            // {
            //     subject,
            //     buyerUsername,
            //     sellerUsername,
            //     type,
            //     message,
            //     header,
            //     orderUrl,
            //     receiverEmail
            // }
            const data = typia.json.isParse<any>(msg!.content.toString())

            if (!Value.Check(orderExtensionApprovalSchema, data)) {
                throw new Error(
                    Value.Errors(orderExtensionApprovalSchema, data).First()
                        ?.message
                )
            }

            const locals: IEmailLocals = {
                appLink: `${CLIENT_URL}`,
                appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
                subject: data.subject,
                buyerUsername: data.buyerUsername,
                sellerUsername: data.sellerUsername,
                header: data.header,
                type: data.type,
                message: data.message,
                orderUrl: data.orderUrl
            }

            sendEmail(
                "orderExtensionApproval",
                data.receiverEmail,
                locals,
                this.logger
            )
        } catch (error) {
            this.logger("queues/notification.queue.ts - ").error(error)
            throw error
        }
    }

    closeConnection(channel: Channel, connection: Connection): void {
        process.once("SIGINT", async () => {
            await channel.close()
            await connection.close()
        })

        process.once("SIGTERM", async () => {
            await channel.close()
            await connection.close()
        })
    }
}
