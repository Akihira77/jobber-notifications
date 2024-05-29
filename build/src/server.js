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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
require("express-async-errors");
const http_1 = __importDefault(require("http"));
const config_1 = require("./config");
const routes_1 = require("./routes");
const elasticsearch_1 = require("./elasticsearch");
const connection_1 = require("./queues/connection");
const email_consumer_1 = require("./queues/email.consumer");
function start(app) {
    startServer(app);
    app.use("", (0, routes_1.healthRoute)());
    startQueues();
    startElasticSearch();
}
exports.start = start;
function startQueues() {
    return __awaiter(this, void 0, void 0, function* () {
        const emailChanel = (yield (0, connection_1.createConnection)());
        yield (0, email_consumer_1.consumeAuthEmailMessages)(emailChanel);
        yield (0, email_consumer_1.consumeOrderEmailMessages)(emailChanel);
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
function startElasticSearch() {
    (0, elasticsearch_1.checkConnection)();
}
function startServer(app) {
    try {
        const httpServer = new http_1.default.Server(app);
        (0, config_1.logger)("server.ts - startServer()").info(`NotificationService has started with pid ${process.pid}`);
        httpServer.listen(Number(config_1.PORT), () => {
            (0, config_1.logger)("server.ts - startServer()").info(`NotificationService running on port ${config_1.PORT}`);
        });
    }
    catch (error) {
        (0, config_1.logger)("server.ts - startServer()").error("NotificationService startServer() method error:", error);
    }
}
//# sourceMappingURL=server.js.map