import {
  Controller,
  Post,
  Patch,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('create-media-editor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createMediaEditor(@Body() createUserDto: CreateUserDto) {
    this.logger.log('Creating media editor account');
    return this.usersService.createMediaEditor(createUserDto);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    const user = req.user;
    
    // 檢查用戶角色，媒體編輯者不能修改密碼
    if (user.role === UserRole.MEDIA_EDITOR) {
      throw new ForbiddenException('媒體編輯者無法修改密碼，請聯繫管理員');
    }

    this.logger.log(`User ${user.username} attempting to change password`);
    return this.usersService.changePassword(user.sub, changePasswordDto.newPassword);
  }

  @Post('create-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createAdmin(@Body() createUserDto: CreateUserDto) {
    this.logger.log('Creating admin account');
    return this.usersService.createAdmin(createUserDto);
  }
}
