import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: "./.env" });
} else {
    dotenv.config();
}

export const {
    CLIENT_URL,
    ELASTIC_SEARCH_URL,
    NODE_ENV,
    RABBITMQ_ENDPOINT,
    SENDER_EMAIL,
    SENDER_EMAIL_PASSWORD,
    ELASTIC_USERNAME,
    ELASTIC_PASSWORD
} = process.env;
