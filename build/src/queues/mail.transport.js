"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const config_1 = require("../config");
const helpers_1 = require("../helpers");
function sendEmail(template, receiverEmail, locals) {
    try {
        // email templates
        (0, helpers_1.emailTemplates)(template, receiverEmail, locals);
        (0, config_1.logger)("queues/mail.transport.ts - sendEmail()").info("Email sent successfully");
    }
    catch (error) {
        (0, config_1.logger)("queues/mail.transport.ts - sendEmail()").error("Notification Service MailTransport sendEmail() method error:", error);
    }
}
exports.sendEmail = sendEmail;
//# sourceMappingURL=mail.transport.js.map