// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
  Get,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from './dto/user-payload.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: '用戶登入',
    description: '使用用戶名和密碼登入系統',
  })
  @ApiResponse({
    status: 200,
    description: '登入成功',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 401, description: '登入失敗，用戶名或密碼錯誤' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.debug(
      'Login called with username:',
      dto.username,
    );

    const { access_token } = await this.authService.login(
      dto.username,
      dto.password,
    );
    this.logger.debug(
      'Login token generated:',
      access_token ? 'exists' : 'missing',
    );

    // 設置安全的 HTTP-only cookie
    res.cookie('auth-token', access_token, {
      httpOnly: true, // 安全 token
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // 防止 CSRF 攻擊
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    this.logger.debug('Login cookie set, returning success');
    return {
      success: true,
      access_token: access_token,
    };
  }

  @ApiOperation({ summary: '修改密碼', description: '修改當前登入用戶的密碼' })
  @ApiResponse({
    status: 200,
    description: '密碼修改成功',
    schema: { type: 'object', properties: { message: { type: 'string' } } },
  })
  @ApiResponse({ status: 401, description: '未授權，需要有效的 JWT token' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    const userId = req.user.sub;
    await this.authService.changePassword(userId, dto.newPassword);
    return { message: '密碼修改成功' };
  }

  @ApiOperation({
    summary: '取得當前用戶資訊',
    description: '取得當前登入用戶的詳細資訊',
  })
  @ApiResponse({
    status: 200,
    description: '用戶資訊',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        isAdmin: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權，需要有效的 JWT token' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@Request() req: AuthenticatedRequest) {
    return {
      id: req.user.sub,
      username: req.user.username,
      isAdmin: req.user.isAdmin,
      role: req.user.role,
    };
  }

  @ApiOperation({ summary: '用戶登出', description: '登出並清除認證 cookie' })
  @ApiResponse({
    status: 200,
    description: '登出成功',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    return { success: true };
  }
}
