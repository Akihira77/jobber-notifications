import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
import { ELASTIC_SEARCH_URL } from "@notifications/config";
import { Logger } from "winston";

export class ElasticSearchClient {
    private client: Client;
    constructor(private logger: (moduleName: string) => Logger) {
        this.client = new Client({
            node: `${ELASTIC_SEARCH_URL}`
        });
    }

    async checkConnection(): Promise<void> {
        let isConnected = false;
        while (!isConnected) {
            this.logger("elasticsearch.ts - checkConnection()").info(
                `NotificationService connecting to Elasticsearch...`
            );
            try {
                const health: ClusterHealthResponse =
                    await this.client.cluster.health({});

                this.logger("elasticsearch.ts - checkConnection()").info(
                    `NotificationService Elasticsearch health status - ${health.status}`
                );
                isConnected = true;
            } catch (error) {
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "NotificationService checkConnection() method error:",
                    error
                );
            }
        }

        this.closeConnection(this.client);
    }

    closeConnection(client: Client): void {
        process.once("exit", async () => {
            await client.close();
        });
    }
}
