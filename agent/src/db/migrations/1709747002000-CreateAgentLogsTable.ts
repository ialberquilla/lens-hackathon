import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAgentLogsTable1709747002000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE agent_log_status AS ENUM ('PENDING', 'ANALYZED', 'ERROR');
            
            CREATE TABLE "agent_log" (
                "id" SERIAL PRIMARY KEY,
                "transaction_id" VARCHAR(66) NOT NULL,
                "agent_type" VARCHAR(50) NOT NULL,
                "status" agent_log_status NOT NULL DEFAULT 'PENDING',
                "decision" BOOLEAN,
                "feedback" TEXT,
                "error_message" TEXT,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            );

            CREATE INDEX agent_log_transaction_idx ON agent_log("transaction_id");
            CREATE INDEX agent_log_agent_type_idx ON agent_log("agent_type");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "agent_log";
            DROP TYPE IF EXISTS agent_log_status;
        `);
    }
} 