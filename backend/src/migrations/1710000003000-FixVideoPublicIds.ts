import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixVideoPublicIds1710000003000 implements MigrationInterface {
  name = 'FixVideoPublicIds1710000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix video publicIds that have incorrect prefixes
    await queryRunner.query(`
      UPDATE videos 
      SET "publicId" = REPLACE("publicId", 'zur_images/zur_videos/', 'zur_videos/')
      WHERE "publicId" LIKE 'zur_images/zur_videos/%'
    `);
    
    await queryRunner.query(`
      UPDATE videos 
      SET "publicId" = REPLACE("publicId", 'zur_images/', '')
      WHERE "publicId" LIKE 'zur_images/%' AND "publicId" LIKE '%zur_videos/%'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration is not reversible as it's fixing data corruption
    console.log('This migration cannot be reversed as it fixes data corruption');
  }
} 