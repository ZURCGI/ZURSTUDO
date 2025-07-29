// src/auth/dto/login.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用戶名', example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密碼', example: 'password123' })
  @IsString()
  password: string;
}
