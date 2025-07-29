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
        { folder },
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
      uploadStream.end(buffer);
    });
  }

  /**
   * 上傳 Buffer 到 Cloudinary (video) - 保留作為備用
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
        { folder, resource_type: 'video', public_id: publicId },
        (error, result) => {
          if (error) {
            this.logger.error(`uploadVideoBuffer failed: ${error.message}`);
            return reject(new BadRequestException(error.message));
          }
          if (!result) {
            this.logger.error('uploadVideoBuffer failed: No upload result received');
            return reject(new BadRequestException('No upload result received'));
          }
          this.logger.log(`uploadVideoBuffer success: ${result.public_id}`);
          resolve(result);
        },
      );
      uploadStream.end(buffer);
    });
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
   * 搜尋 Cloudinary 資源
   */
  async searchResources(query: string, folder?: string): Promise<any> {
    this.logger.log(`searchResources called, query: ${query}, folder: ${folder}`);
    try {
      const searchResult = (await cloudinary.search
        .expression(query)
        .sort_by('created_at', 'desc')
        .max_results(50)
        .execute()) as any;

      this.logger.log(`searchResources success: ${searchResult.resources?.length || 0} results`);
      return searchResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`searchResources failed: ${errorMessage}`);
      throw new BadRequestException(`Search failed: ${errorMessage}`);
    }
  }

  /**
   * 批次刪除資源
   */
  async batchDeleteResources(publicIds: string[], resourceType: 'image' | 'video' = 'image'): Promise<any[]> {
    this.logger.log(`batchDeleteResources called, count: ${publicIds.length}, type: ${resourceType}`);
    const results: any[] = [];

    for (const publicId of publicIds) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.destroy(
            publicId,
            { resource_type: resourceType },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          );
        });
        results.push({ publicId, success: true, result });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`batchDeleteResources failed for ${publicId}: ${errorMessage}`);
        results.push({ publicId, success: false, error: errorMessage });
      }
    }

    this.logger.log(`batchDeleteResources completed: ${results.filter(r => r.success).length}/${publicIds.length} successful`);
    return results;
  }

  /**
   * 重新命名資源
   */
  async renameResource(fromPublicId: string, toPublicId: string, resourceType: 'image' | 'video' = 'image'): Promise<any> {
    this.logger.log(`renameResource called, from: ${fromPublicId}, to: ${toPublicId}, type: ${resourceType}`);
    return new Promise((resolve, reject) => {
      cloudinary.uploader.rename(
        fromPublicId,
        toPublicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            this.logger.error(`renameResource failed: ${error.message}`);
            return reject(new BadRequestException(error.message));
          }
          this.logger.log(`renameResource success: ${fromPublicId} -> ${toPublicId}`);
          resolve(result);
        },
      );
    });
  }

  /**
   * 添加標籤
   */
  async addTag(publicId: string, tag: string, resourceType: 'image' | 'video' = 'image'): Promise<any> {
    this.logger.log(`addTag called, publicId: ${publicId}, tag: ${tag}, type: ${resourceType}`);
    return new Promise((resolve, reject) => {
      cloudinary.uploader.add_tag(
        tag,
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            this.logger.error(`addTag failed: ${error.message}`);
            return reject(new BadRequestException(error.message));
          }
          this.logger.log(`addTag success: ${publicId} -> ${tag}`);
          resolve(result);
        },
      );
    });
  }

  /**
   * 取得所有標籤
   */
  async getAllTags(): Promise<string[]> {
    this.logger.log('getAllTags called');
    try {
      const result = (await cloudinary.api.tags({
        max_results: 500,
      })) as any;

      this.logger.log(`getAllTags success: ${result.tags?.length || 0} tags`);
      return result.tags || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`getAllTags failed: ${errorMessage}`);
      throw new BadRequestException(`Failed to get tags: ${errorMessage}`);
    }
  }

  /**
   * 替換標籤
   */
  async replaceTag(publicId: string, oldTag: string, newTag: string, resourceType: 'image' | 'video' = 'image'): Promise<any> {
    this.logger.log(`replaceTag called, publicId: ${publicId}, oldTag: ${oldTag}, newTag: ${newTag}, type: ${resourceType}`);
    return new Promise((resolve, reject) => {
      cloudinary.uploader.replace_tag(
        newTag,
        publicId,
        { resource_type: resourceType, tag: oldTag },
        (error, result) => {
          if (error) {
            this.logger.error(`replaceTag failed: ${error.message}`);
            return reject(new BadRequestException(error.message));
          }
          this.logger.log(`replaceTag success: ${publicId} -> ${oldTag} -> ${newTag}`);
          resolve(result);
        },
      );
    });
  }

  /**
   * 移除標籤
   */
  async removeTag(publicId: string, tag: string, resourceType: 'image' | 'video' = 'image'): Promise<any> {
    this.logger.log(`removeTag called, publicId: ${publicId}, tag: ${tag}, type: ${resourceType}`);
    return new Promise((resolve, reject) => {
      cloudinary.uploader.remove_tag(
        tag,
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            this.logger.error(`removeTag failed: ${error.message}`);
            return reject(new BadRequestException(error.message));
          }
          this.logger.log(`removeTag success: ${publicId} -> ${tag}`);
          resolve(result);
        },
      );
    });
  }
}
