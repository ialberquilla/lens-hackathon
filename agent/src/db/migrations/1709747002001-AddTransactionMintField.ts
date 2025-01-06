import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionMintField1709747002001 implements MigrationInterface {
    name = 'AddTransactionMintField1709747002001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agent_log" ADD COLUMN "transaction_mint" varchar(66) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agent_log" DROP COLUMN "transaction_mint"`);
    }
} 