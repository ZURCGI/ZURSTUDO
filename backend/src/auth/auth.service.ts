// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { securityLogger } from '../common/utils/logger.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // 驗證帳號與密碼
  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      securityLogger.logAuthEvent('LOGIN_ATTEMPT', username, false);
      return null;
    }
    try {
      // 使用型別斷言來處理 bcrypt.compare 的型別問題
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        securityLogger.logAuthEvent('LOGIN_SUCCESS', username, true);
        return user;
      }
      securityLogger.logAuthEvent('LOGIN_FAILURE', username, false);
      return null;
    } catch {
      // 如果密碼比較失敗，返回 null
      securityLogger.logAuthEvent('LOGIN_ERROR', username, false);
      return null;
    }
  }

  // 登入：回傳 { access_token }
  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('使用者或密碼錯誤');

    const payload = {
      sub: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      role: user.role, // 確保 JWT payload 有 role
    };

    return {
      access_token: this.jwtService.sign(payload), // 使用 JwtModule 的預設配置
    };
  }
  // 變更密碼
  async changePassword(userId: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (user) {
      securityLogger.logSensitiveOperation('PASSWORD_CHANGE', user.username);
    }
    return this.usersService.changePassword(userId, newPassword);
  }
}
