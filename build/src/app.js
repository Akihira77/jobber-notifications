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
const server_1 = require("./server");
const jobber_shared_1 = require("@Akihira77/jobber-shared");
const config_1 = require("./config");
const hono_1 = require("hono");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const logFilePath = node_path_1.default.join(process.cwd(), "/usage.txt");
function getCPUUsage() {
    const cpuUsage = process.cpuUsage();
    const userCPUTime = (cpuUsage.user / 1000).toFixed(2); // dalam milidetik
    const systemCPUTime = (cpuUsage.system / 1000).toFixed(2); // dalam milidetik
    return {
        user: userCPUTime,
        system: systemCPUTime
    };
}
function getMemoryUsage() {
    const totalMemory = node_os_1.default.totalmem();
    const freeMemory = node_os_1.default.freemem();
    const usedMemory = totalMemory - freeMemory;
    return {
        total: (totalMemory / (1024 * 1024)).toFixed(2), // in MB
        used: (usedMemory / (1024 * 1024)).toFixed(2), // in MB
        free: (freeMemory / (1024 * 1024)).toFixed(2) // in MB
    };
}
// Fungsi untuk mencatat penggunaan CPU dan memori ke file log
function logUsage() {
    const cpuUsage = getCPUUsage();
    const memoryUsage = getMemoryUsage();
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - CPU Usage: User: ${cpuUsage.user}ms Sys: ${cpuUsage.system}ms | Memory Total: ${memoryUsage.total}MB Used: ${memoryUsage.used}MB Free: ${memoryUsage.free}MB\n`;
    // Tambahkan pesan log ke file log
    node_fs_1.default.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.log(err);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = (moduleName) => (0, jobber_shared_1.winstonLogger)(`${config_1.ELASTIC_SEARCH_URL}`, moduleName !== null && moduleName !== void 0 ? moduleName : "Notification Service", "debug");
        const app = new hono_1.Hono();
        yield (0, server_1.start)(app, logger);
    });
}
main();
logUsage();
//# sourceMappingURL=app.js.map