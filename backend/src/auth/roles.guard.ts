import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * 自訂 Swagger 裝飾器，標註 API 角色權限
 * @param roles 允許的角色
 * @param summary API 摘要
 * @param description API 說明
 */
export function ApiRoles(roles: string[], summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({
      summary,
      description: `${description || ''}（僅限角色：${roles.join('、')}）`,
    }),
    ApiResponse({ status: 403, description: `權限不足，僅限 ${roles.join('、')}` })
  );
}

interface RequestUser {
  sub: string;
  username: string;
  isAdmin: boolean;
  role?: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = request.user as RequestUser | undefined;

    if (!user) {
      return false;
    }

    // 檢查用戶角色
    if (user.isAdmin) {
      return true; // 管理員擁有所有權限
    }

    // 檢查特定角色
    return requiredRoles.some((role) => user.role === role);
  }
}
