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
const server_1 = require("./server");
const jobber_shared_1 = require("@Akihira77/jobber-shared");
const config_1 = require("./config");
const hono_1 = require("hono");
const events_1 = require("events");
events_1.EventEmitter.setMaxListeners(20);
process.once("SIGINT", () => {
    process.exit(1);
});
process.once("SIGTERM", () => {
    process.exit(1);
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = (moduleName) => (0, jobber_shared_1.winstonLogger)(`${config_1.ELASTIC_SEARCH_URL}`, moduleName !== null && moduleName !== void 0 ? moduleName : "Notification Service", "debug");
        const app = new hono_1.Hono();
        yield (0, server_1.start)(app, logger);
    });
}
main();
//# sourceMappingURL=app.js.map