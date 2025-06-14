import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToRaceName1749914468417
  implements MigrationInterface
{
  name = 'AddUniqueConstraintToRaceName1749914468417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c02ae0da4f176de4f630a571f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "races" ADD CONSTRAINT "UQ_baf8f0045fa05ba1149aedee823" UNIQUE ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "races" DROP CONSTRAINT "UQ_baf8f0045fa05ba1149aedee823"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c02ae0da4f176de4f630a571f1" ON "races" ("name", "seasonYear") `,
    );
  }
}
