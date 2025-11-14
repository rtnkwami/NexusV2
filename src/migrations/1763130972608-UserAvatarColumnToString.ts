import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAvatarColumnToString1763130972608
  implements MigrationInterface
{
  name = 'UserAvatarColumnToString1763130972608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "avatar" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "avatar" json NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`,
    );
  }
}
