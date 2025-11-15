import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderModel1763244643014 implements MigrationInterface {
    name = 'AddOrderModel1763244643014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('pending', 'cancelled', 'completed')`);
        await queryRunner.query(`CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."order_status_enum" NOT NULL DEFAULT 'pending', "total" integer NOT NULL, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar" json NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    }

}
