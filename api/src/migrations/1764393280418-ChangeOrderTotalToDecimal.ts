import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeOrderTotalToDecimal1764393280418
  implements MigrationInterface
{
  name = 'ChangeOrderTotalToDecimal1764393280418';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total"`);
    await queryRunner.query(`ALTER TABLE "order" ADD "total" numeric(10,2)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total"`);
    await queryRunner.query(`ALTER TABLE "order" ADD "total" integer NOT NULL`);
  }
}
