import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeoAeoGeoToProject1710000001000 implements MigrationInterface {
  name = 'AddSeoAeoGeoToProject1710000001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add SEO fields
    await queryRunner.query(`ALTER TABLE "project" ADD COLUMN "seoTitle" VARCHAR(200) DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "project" ADD COLUMN "seoDescription" VARCHAR(500) DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "project" ADD COLUMN "seoKeywords" VARCHAR(300) DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "project" ADD COLUMN "ogImage" VARCHAR(500) DEFAULT ''`);

    // Add AEO (FAQ) field
    await queryRunner.query(`ALTER TABLE "project" ADD COLUMN "faqList" JSON`);

    // Add GEO fields
    await queryRunner.query(`ALTER TABLE "project" ADD COLUMN "address" VARCHAR(200) DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "project" ADD COLUMN "lat" DECIMAL(10,6)`);
    await queryRunner.query(`ALTER TABLE "project" ADD COLUMN "lng" DECIMAL(10,6)`);
    await queryRunner.query(`ALTER TABLE "project" ADD COLUMN "city" VARCHAR(50) DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "project" ADD COLUMN "zipcode" VARCHAR(10) DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove GEO fields
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "zipcode"`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "lng"`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "lat"`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "address"`);

    // Remove AEO field
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "faqList"`);

    // Remove SEO fields
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "ogImage"`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "seoKeywords"`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "seoDescription"`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "seoTitle"`);
  }
} 