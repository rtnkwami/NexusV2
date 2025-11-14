import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductModel1763105640946 implements MigrationInterface {
    name = 'AddProductModel1763105640946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "category" character varying NOT NULL, "price" double precision, "stock" integer NOT NULL, "images" json, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
