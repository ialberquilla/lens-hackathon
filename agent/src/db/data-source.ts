import { DataSource } from "typeorm";
import { Asset } from "./entities/Asset";
import { CreateAssetTable1709747000000 } from "./migrations/1709747000000-CreateAssetTable";
import { AddArrayToVectorFunction1709747001000 } from "./migrations/1709747001000-AddArrayToVectorFunction";
import { CreateAgentLogsTable1709747002000 } from "./migrations/1709747002000-CreateAgentLogsTable";
import "reflect-metadata";
import { AgentLog } from "./entities/AgentLog";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "lens_hackathon",
    synchronize: false,
    logging: true,
    entities: [Asset, AgentLog],
    migrations: [
        CreateAssetTable1709747000000,
        AddArrayToVectorFunction1709747001000,
        CreateAgentLogsTable1709747002000
    ],
    subscribers: [],
}); 