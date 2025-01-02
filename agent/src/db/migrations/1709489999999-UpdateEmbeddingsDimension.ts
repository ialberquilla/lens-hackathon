import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEmbeddingsDimension1709489999999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing column
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN IF EXISTS "embeddings";`);
        
        // Add new jsonb column
        await queryRunner.query(`ALTER TABLE "asset" ADD COLUMN "embeddings" jsonb;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to float array
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN IF EXISTS "embeddings";`);
        await queryRunner.query(`ALTER TABLE "asset" ADD COLUMN "embeddings" float[];`);
    }
} 