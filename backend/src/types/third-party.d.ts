// 第三方庫類型定義
declare module 'cloudinary' {
  export interface CloudinaryResponse {
    public_id: string;
    secure_url: string;
    url: string;
    filename: string;
    created_at: string;
    updated_at: string;
    resource_type: string;
  }

  export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    url: string;
    format: string;
    width: number;
    height: number;
    resource_type: string;
    created_at: string;
  }

  export interface CloudinaryApiResponse {
    resources: CloudinaryResponse[];
    next_cursor?: string;
    rate_limit_allowed: number;
    rate_limit_reset_at: string;
    rate_limit_remaining: number;
  }
}

declare module 'geoip-lite' {
  export interface GeoIpResult {
    country: string;
    region: string;
    city: string;
    ll: [number, number];
    metro: number;
    area: number;
  }

  export function lookup(ip: string): GeoIpResult | null;
}

// 擴展 Express 類型
declare global {
  namespace Express {
    interface Request {
      user?: import('../users/entities/user.entity').User;
      // 添加其他自定義屬性
      customProperty?: string;
    }
  }
}

export {};
