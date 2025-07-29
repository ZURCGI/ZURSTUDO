import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: '專案名稱', example: 'ZUR 3D 渲染專案' })
  @IsString()
  @Length(1, 100)
  name: string;
} 