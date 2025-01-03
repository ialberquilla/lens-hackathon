import { MigrationInterface, QueryRunner } from "typeorm";

export class AddArrayToVectorFunction1709747001000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the function to convert array to vector
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION array_to_vector(arr float8[])
            RETURNS vector
            AS $$
            BEGIN
                RETURN arr::vector;
            END;
            $$ LANGUAGE plpgsql IMMUTABLE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP FUNCTION IF EXISTS array_to_vector(float8[])`);
    }
} 