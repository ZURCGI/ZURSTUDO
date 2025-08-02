// src/auth/jwt-auth.guard.ts
import { Injectable, Logger, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface JwtUser {
  sub: string;
  username: string;
  isAdmin: boolean;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest<TUser = JwtUser>(
    err: any,
    user: TUser | null,
    info: any,
    context: ExecutionContext,
  ): TUser | null {
    // 只在有錯誤時記錄，避免記錄正常的未認證請求
    if (err) {
      this.logger.error(`JWT Auth Guard failed - err: ${err}, info: ${info}`);
    } else if (!user && info && info.message === 'No auth token') {
      // 靜默處理無令牌的情況，這是預期行為
      this.logger.debug(`JWT Auth Guard - No auth token provided`);
    } else if (!user) {
      this.logger.warn(`JWT Auth Guard - Invalid token or user not found`);
    }

    return super.handleRequest(err, user, info, context);
  }
}
