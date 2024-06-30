"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = void 0;
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const email_templates_1 = __importDefault(require("email-templates"));
function emailTemplates(template, sendTo, locals, logger) {
    try {
        const transport = nodemailer_1.default.createTransport({
            // host: "smtp.ethereal.email",
            service: "gmail",
            // port: 587,
            auth: {
                user: config_1.SENDER_EMAIL,
                pass: config_1.SENDER_EMAIL_PASSWORD
            }
        });
        const email = new email_templates_1.default({
            message: {
                from: `Jobber App <${config_1.SENDER_EMAIL}>`
            },
            send: true,
            preview: false,
            transport,
            views: {
                options: {
                    extension: "ejs"
                }
            },
            juice: true,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    relativeTo: path_1.default.join(__dirname, "../build")
                }
            }
        });
        email.send({
            template: path_1.default.join(__dirname, "..", "src/emails", template),
            message: { to: sendTo },
            locals
        });
    }
    catch (error) {
        logger("helpers.ts - emailTemplates").error(error);
    }
}
exports.emailTemplates = emailTemplates;
//# sourceMappingURL=helpers.js.map