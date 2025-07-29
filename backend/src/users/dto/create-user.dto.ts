import { IsString, IsNotEmpty, MinLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '用戶名',
    example: 'media_editor_001',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '密碼',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: '電子郵件（可選）',
    example: 'editor@zurcgi.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
