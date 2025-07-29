import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('project')
@Unique(['name'])
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  // SEO Fields - 暫時註釋掉，等數據庫欄位添加後再啟用
  /*
  @ApiProperty({ description: 'SEO 標題', example: 'ZUR 3D 渲染專案' })
  @Column({ default: '' })
  seoTitle: string;

  @ApiProperty({ description: 'SEO 描述', example: '專業的 3D 渲染與視覺化服務' })
  @Column({ default: '' })
  seoDescription: string;

  @ApiProperty({ description: 'SEO 關鍵字', example: '3D渲染,視覺化,效果圖' })
  @Column({ default: '' })
  seoKeywords: string;

  @ApiProperty({ description: 'Open Graph 圖片', example: 'https://example.com/og-image.jpg' })
  @Column({ default: '' })
  ogImage: string;

  // AEO (FAQ) Fields
  @ApiProperty({
    description: 'FAQ 列表',
    example: [{ question: '這個專案包含哪些服務？', answer: '包含 3D 建模、渲染、動畫等服務' }],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        answer: { type: 'string' },
      },
    },
  })
  @Column('json', { nullable: true })
  faqList: Array<{ question: string; answer: string }>;

  // GEO Fields
  @ApiProperty({ description: '專案地址', example: '台北市信義區信義路五段7號' })
  @Column({ default: '' })
  address: string;

  @ApiProperty({ description: '緯度', example: 25.033 })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  lat: number;

  @ApiProperty({ description: '經度', example: 121.5654 })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  lng: number;

  @ApiProperty({ description: '城市', example: '台北市' })
  @Column({ default: '' })
  city: string;

  @ApiProperty({ description: '郵遞區號', example: '110' })
  @Column({ default: '' })
  zipcode: string;
  */

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 