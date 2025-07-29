// src/auth/dto/user-payload.dto.ts

/**
 * JWT Token 中儲存的用戶資訊
 */
export interface UserPayload {
  /**
   * 用戶 ID (Subject)
   */
  sub: string;

  /**
   * 用戶名
   */
  username: string;

  /**
   * 是否為管理員
   */
  isAdmin: boolean;

  /**
   * 用戶角色
   */
  role?: string;
}

/**
 * 經過身份驗證後，附加了 user payload 的 Express Request 物件
 */
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}
