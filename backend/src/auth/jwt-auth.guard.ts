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
    this.logger.log(
      `JWT Auth Guard - err: ${err}, user: ${user ? 'exists' : 'missing'}, info: ${info}`,
    );

    if (err || !user) {
      this.logger.error(`JWT Auth Guard failed - err: ${err}, info: ${info}`);
    }

    return super.handleRequest(err, user, info, context);
  }
}
