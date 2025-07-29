import { IsNotEmpty, IsString } from 'class-validator';

export class RenameMediaDto {
  @IsString()
  @IsNotEmpty({ message: '新的案名不能為空' })
  newName: string;
} 