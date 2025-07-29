import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('site_settings')
export class SiteSetting {
  @ApiProperty({ description: '設定 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  // SEO
  @ApiProperty({ description: '網站標題', example: 'ZUR STUDIO' })
  @Column({ default: '' })
  siteTitle: string;
  @ApiProperty({
    description: '網站描述',
    example: '專業的效果圖與光雕視覺化服務',
  })
  @Column({ default: '' })
  siteDescription: string;
  @ApiProperty({
    description: '網站關鍵字',
    example: '效果圖,光雕,視覺化,設計',
  })
  @Column({ default: '' })
  siteKeywords: string;
  @ApiProperty({
    description: 'Open Graph 圖片',
    example: 'https://example.com/og-image.jpg',
  })
  @Column({ default: '' })
  ogImage: string;
  @ApiProperty({
    description: '網站圖標',
    example: 'https://example.com/favicon.ico',
  })
  @Column({ default: '' })
  favicon: string;
  @ApiProperty({ description: 'Robots 設定', example: 'index, follow' })
  @Column({ default: '' })
  robots: string;
  @ApiProperty({ description: 'Sitemap 路徑', example: '/sitemap.xml' })
  @Column({ default: '' })
  sitemap: string;

  // AEO (FAQ)
  @ApiProperty({
    description: 'FAQ 列表',
    example: [{ question: '什麼是效果圖？', answer: '效果圖是...' }],
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

  // GEO
  @ApiProperty({ description: '地址', example: '台北市信義區信義路五段7號' })
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
}
