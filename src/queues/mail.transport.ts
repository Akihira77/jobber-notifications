import { IEmailLocals } from "@Akihira77/jobber-shared";
import { emailTemplates } from "@notifications/helpers";
import { Logger } from "winston";

export function sendEmail(
    template: string,
    receiverEmail: string,
    locals: IEmailLocals,
    logger: (moduleName: string) => Logger
): void {
    try {
        // email templates
        emailTemplates(template, receiverEmail, locals, logger);
        logger("queues/mail.transport.ts - sendEmail()").info(
            "Email sent successfully"
        );
    } catch (error) {
        logger("queues/mail.transport.ts - sendEmail()").error(
            "Notification Service MailTransport sendEmail() method error:",
            error
        );
    }
}
