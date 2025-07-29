import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1701234567890 implements MigrationInterface {
  name = 'InitialMigration1701234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 檢查並創建用戶表
    const userTableExists = await queryRunner.hasTable('users');
    if (!userTableExists) {
      await queryRunner.query(`
        CREATE TABLE "users" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "username" character varying NOT NULL UNIQUE,
          "passwordHash" character varying NOT NULL,
          "isAdmin" boolean DEFAULT false,
          "createdAt" TIMESTAMP DEFAULT now(),
          "updatedAt" TIMESTAMP DEFAULT now()
        )
      `);
    }

    // 創建圖片表
    await queryRunner.query(`
      CREATE TABLE "image" (
        "id" SERIAL PRIMARY KEY,
        "publicId" character varying NOT NULL UNIQUE,
        "url" character varying NOT NULL,
        "description" character varying,
        "category" character varying,
        "project" character varying,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )
    `);

    // 創建影片表
    await queryRunner.query(`
      CREATE TABLE "video" (
        "id" SERIAL PRIMARY KEY,
        "publicId" character varying NOT NULL UNIQUE,
        "url" character varying NOT NULL,
        "description" character varying,
        "category" character varying,
        "project" character varying,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )
    `);

    // 創建360度視圖表
    await queryRunner.query(`
      CREATE TABLE "view360" (
        "id" SERIAL PRIMARY KEY,
        "publicId" character varying NOT NULL UNIQUE,
        "url" character varying NOT NULL,
        "description" character varying,
        "category" character varying,
        "project" character varying,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )
    `);

    // 創建網站設定表
    await queryRunner.query(`
      CREATE TABLE "site_setting" (
        "id" SERIAL PRIMARY KEY,
        "siteTitle" character varying DEFAULT 'ZUR STUDIO',
        "siteDescription" character varying,
        "siteKeywords" character varying,
        "ogImage" character varying,
        "robots" character varying DEFAULT 'index, follow',
        "sitemap" character varying DEFAULT '/sitemap.xml',
        "address" character varying,
        "lat" double precision,
        "lng" double precision,
        "city" character varying,
        "zipcode" character varying,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )
    `);

    // 創建訪問記錄表
    await queryRunner.query(`
      CREATE TABLE "visit" (
        "id" SERIAL PRIMARY KEY,
        "ip" character varying,
        "userAgent" character varying,
        "path" character varying,
        "country" character varying,
        "city" character varying,
        "lat" double precision,
        "lng" double precision,
        "createdAt" TIMESTAMP DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "visit"`);
    await queryRunner.query(`DROP TABLE "site_setting"`);
    await queryRunner.query(`DROP TABLE "view360"`);
    await queryRunner.query(`DROP TABLE "video"`);
    await queryRunner.query(`DROP TABLE "image"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
