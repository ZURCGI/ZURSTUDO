import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  resource_type: string;
  tags?: string[];
  [key: string]: any;
}

export interface CloudinaryApiResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
  rate_limit_allowed: number;
  rate_limit_reset_at: string;
  rate_limit_remaining: number;
}

export interface CloudinaryTagsResponse {
  tags: string[];
  [key: string]: any;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    // 從環境變數讀取 Cloudinary 配置
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn('⚠️ Cloudinary 配置不完整，請檢查環境變數');
    }

    this.logger.log(
      `[CloudinaryService] 配置 Cloudinary: cloud_name=${cloudName || '未設定'}, api_key=${apiKey ? '已設定' : '未設定'}, api_secret=${apiSecret ? '已設定' : '未設定'}`,
    );

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  /**
   * 串流上傳到 Cloudinary (避免記憶體溢位)
   */
  uploadStream(
    stream: Readable,
    folder = 'media',
    resourceType: 'image' | 'video' = 'image',
    publicId?: string,
  ): Promise<any> {
    this.logger.log(
      `uploadStream called, folder: ${folder}, type: ${resourceType}`,
    );
    return new Promise((resolve, reject) => {
      const upl = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType, public_id: publicId },
        (error, result) => {
          if (error) {
            this.logger.error(`uploadStream failed: ${error.message}`);
            return reject(new BadRequestException(error.message));
          }
          if (!result) {
            this.logger.error('uploadStream failed: No upload result received');
            return reject(new BadRequestException('No upload result received'));
          }
          this.logger.log(`uploadStream success: ${result.public_id}`);
          resolve(result);
        },
      );
      stream.pipe(upl);
    });
  }

  /**
   * 上傳 Buffer 到 Cloudinary (image) - 保留作為備用
   */
  uploadBuffer(buffer: Buffer, folder = 'media'): Promise<any> {
    this.logger.log(
      `uploadBuffer called, folder: ${folder}, buffer size: ${buffer.length}`,
    );
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) {
            this.logger.error(`uploadBuffer failed: ${error.message}`);
            return reject(new BadRequestException(error.message));
          }
          if (!result) {
            this.logger.error('uploadBuffer failed: No upload result received');
            return reject(new BadRequestException('No upload result received'));
          }
          this.logger.log(`uploadBuffer success: ${result.public_id}`);
          resolve(result);
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }

  /**
   * 上傳大文件到 Cloudinary (video)，支援分片上傳 - 保留作為備用
   */
  uploadVideoBuffer(
    buffer: Buffer,
    folder = 'media',
    publicId?: string,
  ): Promise<any> {
    this.logger.log(
      `uploadVideoBuffer called, folder: ${folder}, buffer size: ${buffer.length}`,
    );
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder,
          public_id: publicId,
          chunk_size: 6000000,
        },
        (error, result) => {
          if (error) {
            this.logger.error(`uploadVideoBuffer failed: ${error.message}`);
            return reject(new BadRequestException(error.message));
          }
          if (!result) {
            this.logger.error(
              'uploadVideoBuffer failed: No upload result received',
            );
            return reject(new BadRequestException('No upload result received'));
          }
          this.logger.log(`uploadVideoBuffer success: ${result.public_id}`);
          resolve(result);
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }

  /**
   * 從 Cloudinary 刪除檔案 (已棄用，請使用 deleteFromCloudinary)
   * @deprecated 請使用 deleteFromCloudinary 方法
   */
  async destroy(
    publicId: string,
    resourceType: 'image' | 'video',
  ): Promise<void> {
    this.logger.log(
      `[Cloudinary] destroy called (deprecated), publicId: ${publicId}, resourceType: ${resourceType}`,
    );
    // 直接呼叫 deleteFromCloudinary 以保持一致性
    return this.deleteFromCloudinary(publicId, resourceType);
  }

  /**
   * 刪除 Cloudinary 資源
   */
  async deleteResource(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<any> {
    this.logger.log(`deleteResource called, publicId: ${publicId}, type: ${resourceType}`);
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
        if (error) {
          this.logger.error(`deleteResource failed: ${error.message}`);
          return reject(new BadRequestException(error.message));
        }
        this.logger.log(`deleteResource success: ${publicId}`);
        resolve(result);
      });
    });
  }

  /**
   * 取得 Cloudinary 資源列表
   */
  async getResources(folder: string, maxResults = 50, nextCursor?: string): Promise<CloudinaryApiResponse> {
    this.logger.log(`getResources called, folder: ${folder}, maxResults: ${maxResults}`);
    return new Promise((resolve, reject) => {
      const options: any = {
        type: 'upload',
        prefix: folder,
        max_results: maxResults,
      };
      
      if (nextCursor) {
        options.next_cursor = nextCursor;
      }

      cloudinary.api.resources(options, (error, result) => {
        if (error) {
          this.logger.error(`getResources failed: ${error.message}`);
          return reject(new BadRequestException(error.message));
        }
        this.logger.log(`getResources success: ${result.resources?.length || 0} resources`);
        resolve(result);
      });
    });
  }

  /**
   * 搜尋 Cloudinary 檔案
   */
  async searchCloudinary(
    expression: string,
    options?: {
      max_results?: number;
      next_cursor?: string;
    },
  ): Promise<CloudinaryApiResponse> {
    this.logger.log(`searchCloudinary called, expression: ${expression}`);

    try {
      const searchResult = (await cloudinary.search
        .expression(expression)
        .max_results(options?.max_results || 100)
        .next_cursor(options?.next_cursor)
        .execute()) as CloudinaryApiResponse;

      this.logger.log(
        `searchCloudinary result: ${searchResult.resources.length} items`,
      );
      return searchResult;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`searchCloudinary failed: ${errorMessage}`);
      throw new BadRequestException(
        `Failed to search Cloudinary: ${errorMessage}`,
      );
    }
  }

  /**
   * 從 Cloudinary 刪除檔案
   */
  async deleteFromCloudinary(
    publicId: string,
    resourceType: 'image' | 'video' | 'view360',
  ): Promise<void> {
    this.logger.log(
      `[CloudinaryService] deleteFromCloudinary called: publicId=${publicId}, resourceType=${resourceType}`,
    );

    // 驗證參數
    if (!publicId) {
      throw new BadRequestException('publicId 不能為空');
    }

    if (
      !resourceType ||
      !['image', 'video', 'view360'].includes(resourceType)
    ) {
      throw new BadRequestException(`無效的 resourceType: ${resourceType}`);
    }

    // view360 實際上是 image 類型
    const actualResourceType =
      resourceType === 'view360' ? 'image' : resourceType;

    this.logger.log(
      `[CloudinaryService] 準備刪除: publicId=${publicId}, originalType=${resourceType}, actualType=${actualResourceType}`,
    );

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: actualResourceType },
        (error, result) => {
          if (error) {
            this.logger.error(
              `[CloudinaryService] deleteFromCloudinary failed: publicId=${publicId}, error=${error.message}`,
            );
            return reject(
              new BadRequestException(`Delete failed: ${error.message}`),
            );
          }

          this.logger.log(
            `[CloudinaryService] deleteFromCloudinary success: publicId=${publicId}, result=${JSON.stringify(result)}`,
          );
          resolve();
        },
      );
    });
  }

  /**
   * 移動檔案到指定資料夾
   */
  async moveToFolder(
    publicId: string,
    folder: string,
    resourceType: 'image' | 'video' | 'view360',
  ): Promise<void> {
    this.logger.log(
      `moveToFolder called: ${publicId} -> ${folder}, type: ${resourceType}`,
    );

    // view360 實際上是 image 類型
    const actualResourceType =
      resourceType === 'view360' ? 'image' : resourceType;

    return new Promise((resolve, reject) => {
      cloudinary.uploader.rename(
        publicId,
        `${folder}/${publicId.split('/').pop()}`,
        { resource_type: actualResourceType },
        (error, result) => {
          if (error) {
            this.logger.error(`moveToFolder failed: ${error.message}`);
            return reject(
              new BadRequestException(`Move failed: ${error.message}`),
            );
          }
          this.logger.log(`moveToFolder success: ${publicId} -> ${folder}`);
          resolve();
        },
      );
    });
  }

  /**
   * 為檔案添加標籤
   */
  async addTags(
    publicId: string,
    tags: string[],
    resourceType: 'image' | 'video' | 'view360',
  ): Promise<void> {
    this.logger.log(
      `addTags called: ${publicId}, tags: ${tags.join(', ')}, type: ${resourceType}`,
    );

    // view360 實際上是 image 類型
    const actualResourceType =
      resourceType === 'view360' ? 'image' : resourceType;

    return new Promise((resolve, reject) => {
      cloudinary.uploader.add_tag(
        tags.join(','),
        [publicId],
        { resource_type: actualResourceType },
        (error, result) => {
          if (error) {
            this.logger.error(`addTags failed: ${error.message}`);
            return reject(
              new BadRequestException(`Add tags failed: ${error.message}`),
            );
          }
          this.logger.log(`addTags success: ${publicId}`);
          resolve();
        },
      );
    });
  }

  /**
   * 獲取所有標籤
   */
  async getAllTags(): Promise<{ tags: string[] }> {
    this.logger.log('getAllTags called');

    try {
      const result = (await cloudinary.api.tags({
        max_results: 500,
      })) as CloudinaryTagsResponse;

      this.logger.log(`getAllTags result: ${result.tags.length} tags`);
      return {
        tags: result.tags || [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`getAllTags failed: ${errorMessage}`);
      throw new BadRequestException(`Failed to get tags: ${errorMessage}`);
    }
  }

  /**
   * 更新檔案標籤
   */
  async updateTags(
    publicId: string,
    tags: string[],
    resourceType: 'image' | 'video' | 'view360',
  ): Promise<void> {
    this.logger.log(
      `updateTags called: ${publicId}, tags: ${tags.join(', ')}, type: ${resourceType}`,
    );

    // view360 實際上是 image 類型
    const actualResourceType =
      resourceType === 'view360' ? 'image' : resourceType;

    return new Promise((resolve, reject) => {
      cloudinary.uploader.replace_tag(
        tags.join(','),
        [publicId],
        { resource_type: actualResourceType },
        (error, result) => {
          if (error) {
            this.logger.error(`updateTags failed: ${error.message}`);
            return reject(
              new BadRequestException(`Update tags failed: ${error.message}`),
            );
          }
          this.logger.log(`updateTags success: ${publicId}`);
          resolve();
        },
      );
    });
  }

  /**
   * 移除檔案標籤
   */
  async removeTags(
    publicId: string,
    tags: string[],
    resourceType: 'image' | 'video' | 'view360',
  ): Promise<void> {
    this.logger.log(
      `removeTags called: ${publicId}, tags: ${tags.join(', ')}, type: ${resourceType}`,
    );

    // view360 實際上是 image 類型
    const actualResourceType =
      resourceType === 'view360' ? 'image' : resourceType;

    return new Promise((resolve, reject) => {
      cloudinary.uploader.remove_tag(
        tags.join(','),
        [publicId],
        { resource_type: actualResourceType },
        (error, result) => {
          if (error) {
            this.logger.error(`removeTags failed: ${error.message}`);
            return reject(
              new BadRequestException(`Remove tags failed: ${error.message}`),
            );
          }
          this.logger.log(`removeTags success: ${publicId}`);
          resolve();
        },
      );
    });
  }
}
