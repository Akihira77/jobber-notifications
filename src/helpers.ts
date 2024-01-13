import path from "path";

import { IEmailLocals, winstonLogger } from "@Akihira77/jobber-shared";
import {
    ELASTIC_SEARCH_URL,
    SENDER_EMAIL,
    SENDER_EMAIL_PASSWORD
} from "@notifications/config";
import { Logger } from "winston";
import nodemailer, { Transporter } from "nodemailer";
import Email from "email-templates";

const log: Logger = winstonLogger(
    `${ELASTIC_SEARCH_URL}`,
    "mailTransportHelper",
    "debug"
);

export async function emailTemplates(
    template: string,
    sendTo: string,
    locals: IEmailLocals
): Promise<void> {
    try {
        const smtpTransport: Transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: {
                user: SENDER_EMAIL,
                pass: SENDER_EMAIL_PASSWORD
            }
        });

        const email: Email = new Email({
            message: {
                from: `Jobber App <${SENDER_EMAIL}>`
            },
            send: true,
            preview: false,
            transport: smtpTransport,
            views: {
                options: {
                    extension: "ejs"
                }
            },
            juice: true,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    relativeTo: path.join(__dirname, "../build")
                }
            }
        });

        await email.send({
            template: path.join(__dirname, "..", "src/emails", template),
            message: { to: sendTo },
            locals
        });
    } catch (error) {
        log.error(error);
    }
}
