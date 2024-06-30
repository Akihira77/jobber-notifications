"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeNamesAndRoutingKeys = exports.ENABLE_APM = exports.ELASTIC_APM_SERVICE_NAME = exports.ELASTIC_APM_SERVER_URL = exports.ELASTIC_APM_SECRET_TOKEN = exports.ELASTIC_PASSWORD = exports.ELASTIC_USERNAME = exports.SENDER_EMAIL_PASSWORD = exports.SENDER_EMAIL = exports.RABBITMQ_ENDPOINT = exports.NODE_ENV = exports.ELASTIC_SEARCH_URL = exports.CLIENT_URL = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config({ path: "./.env" });
}
else {
    dotenv_1.default.config();
}
_a = process.env, exports.PORT = _a.PORT, exports.CLIENT_URL = _a.CLIENT_URL, exports.ELASTIC_SEARCH_URL = _a.ELASTIC_SEARCH_URL, exports.NODE_ENV = _a.NODE_ENV, exports.RABBITMQ_ENDPOINT = _a.RABBITMQ_ENDPOINT, exports.SENDER_EMAIL = _a.SENDER_EMAIL, exports.SENDER_EMAIL_PASSWORD = _a.SENDER_EMAIL_PASSWORD, exports.ELASTIC_USERNAME = _a.ELASTIC_USERNAME, exports.ELASTIC_PASSWORD = _a.ELASTIC_PASSWORD, exports.ELASTIC_APM_SECRET_TOKEN = _a.ELASTIC_APM_SECRET_TOKEN, exports.ELASTIC_APM_SERVER_URL = _a.ELASTIC_APM_SERVER_URL, exports.ELASTIC_APM_SERVICE_NAME = _a.ELASTIC_APM_SERVICE_NAME, exports.ENABLE_APM = _a.ENABLE_APM;
// if (NODE_ENV === "production" && ENABLE_APM == "1") {
//     require("elastic-apm-node").start({
//         serviceName: `${ELASTIC_APM_SERVICE_NAME}`,
//         serverUrl: ELASTIC_APM_SERVER_URL,
//         secretToken: ELASTIC_APM_SECRET_TOKEN,
//         enironment: NODE_ENV,
//         active: true,
//         captureBody: "all",
//         errorOnAbortedRequests: true,
//         captureErrorLogStackTraces: "always"
//     });
// }
exports.exchangeNamesAndRoutingKeys = {
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
//# sourceMappingURL=config.js.map