import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoles1701234567891 implements MigrationInterface {
  name = 'AddUserRoles1701234567891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 創建用戶角色枚舉類型
    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'editor', 'admin')
    `);

    // 添加角色欄位到用戶表
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "role" "public"."user_role_enum" DEFAULT 'user',
      ADD COLUMN "email" character varying,
      ADD COLUMN "createdAt" TIMESTAMP DEFAULT now(),
      ADD COLUMN "updatedAt" TIMESTAMP DEFAULT now()
    `);

    // 更新現有管理員用戶的角色
    await queryRunner.query(`
      UPDATE "users" 
      SET "role" = 'admin' 
      WHERE "isAdmin" = true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 移除欄位
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "role",
      DROP COLUMN "email",
      DROP COLUMN "createdAt",
      DROP COLUMN "updatedAt"
    `);

    // 移除枚舉類型
    await queryRunner.query(`
      DROP TYPE "public"."user_role_enum"
    `);
  }
}
