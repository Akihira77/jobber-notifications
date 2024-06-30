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
exports.start = void 0;
const config_1 = require("./config");
const notification_queue_1 = require("./queues/notification.queue");
const elasticsearch_1 = require("./elasticsearch");
const http_status_codes_1 = require("http-status-codes");
const node_server_1 = require("@hono/node-server");
function start(app, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        yield startQueues(logger);
        startElasticSearch(logger);
        startServer(app, logger);
        app.get("/notification-health", (c) => {
            return c.text("Notification service is healthy and OK.", http_status_codes_1.StatusCodes.OK);
        });
    });
}
exports.start = start;
function startQueues(logger) {
    return __awaiter(this, void 0, void 0, function* () {
        const queue = new notification_queue_1.NotificationQueue(null, logger);
        yield queue.createConnection();
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
    });
}
function startElasticSearch(logger) {
    return __awaiter(this, void 0, void 0, function* () {
        const elastic = new elasticsearch_1.ElasticSearchClient(logger);
        yield elastic.checkConnection();
        return elastic;
    });
}
function startServer(hono, logger) {
    try {
        logger("server.ts - startServer()").info(`NotificationService has started with pid ${process.pid}`);
        (0, node_server_1.serve)({ fetch: hono.fetch, port: Number(config_1.PORT) }, (info) => {
            logger("server.ts - startServer()").info(`NotificationService running on port ${info.port}`);
        });
    }
    catch (error) {
        logger("server.ts - startServer()").error("NotificationService startServer() method error:", error);
    }
}
//# sourceMappingURL=server.js.map