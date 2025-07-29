// src/media/dto/upload-view360.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UploadView360Dto {
  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  category: string;

  @IsString()
  @IsOptional()
  project: string;

  @IsString()
  @IsOptional()
  seoTitle: string;

  @IsString()
  @IsOptional()
  seoDescription: string;

  @IsString()
  @IsOptional()
  seoKeywords: string;

  @IsString()
  @IsOptional()
  ogImage: string;

  @IsOptional()
  faq: { question: string; answer: string }[];

  @IsOptional()
  latitude: number;

  @IsOptional()
  longitude: number;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  zipcode: string;
}
