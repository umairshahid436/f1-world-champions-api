import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1749497719721 implements MigrationInterface {
  name = 'CreateInitialTables1749497719721';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "races" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "date" character varying(10) NOT NULL, "time" character varying(10) NOT NULL, "points" character varying(10) NOT NULL, "circuitName" character varying(100) NOT NULL, "driverId" character varying(50) NOT NULL, "seasonYear" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba7d19b382156bc33244426c597" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_795f962a854c5182703fd4ac53" ON "races" ("driverId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_71b0d3a2ce4397c4152ce627bc" ON "races" ("seasonYear") `,
    );
    await queryRunner.query(
      `CREATE TABLE "drivers" ("driverId" character varying(50) NOT NULL, "givenName" character varying(100) NOT NULL, "familyName" character varying(100) NOT NULL, "nationality" character varying(50) NOT NULL, "permanentNumber" character varying(10), "code" character varying(10), "url" character varying(200), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cddc81d98d048e1f2cc19168302" PRIMARY KEY ("driverId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cddc81d98d048e1f2cc1916830" ON "drivers" ("driverId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "seasons" ("year" integer NOT NULL, "points" character varying(20) NOT NULL, "championDriverId" character varying(50) NOT NULL, "championConstructorId" character varying(50) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e20814074bbf37638cb4affa089" PRIMARY KEY ("year"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "constructors" ("constructorId" character varying(50) NOT NULL, "name" character varying(50) NOT NULL, "nationality" character varying(50) NOT NULL, "url" character varying(200) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_02d86d32e2d41df748d70f41016" PRIMARY KEY ("constructorId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_02d86d32e2d41df748d70f4101" ON "constructors" ("constructorId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "races" ADD CONSTRAINT "FK_71b0d3a2ce4397c4152ce627bc4" FOREIGN KEY ("seasonYear") REFERENCES "seasons"("year") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "races" ADD CONSTRAINT "FK_795f962a854c5182703fd4ac53a" FOREIGN KEY ("driverId") REFERENCES "drivers"("driverId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seasons" ADD CONSTRAINT "FK_5eb323fccce790ddc840bf08e94" FOREIGN KEY ("championDriverId") REFERENCES "drivers"("driverId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seasons" ADD CONSTRAINT "FK_dc5bb6fc7696ded2e60853e1be2" FOREIGN KEY ("championConstructorId") REFERENCES "constructors"("constructorId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "seasons" DROP CONSTRAINT "FK_dc5bb6fc7696ded2e60853e1be2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seasons" DROP CONSTRAINT "FK_5eb323fccce790ddc840bf08e94"`,
    );
    await queryRunner.query(
      `ALTER TABLE "races" DROP CONSTRAINT "FK_795f962a854c5182703fd4ac53a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "races" DROP CONSTRAINT "FK_71b0d3a2ce4397c4152ce627bc4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_02d86d32e2d41df748d70f4101"`,
    );
    await queryRunner.query(`DROP TABLE "constructors"`);
    await queryRunner.query(`DROP TABLE "seasons"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cddc81d98d048e1f2cc1916830"`,
    );
    await queryRunner.query(`DROP TABLE "drivers"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_71b0d3a2ce4397c4152ce627bc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_795f962a854c5182703fd4ac53"`,
    );
    await queryRunner.query(`DROP TABLE "races"`);
  }
}
