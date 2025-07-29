import { Logger } from '@nestjs/common';

export class SecurityLogger extends Logger {
  private static instance: SecurityLogger;

  private constructor() {
    super('SecurityLogger');
  }

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  // 記錄認證事件
  logAuthEvent(event: string, username: string, success: boolean, ip?: string) {
    const logData = {
      event,
      username,
      success,
      timestamp: new Date().toISOString(),
      ip: ip || 'unknown',
    };
    
    if (success) {
      this.log(`AUTH_SUCCESS: ${event} - User: ${username} - IP: ${logData.ip}`);
    } else {
      this.warn(`AUTH_FAILURE: ${event} - User: ${username} - IP: ${logData.ip}`);
    }
  }

  // 記錄敏感操作
  logSensitiveOperation(operation: string, username: string, details?: any) {
    const logData = {
      operation,
      username,
      timestamp: new Date().toISOString(),
      details: details ? JSON.stringify(details) : undefined,
    };
    
    this.log(`SENSITIVE_OP: ${operation} - User: ${username}`);
  }

  // 記錄安全警告
  logSecurityWarning(warning: string, context?: any) {
    const logData = {
      warning,
      timestamp: new Date().toISOString(),
      context: context ? JSON.stringify(context) : undefined,
    };
    
    this.warn(`SECURITY_WARNING: ${warning}`);
  }

  // 記錄 API 請求（不包含敏感資訊）
  logApiRequest(method: string, path: string, statusCode: number, username?: string) {
    const logData = {
      method,
      path,
      statusCode,
      username: username || 'anonymous',
      timestamp: new Date().toISOString(),
    };
    
    this.log(`API_REQUEST: ${method} ${path} - Status: ${statusCode} - User: ${logData.username}`);
  }
}

// 導出單例
export const securityLogger = SecurityLogger.getInstance(); 