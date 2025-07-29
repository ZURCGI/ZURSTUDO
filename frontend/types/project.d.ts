// frontend/types/project.d.ts

// 認證用
export interface UserCredentials {
  username: string;
  password: string;
}
export interface AuthError extends Error {
  code?: string;
}

// Project Entity
export interface Project {
  id: number;
  name: string;
  
  // SEO Fields - 暫時註釋掉，等數據庫欄位添加後再啟用
  /*
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  
  // AEO (FAQ) Fields
  faqList?: Array<{ question: string; answer: string }>;
  
  // GEO Fields
  address: string;
  lat?: number;
  lng?: number;
  city: string;
  zipcode: string;
  */
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Project DTOs
export interface CreateProjectDto {
  name: string;
  // 暫時註釋掉，等數據庫欄位添加後再啟用
  /*
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  faqList?: Array<{ question: string; answer: string }>;
  address?: string;
  lat?: number;
  lng?: number;
  city?: string;
  zipcode?: string;
  */
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

// SEO
export interface SiteSetting {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  robots?: string;
  sitemap?: string;
  // 多語關鍵字與描述
  siteKeywordsZh?: string;
  siteKeywordsEn?: string;
  siteDescriptionZh?: string;
  siteDescriptionEn?: string;
  // FAQ 多語
  faqListZh?: Array<{ question: string; answer: string }>;
  faqListEn?: Array<{ question: string; answer: string }>;
  // 單語兼容
  faqList?: Array<{ question: string; answer: string }>;
  address?: string;
  lat?: number;
  lng?: number;
  city?: string;
  zipcode?: string;
  // ...其他欄位可依需求擴充
}
export interface JSONLDMeta {
  "@context": string;
  "@type": string;
  [key: string]: any;
}
export interface MetaItem {
  name: string;
  content: string;
}

// MediaUploader 相關
export interface SignatureData {
  api_key: string;
  timestamp: number;
  signature: string;
  // 若後端有回傳 upload_url、folder 等欄位可加上
  upload_url?: string;
  folder?: string;
  resource_type?: string;
}
// Cloudinary 回傳型別（如有安裝 @types/cloudinary）
// import type { UploadApiResponse } from 'cloudinary';
// export type CloudinaryUploadResult = UploadApiResponse;
export type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  [key: string]: any;
};

// 其他共用型別可以陸續補充 