import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMediaEditorRole1710000002000 implements MigrationInterface {
  name = 'AddMediaEditorRole1710000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 更新 UserRole enum 以包含 media_editor
    await queryRunner.query(`
      ALTER TYPE "public"."users_role_enum" ADD VALUE 'media_editor'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 注意：PostgreSQL 不支援直接從 enum 中移除值
    // 這需要重新創建 enum 類型，這在生產環境中可能很複雜
    // 因此 down migration 只是一個佔位符
    console.log('Warning: Cannot remove enum value from PostgreSQL enum type');
  }
} 