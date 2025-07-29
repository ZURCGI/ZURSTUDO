// src/media/dto/upload-image.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({
    description: '圖片描述',
    required: false,
    example: '這是一張精美的效果圖',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: '圖片分類',
    required: false,
    example: '室內設計',
  })
  @IsString()
  @IsOptional()
  category: string;

  @ApiProperty({
    description: '專案名稱',
    required: false,
    example: '台北豪宅設計',
  })
  @IsString()
  @IsOptional()
  project: string;

  @ApiProperty({
    description: 'SEO 標題',
    required: false,
    example: '台北豪宅室內設計效果圖',
  })
  @IsString()
  @IsOptional()
  seoTitle: string;

  @ApiProperty({
    description: 'SEO 描述',
    required: false,
    example: '專業的台北豪宅室內設計效果圖展示',
  })
  @IsString()
  @IsOptional()
  seoDescription: string;

  @ApiProperty({
    description: 'SEO 關鍵字',
    required: false,
    example: '台北,豪宅,室內設計,效果圖',
  })
  @IsString()
  @IsOptional()
  seoKeywords: string;

  @ApiProperty({
    description: 'Open Graph 圖片',
    required: false,
    example: 'https://example.com/og-image.jpg',
  })
  @IsString()
  @IsOptional()
  ogImage: string;

  @ApiProperty({
    description: '圖片替代文字',
    required: false,
    example: '台北豪宅客廳設計效果圖',
  })
  @IsString()
  @IsOptional()
  alt: string;
}
