// src/auth/jwt.strategy.ts

import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  username: string;
  isAdmin?: boolean;
  role?: string;
}

interface JwtUser {
  sub: string;
  username: string;
  isAdmin: boolean;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    // 驗證 JWT Secret 強度
    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    super({
      // 支援從 Authorization header 或 cookie 中提取 JWT
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          const token = req.cookies?.['auth-token'] || null;
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });

    // 檢查是否為默認值（在 super() 調用之後）
    if (jwtSecret.includes('zur_studio_secure_jwt_secret')) {
      this.logger.warn('⚠️ 警告: 使用默認 JWT_SECRET，建議在生產環境中更改');
    }

    this.logger.debug(
      'JwtStrategy initialized with secret:',
      configService.get<string>('JWT_SECRET'),
    );
  }

  validate(payload: JwtPayload): JwtUser | null {
    this.logger.debug('JwtStrategy.validate() payload =', payload);
    this.logger.debug(
      'JwtStrategy.validate() payload.isAdmin =',
      payload.isAdmin,
    );

    if (!payload.sub || !payload.username) {
      this.logger.error(
        'JwtStrategy.validate() Invalid payload structure:',
        payload,
      );
      return null;
    }

    const user: JwtUser = {
      sub: payload.sub,
      username: payload.username,
      isAdmin: Boolean(payload.isAdmin), // 安全的布林轉換
      role: payload.role,
    };

    this.logger.debug('JwtStrategy.validate() returning user:', user);

    return user;
  }
}
