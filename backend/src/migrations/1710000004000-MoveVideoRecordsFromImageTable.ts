import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveVideoRecordsFromImageTable1710000004000 implements MigrationInterface {
  name = 'MoveVideoRecordsFromImageTable1710000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 查找圖片表中包含 'zur_videos' 的記錄
    const videoRecordsInImageTable = await queryRunner.query(`
      SELECT * FROM images 
      WHERE "publicId" LIKE '%zur_videos%'
    `);
    
    console.log(`Found ${videoRecordsInImageTable.length} video records in image table`);
    
    for (const record of videoRecordsInImageTable) {
      // 創建視頻記錄
      const newPublicId = record.publicId.replace('zur_images/', '');
      
      await queryRunner.query(`
        INSERT INTO videos (
          id, url, "publicId", description, category, project, 
          "seoTitle", "seoDescription", "seoKeywords", "ogImage", alt,
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
      `, [
        record.id,
        record.url,
        newPublicId,
        record.description || '',
        record.category || '',
        record.project || '',
        record.seoTitle || '',
        record.seoDescription || '',
        record.seoKeywords || '',
        record.ogImage || '',
        record.alt || '',
        record.createdAt,
        record.updatedAt
      ]);
      
      // 從圖片表刪除
      await queryRunner.query(`
        DELETE FROM images WHERE id = $1
      `, [record.id]);
      
      console.log(`Moved video record: ${record.publicId} -> ${newPublicId}`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 這個遷移不可逆轉，因為它修復數據損壞
    console.log('This migration cannot be reversed as it fixes data corruption');
  }
} 