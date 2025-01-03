import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAssetTable1709747000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, create the vector extension if it doesn't exist
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

        // Create the asset table with vector type
        await queryRunner.query(`
            CREATE TABLE "asset" (
                "assetId" SERIAL PRIMARY KEY,
                "price" DECIMAL(20,2) NOT NULL,
                "description" VARCHAR(1000) NOT NULL,
                "embeddings" vector(1024) NOT NULL,
                "likes" INTEGER NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "contractAddress" VARCHAR(42) NOT NULL UNIQUE,
                "imageUrl" VARCHAR(255) NOT NULL,
                "embeddingsUrl" VARCHAR(255) NOT NULL
            )
        `);

        // Create an index for similarity search
        await queryRunner.query(`
            CREATE INDEX asset_embeddings_idx ON asset 
            USING ivfflat (embeddings vector_cosine_ops)
            WITH (lists = 100)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS asset_embeddings_idx`);
        await queryRunner.query(`DROP TABLE IF EXISTS "asset"`);
    }
} 