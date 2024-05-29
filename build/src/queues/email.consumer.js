"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeOrderEmailMessages = exports.consumeAuthEmailMessages = void 0;
const config_1 = require("../config");
const connection_1 = require("../queues/connection");
const mail_transport_1 = require("../queues/mail.transport");
const emailLocal_schema_1 = require("../schemas/emailLocal.schema");
const value_1 = require("@sinclair/typebox/value");
const exchangeNamesAndRoutingKeys = {
    email: {
        exchangeName: "jobber-email-notification",
        routingKey: "auth-email",
        queueName: "auth-email-queue"
    },
    order: {
        exchangeName: "jobber-order-notification",
        routingKey: "order-email",
        queueName: "order-email-queue"
    }
};
function consumeAuthEmailMessages(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!channel) {
                channel = yield (0, connection_1.createConnection)();
            }
            const { exchangeName, routingKey, queueName } = exchangeNamesAndRoutingKeys.email;
            yield channel.assertExchange(exchangeName, "direct");
            const jobberQueue = yield channel.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            });
            yield channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
            // consume
            channel.consume(jobberQueue.queue, (msg) => __awaiter(this, void 0, void 0, function* () {
                const appLink = `${config_1.CLIENT_URL}`;
                const appIcon = "https://i.ibb.co/Kyp2m0t/cover.png";
                try {
                    const { template, receiverEmail } = JSON.parse(msg.content.toString());
                    if (template === "forgotPassword") {
                        const { resetLink, username } = JSON.parse(msg.content.toString());
                        const locals = {
                            appLink: appLink,
                            appIcon: appIcon,
                            username,
                            resetLink
                        };
                        (0, mail_transport_1.sendEmail)(template, receiverEmail, locals);
                        channel.ack(msg);
                    }
                    else if (template === "resetPasswordSuccess") {
                        const { username } = JSON.parse(msg.content.toString());
                        const locals = {
                            appLink: appLink,
                            appIcon: appIcon,
                            username
                        };
                        (0, mail_transport_1.sendEmail)(template, receiverEmail, locals);
                        channel.ack(msg);
                    }
                    else if (template === "verifyEmail") {
                        const { verifyLink } = JSON.parse(msg.content.toString());
                        const locals = {
                            appLink: appLink,
                            appIcon: appIcon,
                            verifyLink
                        };
                        (0, mail_transport_1.sendEmail)(template, receiverEmail, locals);
                        channel.ack(msg);
                    }
                    channel.reject(msg, false);
                }
                catch (error) {
                    channel.reject(msg, false);
                    (0, config_1.logger)("queues/email.consumer.ts - consumeAuthEmailMessages()").error("consuming message got errors. consumeAuthEmailMessages() method", error);
                }
            }));
        }
        catch (error) {
            (0, config_1.logger)("queues/email.consumer.ts - consumeAuthEmailMessages()").error("NotificationService EmailConsumer consumeAuthEmailMessages(): method error:", error);
        }
    });
}
exports.consumeAuthEmailMessages = consumeAuthEmailMessages;
function consumeOrderEmailMessages(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!channel) {
                channel = (yield (0, connection_1.createConnection)());
            }
            const { exchangeName, routingKey, queueName } = exchangeNamesAndRoutingKeys.order;
            yield channel.assertExchange(exchangeName, "direct");
            const jobberQueue = yield channel.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            });
            yield channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
            // consume
            channel.consume(jobberQueue.queue, (msg) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { template } = JSON.parse(msg.content.toString());
                    if (template === "orderPlaced") {
                        orderPlaceHandler(msg);
                        channel.ack(msg);
                        return;
                    }
                    else if (template === "orderDelivered") {
                        orderDeliverHandler(msg);
                        channel.ack(msg);
                        return;
                    }
                    else if (template === "orderExtension") {
                        orderExtensionHandler(msg);
                        channel.ack(msg);
                        return;
                    }
                    else if (template === "orderExtensionApproval") {
                        orderExtensionApprovalHandler(msg);
                        channel.ack(msg);
                        return;
                    }
                    channel.reject(msg, false);
                }
                catch (error) {
                    channel.reject(msg, false);
                    (0, config_1.logger)("queues/email.consumer.ts - consumeOrderEmailMessages()").error("consuming message got errors. consumeOrderEmailMessages() method", error);
                }
            }));
        }
        catch (error) {
            (0, config_1.logger)("queues/email.consumer.ts - consumeOrderEmailMessages()").error("NotificationService EmailConsumer consumeOrderEmailMessages(): method error:", error);
        }
    });
}
exports.consumeOrderEmailMessages = consumeOrderEmailMessages;
function orderPlaceHandler(msg) {
    try {
        const { orderId, buyerEmail, sellerEmail, orderDue, amount, buyerUsername, sellerUsername, title, description, requirements, serviceFee, total, orderUrl } = JSON.parse(msg.content.toString());
        if (!value_1.Value.Check(emailLocal_schema_1.orderPlacedSchema, msg.content)) {
            throw new Error(value_1.Value.Errors(emailLocal_schema_1.orderPlacedSchema, msg.content).First.toString());
        }
        const locals = {
            appLink: `${config_1.CLIENT_URL}`,
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
        (0, mail_transport_1.sendEmail)("orderPlaced", sellerEmail, locals);
        (0, mail_transport_1.sendEmail)("orderReceipt", buyerEmail, locals);
    }
    catch (error) {
        throw error;
    }
}
function orderDeliverHandler(msg) {
    try {
        const { orderId, buyerUsername, sellerUsername, title, description, orderUrl, receiverEmail } = JSON.parse(msg.content.toString());
        if (!value_1.Value.Check(emailLocal_schema_1.orderDeliveredSchema, msg.content)) {
            throw new Error(value_1.Value.Errors(emailLocal_schema_1.orderDeliveredSchema, msg.content).First.toString());
        }
        const locals = {
            appLink: `${config_1.CLIENT_URL}`,
            appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
            orderId,
            buyerUsername,
            sellerUsername,
            title,
            description,
            orderUrl
        };
        (0, mail_transport_1.sendEmail)("orderDelivered", receiverEmail, locals);
    }
    catch (error) {
        throw error;
    }
}
function orderExtensionHandler(msg) {
    try {
        const { orderId, buyerUsername, sellerUsername, originalDate, newDate, reason, orderUrl, receiverEmail } = JSON.parse(msg.content.toString());
        if (!value_1.Value.Check(emailLocal_schema_1.orderExtensionSchema, msg.content)) {
            throw new Error(value_1.Value.Errors(emailLocal_schema_1.orderExtensionSchema, msg.content).First.toString());
        }
        const locals = {
            appLink: `${config_1.CLIENT_URL}`,
            appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
            orderId,
            buyerUsername,
            sellerUsername,
            originalDate,
            newDate,
            reason,
            orderUrl
        };
        (0, mail_transport_1.sendEmail)("orderExtension", receiverEmail, locals);
    }
    catch (error) {
        throw error;
    }
}
function orderExtensionApprovalHandler(msg) {
    try {
        const { subject, buyerUsername, sellerUsername, type, message, header, orderUrl, receiverEmail } = JSON.parse(msg.content.toString());
        if (!value_1.Value.Check(emailLocal_schema_1.orderExtensionApprovalSchema, msg === null || msg === void 0 ? void 0 : msg.content)) {
            throw new Error(value_1.Value.Errors(emailLocal_schema_1.orderExtensionApprovalSchema, msg === null || msg === void 0 ? void 0 : msg.content).First.toString());
        }
        const locals = {
            appLink: `${config_1.CLIENT_URL}`,
            appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
            subject,
            buyerUsername,
            sellerUsername,
            header,
            type,
            message,
            orderUrl
        };
        (0, mail_transport_1.sendEmail)("orderExtensionApproval", receiverEmail, locals);
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=email.consumer.js.map