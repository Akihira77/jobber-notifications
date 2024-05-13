import { Client } from "@elastic/elasticsearch";
import { Logger } from "winston";
import { winstonLogger } from "@Akihira77/jobber-shared";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
import { ELASTIC_SEARCH_URL } from "@notifications/config";

const log: Logger = winstonLogger(
    `${ELASTIC_SEARCH_URL}`,
    "notificationElasticSearchServer",
    "debug"
);

const elasticSearchClient = new Client({
    node: `${ELASTIC_SEARCH_URL}`
});

export async function checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
        log.info(`NotificationService connecting to Elasticsearch...`);
        try {
            const health: ClusterHealthResponse =
                await elasticSearchClient.cluster.health({});

            log.info(
                `NotificationService Elasticsearch health status - ${health.status}`
            );
            isConnected = true;
        } catch (error) {
            log.error("Connection to Elasticsearch failed. Retrying...");
            log.log(
                "error",
                "NotificationService checkConnection() method error:",
                error
            );
        }
    }
}
