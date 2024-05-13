import { IEmailLocals, winstonLogger } from "@Akihira77/jobber-shared";
import { ELASTIC_SEARCH_URL } from "@notifications/config";
import { emailTemplates } from "@notifications/helpers";
import { Logger } from "winston";

const log: Logger = winstonLogger(
    `${ELASTIC_SEARCH_URL}`,
    "mailTransport",
    "debug"
);

export function sendEmail(
    template: string,
    receiverEmail: string,
    locals: IEmailLocals
): void {
    try {
        // email templates
        emailTemplates(template, receiverEmail, locals);
        log.info("Email sent successfully");
    } catch (error) {
        log.error(
            "Notification Service MailTransport sendEmail() method error:",
            error
        );
    }
}
