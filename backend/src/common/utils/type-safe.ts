// 類型安全工具函數
export class TypeSafeUtils {
  /**
   * 安全的類型斷言
   */
  static safeAssert<T>(
    value: unknown,
    typeGuard: (value: unknown) => value is T,
  ): T {
    if (typeGuard(value)) {
      return value;
    }
    throw new Error(`Type assertion failed for value: ${String(value)}`);
  }

  /**
   * 安全的屬性訪問
   */
  static safeGet<T>(obj: unknown, key: string): T | undefined {
    if (obj && typeof obj === 'object' && key in obj) {
      return (obj as Record<string, T>)[key];
    }
    return undefined;
  }

  /**
   * 安全的數組檢查
   */
  static isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  /**
   * 安全的字符串檢查
   */
  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  /**
   * 安全的數字檢查
   */
  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * 安全的錯誤處理
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error occurred';
  }

  /**
   * 安全的日期轉換
   */
  static safeDate(value: unknown): Date | null {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }
}

// 常用類型守衛
export const typeGuards = {
  isCloudinaryResponse: (
    value: unknown,
  ): value is import('cloudinary').CloudinaryResponse => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'public_id' in value &&
      'secure_url' in value
    );
  },

  isGeoIpResult: (
    value: unknown,
  ): value is import('geoip-lite').GeoIpResult => {
    return typeof value === 'object' && value !== null && 'country' in value;
  },
};
