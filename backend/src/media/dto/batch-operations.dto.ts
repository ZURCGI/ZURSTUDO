import { IsArray, IsString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class BatchItemDto {
  @IsEnum(['image', 'video', 'view360'])
  type: 'image' | 'video' | 'view360';

  @IsString()
  publicId: string;
}

export class BatchDeleteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items: BatchItemDto[];
}

export class BatchUpdateCategoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items: BatchItemDto[];

  @IsString()
  category: string;
}

export class BatchUpdateDescriptionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items: BatchItemDto[];

  @IsString()
  description: string;
}

export class BatchMoveToFolderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items: BatchItemDto[];

  @IsString()
  folder: string;
}

export class BatchTagDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items: BatchItemDto[];

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
