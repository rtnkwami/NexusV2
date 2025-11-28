import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUserAvatarNullable1763561382881 implements MigrationInterface {
  name = 'MakeUserAvatarNullable1763561382881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "avatar" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "avatar" SET NOT NULL`,
    );
  }
}
