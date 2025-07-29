import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { Image } from './entities/image.entity';
import { Video } from './entities/video.entity';
import { View360 } from './entities/view360.entity';
import {
  CloudinaryService,
  CloudinaryResource,
  CloudinaryApiResponse,
} from '../upload/cloudinary.service';

// 使用 require 導入 cloudinary v1
const cloudinary = require('cloudinary');

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Image) private readonly imgRepo: Repository<Image>,
    @InjectRepository(Video) private readonly vidRepo: Repository<Video>,
    @InjectRepository(View360) private readonly v360Repo: Repository<View360>,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 清除特定快取
  private async clearCache(key: string) {
    try {
      await this.cacheManager.del(key);
      this.logger.log(`[MediaService] Cache cleared for key: ${key}`);
    } catch (error) {
      this.logger.warn(
        `[MediaService] Failed to clear cache: ${error.message}`,
      );
    }
  }

  // 儲存圖片到資料庫 (CloudinaryStorage 已自動上傳)
  async saveImageToDb(file: any, dto: any) {
    this.logger.debug('SaveImageToDb called', { file });

    // multer-storage-cloudinary 回傳的格式
    const url = file.path || file.url;
    // 確保 publicId 包含完整路徑
    let publicId = file.filename || file.public_id;

    // 如果 publicId 不包含 folder 前綴，則添加
    // 注意：Cloudinary 的 public_id 可能已經包含完整路徑
    if (publicId && !publicId.startsWith('zur_images/') && !publicId.includes('/')) {
      publicId = `zur_images/${publicId}`;
    }

    if (!url) {
      this.logger.error('No URL found in file object');
      throw new BadRequestException('上傳失敗，無法取得檔案 URL');
    }

    this.logger.debug('Saving to DB', { url, publicId });

    const img = this.imgRepo.create({
      url: url,
      publicId: publicId,
      description: dto.description || '',
      category: dto.category || '',
      project: dto.project || '',
      seoTitle: dto.seoTitle || '',
      seoDescription: dto.seoDescription || '',
      seoKeywords: dto.seoKeywords || '',
      ogImage: dto.ogImage || '',
      alt: dto.alt || '',
    });
    return this.imgRepo.save(img);
  }

  // 儲存影片到資料庫 (CloudinaryStorage 已自動上傳)
  async saveVideoToDb(file: any, dto: any) {
    this.logger.debug('SaveVideoToDb called', { file });

    // multer-storage-cloudinary 回傳的格式
    const url = file.path || file.url;
    // 確保 publicId 包含完整路徑
    let publicId = file.filename || file.public_id;

    // 如果 publicId 不包含 folder 前綴，則添加
    // 注意：Cloudinary 的 public_id 可能已經包含完整路徑
    if (publicId && !publicId.startsWith('zur_videos/') && !publicId.includes('/')) {
      publicId = `zur_videos/${publicId}`;
    }

    if (!url) {
      this.logger.error('No URL found in file object');
      throw new BadRequestException('上傳失敗，無法取得檔案 URL');
    }

    this.logger.debug('Saving to DB', { url, publicId });

    const vid = this.vidRepo.create({
      url: url,
      publicId: publicId,
      description: dto.description || '',
      category: dto.category || '',
      project: dto.project || '',
      seoTitle: dto.seoTitle || '',
      seoDescription: dto.seoDescription || '',
      seoKeywords: dto.seoKeywords || '',
      ogImage: dto.ogImage || '',
      faq: dto.faq || null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      address: dto.address || '',
      city: dto.city || '',
      zipcode: dto.zipcode || '',
    });
    return this.vidRepo.save(vid);
  }

  // 儲存 360 度圖片到資料庫 (CloudinaryStorage 已自動上傳)
  async saveView360ToDb(file: any, dto: any) {
    this.logger.debug('SaveView360ToDb called', { file });

    // multer-storage-cloudinary 回傳的格式
    const url = file.path || file.url;
    // 確保 publicId 包含完整路徑
    let publicId = file.filename || file.public_id;

    // 如果 publicId 不包含 folder 前綴，則添加
    // 注意：Cloudinary 的 public_id 可能已經包含完整路徑
    if (publicId && !publicId.startsWith('zur_view360/') && !publicId.includes('/')) {
      publicId = `zur_view360/${publicId}`;
    }

    if (!url) {
      this.logger.error('No URL found in file object');
      throw new BadRequestException('上傳失敗，無法取得檔案 URL');
    }

    this.logger.debug('Saving to DB', { url, publicId });

    const v360 = this.v360Repo.create({
      url: url,
      publicId: publicId,
      description: dto.description || '',
      category: dto.category || '',
      project: dto.project || '',
      seoTitle: dto.seoTitle || '',
      seoDescription: dto.seoDescription || '',
      seoKeywords: dto.seoKeywords || '',
      ogImage: dto.ogImage || '',
      faq: dto.faq || null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      address: dto.address || '',
      city: dto.city || '',
      zipcode: dto.zipcode || '',
    });
    return this.v360Repo.save(v360);
  }

  // 列出所有媒體（支援分頁和搜尋）
  async listAll(options?: {
    page?: number;
    limit?: number;
    type?: 'image' | 'video' | 'view360';
    category?: string;
    search?: string;
  }) {
    try {
      const { page = 1, limit = 20, type, category, search } = options || {};
      const skip = (page - 1) * limit;

      // 查詢所有媒體（不分頁）
      let images: any[] = [];
      let videos: any[] = [];
      let view360s: any[] = [];

      if (!type || type === 'image') {
        const queryBuilder = this.imgRepo.createQueryBuilder('image');
        if (category) {
          queryBuilder.andWhere('image.category = :category', { category });
        }
        if (search) {
          queryBuilder.andWhere(
            '(image.description ILIKE :search OR image.project ILIKE :search)',
            { search: `%${search}%` },
          );
        }
        images = await queryBuilder.orderBy('image.createdAt', 'DESC').getMany();
      }
      if (!type || type === 'video') {
        const queryBuilder = this.vidRepo.createQueryBuilder('video');
        if (category) {
          queryBuilder.andWhere('video.category = :category', { category });
        }
        if (search) {
          queryBuilder.andWhere(
            '(video.description ILIKE :search OR video.project ILIKE :search)',
            { search: `%${search}%` },
          );
        }
        videos = await queryBuilder.orderBy('video.createdAt', 'DESC').getMany();
      }
      if (!type || type === 'view360') {
        const queryBuilder = this.v360Repo.createQueryBuilder('view360');
        if (category) {
          queryBuilder.andWhere('view360.category = :category', { category });
        }
        if (search) {
          queryBuilder.andWhere(
            '(view360.description ILIKE :search OR view360.project ILIKE :search)',
            { search: `%${search}%` },
          );
        }
        view360s = await queryBuilder.orderBy('view360.createdAt', 'DESC').getMany();
      }

      // 修復：檢查圖片表中是否有視頻記錄，並將它們標記為視頻
      const fixedImages = images.map(img => {
        if (img.publicId && img.publicId.includes('zur_videos')) {
          // 這是一個錯誤存儲在圖片表中的視頻記錄
          const { alt, ...videoData } = img; // 移除 alt 屬性，因為 Video 實體沒有這個屬性
          return {
            ...videoData,
            type: 'video' as const,
            // 保持完整的 publicId 格式，不移除前綴
            publicId: img.publicId
          };
        }
        return { ...img, type: 'image' as const };
      });

      // 合併所有媒體並添加類型標記
      let allMedia = [
        ...fixedImages,
        ...videos.map((vid) => ({ ...vid, type: 'video' as const })),
        ...view360s.map((v360) => ({ ...v360, type: 'view360' as const })),
      ];

      // 新增：列印各類型媒體的數量
      const typeCount = allMedia.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, { image: 0, video: 0, view360: 0 } as Record<'image'|'video'|'view360', number>);
      this.logger.log(`[MediaService][listAll] Count by type: image=${typeCount.image}, video=${typeCount.video}, view360=${typeCount.view360}`);

      // 按創建時間排序
      allMedia.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // 全局分頁
      const pagedMedia = allMedia.slice(skip, skip + limit);

      const result = {
        items: pagedMedia,
        pagination: {
          page,
          limit,
          total: allMedia.length,
          hasMore: skip + limit < allMedia.length,
        },
      };

      return result;
    } catch (err) {
      console.error('listAll error:', err);
      throw err;
    }
  }

  // 更新描述和分類
  async updateDescription(
    type: 'image' | 'video' | 'view360',
    publicId: string,
    description?: string,
    category?: string,
  ) {
    const repo =
      type === 'image'
        ? this.imgRepo
        : type === 'video'
          ? this.vidRepo
          : this.v360Repo;

    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;

    const res = await repo.update({ publicId }, updateData);
    if (res.affected === 0) {
      throw new BadRequestException(`找不到要更新的 ${type}: ${publicId}`);
    }

    // 清除相關快取
    await this.clearCache(`media:list:${JSON.stringify({})}`);

    return repo.findOneBy({ publicId });
  }

  /**
   * 修改媒體案名
   */
  async renameMedia(type: 'image' | 'video' | 'view360', id: string, newName: string) {
    let repo: Repository<Image | Video | View360>;
    if (type === 'image') repo = this.imgRepo;
    else if (type === 'video') repo = this.vidRepo;
    else if (type === 'view360') repo = this.v360Repo;
    else throw new BadRequestException('不支援的媒體類型');

    const media = await repo.findOne({ where: { id } });
    if (!media) throw new BadRequestException('找不到指定媒體');
    (media as any).project = newName;
    return repo.save(media);
  }

  // 刪除媒體
  async deleteMedia(type: 'image' | 'video' | 'view360', publicId: string) {
    this.logger.log(`deleteMedia called: type=${type}, publicId=${publicId}`);

    try {
      // 先從資料庫刪除
      let deletedFromDb = false;
      if (type === 'image') {
        const image = await this.imgRepo.findOne({ where: { publicId } });
        if (image) {
          await this.imgRepo.remove(image);
          deletedFromDb = true;
        }
      } else if (type === 'video') {
        const video = await this.vidRepo.findOne({ where: { publicId } });
        if (video) {
          await this.vidRepo.remove(video);
          deletedFromDb = true;
        }
      } else if (type === 'view360') {
        const view360 = await this.v360Repo.findOne({ where: { publicId } });
        if (view360) {
          await this.v360Repo.remove(view360);
          deletedFromDb = true;
        }
      }

      if (!deletedFromDb) {
        throw new NotFoundException(`找不到 ${type} 記錄: ${publicId}`);
      }

      // 從 Cloudinary 刪除
      const resourceType = type === 'view360' ? 'image' : type;
      await this.cloudinaryService.deleteResource(publicId, resourceType);

      // 清除快取
      await this.clearCache('media_list');

      this.logger.log(`deleteMedia success: ${type} ${publicId}`);
      return { success: true, message: '刪除成功' };
    } catch (error) {
      this.logger.error(`deleteMedia error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批次刪除媒體檔案
   */
  async batchDelete(
    items: Array<{ type: 'image' | 'video' | 'view360'; publicId: string }>,
  ) {
    this.logger.log(`batchDelete called with ${items.length} items`);

    const results = {
      success: [] as string[],
      failed: [] as string[],
      total: items.length,
    };

    for (const item of items) {
      try {
        await this.deleteMedia(item.type, item.publicId);
        results.success.push(`${item.type}:${item.publicId}`);
      } catch (error) {
        this.logger.error(
          `Failed to delete ${item.type}:${item.publicId}: ${error.message}`,
        );
        results.failed.push(`${item.type}:${item.publicId}`);
      }
    }

    return {
      success: true,
      results,
      message: `批次刪除完成：成功 ${results.success.length} 個，失敗 ${results.failed.length} 個`,
    };
  }

  /**
   * 批次更新分類
   */
  async batchUpdateCategory(
    items: Array<{ type: 'image' | 'video' | 'view360'; publicId: string }>,
    category: string,
  ) {
    this.logger.log(
      `batchUpdateCategory called with ${items.length} items, category: ${category}`,
    );

    const results = {
      success: [] as string[],
      failed: [] as string[],
      total: items.length,
    };

    for (const item of items) {
      try {
        if (item.type === 'image') {
          await this.imgRepo.update({ publicId: item.publicId }, { category });
        } else if (item.type === 'video') {
          await this.vidRepo.update({ publicId: item.publicId }, { category });
        } else if (item.type === 'view360') {
          await this.v360Repo.update({ publicId: item.publicId }, { category });
        }
        results.success.push(`${item.type}:${item.publicId}`);
      } catch (error) {
        this.logger.error(
          `Failed to update category for ${item.type}:${item.publicId}: ${error.message}`,
        );
        results.failed.push(`${item.type}:${item.publicId}`);
      }
    }

    return {
      success: true,
      results,
      message: `批次更新分類完成：成功 ${results.success.length} 個，失敗 ${results.failed.length} 個`,
    };
  }

  /**
   * 批次更新描述
   */
  async batchUpdateDescription(
    items: Array<{ type: 'image' | 'video' | 'view360'; publicId: string }>,
    description: string,
  ) {
    this.logger.log(`batchUpdateDescription called with ${items.length} items`);

    const results = {
      success: [] as string[],
      failed: [] as string[],
      total: items.length,
    };

    for (const item of items) {
      try {
        if (item.type === 'image') {
          await this.imgRepo.update(
            { publicId: item.publicId },
            { description },
          );
        } else if (item.type === 'video') {
          await this.vidRepo.update(
            { publicId: item.publicId },
            { description },
          );
        } else if (item.type === 'view360') {
          await this.v360Repo.update(
            { publicId: item.publicId },
            { description },
          );
        }
        results.success.push(`${item.type}:${item.publicId}`);
      } catch (error) {
        this.logger.error(
          `Failed to update description for ${item.type}:${item.publicId}: ${error.message}`,
        );
        results.failed.push(`${item.type}:${item.publicId}`);
      }
    }

    return {
      success: true,
      results,
      message: `批次更新描述完成：成功 ${results.success.length} 個，失敗 ${results.failed.length} 個`,
    };
  }

  /**
   * 批次移動到資料夾
   */
  async batchMoveToFolder(
    items: Array<{ type: 'image' | 'video' | 'view360'; publicId: string }>,
    folder: string,
  ) {
    this.logger.log(`batchMoveToFolder called: ${items.length} items to ${folder}`);

    const results: Array<{
      publicId: string;
      newPublicId?: string;
      type: 'image' | 'video' | 'view360';
      success: boolean;
      error?: string;
    }> = [];
    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        // 從 Cloudinary 移動檔案
        const newPublicId = `${folder}/${item.publicId.split('/').pop()}`;
        const resourceType = item.type === 'view360' ? 'image' : item.type;
        
        await this.cloudinaryService.renameResource(
          item.publicId,
          newPublicId,
          resourceType,
        );

        // 更新資料庫記錄
        if (item.type === 'image') {
          await this.imgRepo.update(
            { publicId: item.publicId },
            { publicId: newPublicId },
          );
        } else if (item.type === 'video') {
          await this.vidRepo.update(
            { publicId: item.publicId },
            { publicId: newPublicId },
          );
        } else if (item.type === 'view360') {
          await this.v360Repo.update(
            { publicId: item.publicId },
            { publicId: newPublicId },
          );
        }

        results.push({
          publicId: item.publicId,
          newPublicId,
          type: item.type,
          success: true,
        });
        successCount++;
      } catch (error) {
        this.logger.error(
          `batchMoveToFolder failed for ${item.publicId}: ${error.message}`,
        );
        results.push({
          publicId: item.publicId,
          type: item.type,
          success: false,
          error: error.message,
        });
        errorCount++;
      }
    }

    // 清除快取
    await this.clearCache('media_list');

    this.logger.log(
      `batchMoveToFolder completed: ${successCount} success, ${errorCount} errors`,
    );

    return {
      success: successCount > 0,
      results,
      summary: {
        total: items.length,
        success: successCount,
        error: errorCount,
      },
    };
  }

  /**
   * 批次標籤
   */
  async batchTag(
    items: Array<{ type: 'image' | 'video' | 'view360'; publicId: string }>,
    tags: string[],
  ) {
    this.logger.log(`batchTag called: ${items.length} items with tags: ${tags.join(', ')}`);

    const results: Array<{
      publicId: string;
      type: 'image' | 'video' | 'view360';
      tags: string[];
      success: boolean;
      error?: string;
    }> = [];
    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        // 為每個標籤添加
        for (const tag of tags) {
          const resourceType = item.type === 'view360' ? 'image' : item.type;
          await this.cloudinaryService.addTag(item.publicId, tag, resourceType);
        }

        results.push({
          publicId: item.publicId,
          type: item.type,
          tags,
          success: true,
        });
        successCount++;
      } catch (error) {
        this.logger.error(
          `batchTag failed for ${item.publicId}: ${error.message}`,
        );
        results.push({
          publicId: item.publicId,
          type: item.type,
          tags,
          success: false,
          error: error.message,
        });
        errorCount++;
      }
    }

    this.logger.log(
      `batchTag completed: ${successCount} success, ${errorCount} errors`,
    );

    return {
      success: successCount > 0,
      results,
      summary: {
        total: items.length,
        success: successCount,
        error: errorCount,
      },
    };
  }

  // 根據 publicId 回傳單一媒體
  async findOne(
    publicId: string,
  ): Promise<
    | (Image & { type: 'image' })
    | (Video & { type: 'video' })
    | (View360 & { type: 'view360' })
    | null
  > {
    // 直接查詢資料庫，不使用 listAll 的分頁限制
    const image = await this.imgRepo.findOne({ where: { publicId } });
    if (image) {
      return { ...image, type: 'image' as const };
    }

    const video = await this.vidRepo.findOne({ where: { publicId } });
    if (video) {
      return { ...video, type: 'video' as const };
    }

    const view360 = await this.v360Repo.findOne({ where: { publicId } });
    if (view360) {
      return { ...view360, type: 'view360' as const };
    }

    return null;
  }

  // Debug 方法：檢查資料庫狀態
  async debug() {
    const imageCount = await this.imgRepo.count();
    const videoCount = await this.vidRepo.count();
    const view360Count = await this.v360Repo.count();

    const latestImages = await this.imgRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      counts: {
        images: imageCount,
        videos: videoCount,
        view360s: view360Count,
      },
      latestImages: latestImages.map((img) => ({
        id: img.id,
        url: img.url,
        publicId: img.publicId,
        description: img.description,
        createdAt: img.createdAt,
      })),
    };
  }

  // 調試視頻記錄
  async debugVideos() {
    this.logger.log('Debugging video records...');
    const videos = await this.vidRepo.find();
    this.logger.log(`Found ${videos.length} video records`);
    
    videos.forEach(video => {
      this.logger.log(`Video: id=${video.id}, publicId=${video.publicId}, url=${video.url}`);
    });
    
    return videos;
  }

  /**
   * 從 Cloudinary 同步所有資源到資料庫（使用 upsert 避免重複）
   */
  async syncAllFromCloudinary() {
    this.logger.log('syncAllFromCloudinary started');

    let nextCursor: string | undefined;
    let totalProcessed = 0;
    let totalUpserted = 0;

    try {
      do {
        const res = await new Promise<any>((resolve, reject) => {
          cloudinary.api.resources({
            resource_type: 'auto',
            max_results: 100,
            next_cursor: nextCursor,
          }, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });

        this.logger.log(
          `Fetched ${res.resources.length} items; next_cursor=${res.next_cursor}`,
        );

        // 分類資源
        const images = res.resources.filter((r) => r.resource_type === 'image');
        const videos = res.resources.filter((r) => r.resource_type === 'video');

        // 處理圖片
        if (images.length > 0) {
          const imageUpserts = images.map((r) => ({
            publicId: r.public_id,
            url: r.secure_url,
            description: r.public_id.split('/').pop() || '',
            category: '',
            project: '',
            createdAt: new Date(r.created_at),
            updatedAt: new Date(r.updated_at || r.created_at),
          }));

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const imageResult = await this.imgRepo.upsert(imageUpserts, [
            'publicId',
          ]);
          this.logger.log(`Upserted ${images.length} images`);
          totalUpserted += images.length;
        }

        // 處理影片
        if (videos.length > 0) {
          const videoUpserts = videos.map((r) => ({
            publicId: r.public_id,
            url: r.secure_url,
            description: r.public_id.split('/').pop() || '',
            category: '',
            project: '',
            createdAt: new Date(r.created_at),
            updatedAt: new Date(r.updated_at || r.created_at),
          }));

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const videoResult = await this.vidRepo.upsert(videoUpserts, [
            'publicId',
          ]);
          this.logger.log(`Upserted ${videos.length} videos`);
          totalUpserted += videos.length;
        }

        totalProcessed += res.resources.length;
        nextCursor = res.next_cursor;
      } while (nextCursor);

      this.logger.log(
        `syncAllFromCloudinary completed: ${totalProcessed} processed, ${totalUpserted} upserted`,
      );

      return {
        totalProcessed,
        totalUpserted,
        message: '同步完成',
      };
    } catch (error) {
      this.logger.error(`syncAllFromCloudinary error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 搜尋 Cloudinary 資源並同步到資料庫
   */
  async searchAndSyncFromCloudinary(
    expression: string,
    options?: {
      max_results?: number;
      sync_to_db?: boolean;
    },
  ) {
    this.logger.log(
      `searchAndSyncFromCloudinary called, expression: ${expression}`,
    );

    try {
      const searchResult = await this.cloudinaryService.searchResources(
        expression,
      );

      this.logger.log(`Search result: ${searchResult.resources.length} items`);

      if (options?.sync_to_db) {
        // 同步搜尋結果到資料庫
        const images = searchResult.resources.filter(
          (r) => r.resource_type === 'image',
        );
        const videos = searchResult.resources.filter(
          (r) => r.resource_type === 'video',
        );

        let totalUpserted = 0;

        if (images.length > 0) {
          const imageUpserts = images.map((r) => ({
            publicId: r.public_id,
            url: r.secure_url,
            description: r.public_id.split('/').pop() || '',
            category: '',
            project: '',
            createdAt: new Date(r.created_at),
            updatedAt: new Date(r.updated_at || r.created_at),
          }));

          await this.imgRepo.upsert(imageUpserts, ['publicId']);
          totalUpserted += images.length;
        }

        if (videos.length > 0) {
          const videoUpserts = videos.map((r) => ({
            publicId: r.public_id,
            url: r.secure_url,
            description: r.public_id.split('/').pop() || '',
            category: '',
            project: '',
            createdAt: new Date(r.created_at),
            updatedAt: new Date(r.updated_at || r.created_at),
          }));

          await this.vidRepo.upsert(videoUpserts, ['publicId']);
          totalUpserted += videos.length;
        }

        this.logger.log(`Synced ${totalUpserted} items to database`);

        return {
          searchResults: searchResult.resources,
          syncedCount: totalUpserted,
          message: '搜尋並同步完成',
        };
      }

      return {
        searchResults: searchResult.resources,
        message: '搜尋完成',
      };
    } catch (error) {
      this.logger.error(`searchAndSyncFromCloudinary error: ${error.message}`);
      throw error;
    }
  }

  // 保留原有的同步方法作為備用
  async syncWithCloudinary() {
    this.logger.log('syncWithCloudinary started');

    try {
      // 使用新的 getResources 方法替代已移除的 listAllFromCloudinary
      const cloudinaryFiles = await this.cloudinaryService.getResources('', 500);
      this.logger.log('Cloudinary files count:', cloudinaryFiles.resources.length);

      const images = cloudinaryFiles.resources.filter(
        (file) => file.resource_type === 'image',
      );
      const videos = cloudinaryFiles.resources.filter(
        (file) => file.resource_type === 'video',
      );

      this.logger.log('Images from Cloudinary:', images.length);
      this.logger.log('Videos from Cloudinary:', videos.length);

      const dbImages = await this.imgRepo.find();
      const dbVideos = await this.vidRepo.find();

      const dbImagePublicIds = dbImages.map((img) => img.publicId);
      const dbVideoPublicIds = dbVideos.map((vid) => vid.publicId);

      const missingImages = images.filter(
        (img) => !dbImagePublicIds.includes(img.public_id),
      );
      const missingVideos = videos.filter(
        (vid) => !dbVideoPublicIds.includes(vid.public_id),
      );

      this.logger.log('Missing images:', missingImages.length);
      this.logger.log('Missing videos:', missingVideos.length);

      for (const img of missingImages) {
        const newImage = this.imgRepo.create({
          url: img.secure_url,
          publicId: img.public_id,
          description: img.public_id.split('/').pop() || '',
          category: '',
          project: '',
        });
        await this.imgRepo.save(newImage);
        this.logger.log('Added missing image:', img.public_id);
      }

      for (const vid of missingVideos) {
        const newVideo = this.vidRepo.create({
          url: vid.secure_url,
          publicId: vid.public_id,
          description: vid.public_id.split('/').pop() || '',
          category: '',
          project: '',
        });
        await this.vidRepo.save(newVideo);
        this.logger.log('Added missing video:', vid.public_id);
      }

      return {
        cloudinaryTotal: cloudinaryFiles.resources.length,
        cloudinaryImages: images.length,
        cloudinaryVideos: videos.length,
        dbImages: dbImages.length,
        dbVideos: dbVideos.length,
        missingImages: missingImages.length,
        missingVideos: missingVideos.length,
        addedImages: missingImages.length,
        addedVideos: missingVideos.length,
      };
    } catch (error) {
      this.logger.error('syncWithCloudinary error:', error);
      throw error;
    }
  }

  /**
   * 獲取所有分類
   */
  async getCategories() {
    this.logger.log('getCategories called');

    try {
      const [imageCategories, videoCategories, view360Categories] =
        await Promise.all([
          this.imgRepo
            .createQueryBuilder('img')
            .select('DISTINCT img.category', 'category')
            .where('img.category IS NOT NULL AND img.category != ""')
            .getRawMany(),
          this.vidRepo
            .createQueryBuilder('vid')
            .select('DISTINCT vid.category', 'category')
            .where('vid.category IS NOT NULL AND vid.category != ""')
            .getRawMany(),
          this.v360Repo
            .createQueryBuilder('v360')
            .select('DISTINCT v360.category', 'category')
            .where('v360.category IS NOT NULL AND v360.category != ""')
            .getRawMany(),
        ]);

      const allCategories = new Set([
        ...imageCategories.map((c) => c.category),
        ...videoCategories.map((c) => c.category),
        ...view360Categories.map((c) => c.category),
      ]);

      return {
        success: true,
        categories: Array.from(allCategories).sort(),
      };
    } catch (error) {
      this.logger.error(`getCategories error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 獲取所有標籤
   */
  async getTags() {
    this.logger.log('getTags called');

    try {
      const tags = await this.cloudinaryService.getAllTags();
      this.logger.log(`getTags success: ${tags.length} tags`);
      return {
        tags,
        count: tags.length,
      };
    } catch (error) {
      this.logger.error(`getTags error: ${error.message}`);
      throw error;
    }
  }

  // 修復現有的影片記錄（修正錯誤的 publicId）
  async fixVideoPublicIds() {
    this.logger.log('Fixing video publicIds...');
    
    const videos = await this.vidRepo.find();
    let fixedCount = 0;
    
    for (const video of videos) {
      let needsUpdate = false;
      let newPublicId = video.publicId;
      
      // 檢查是否有錯誤的前綴
      if (newPublicId.startsWith('zur_images/zur_videos/')) {
        newPublicId = newPublicId.replace('zur_images/zur_videos/', 'zur_videos/');
        needsUpdate = true;
      } else if (newPublicId.startsWith('zur_images/') && newPublicId.includes('zur_videos/')) {
        newPublicId = newPublicId.replace('zur_images/', '');
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        this.logger.log(`Fixing video publicId: ${video.publicId} -> ${newPublicId}`);
        video.publicId = newPublicId;
        await this.vidRepo.save(video);
        fixedCount++;
      }
    }
    
    this.logger.log(`Fixed ${fixedCount} video records`);
    return { fixedCount, totalVideos: videos.length };
  }

  // 手動修復視頻記錄
  async manuallyFixVideoRecords() {
    this.logger.log('Manually fixing video records...');
    
    // 查找所有視頻記錄
    const videos = await this.vidRepo.find();
    let fixedCount = 0;
    
    for (const video of videos) {
      let needsUpdate = false;
      let newPublicId = video.publicId;
      
      // 檢查並修復 publicId
      if (newPublicId.startsWith('zur_images/zur_videos/')) {
        newPublicId = newPublicId.replace('zur_images/zur_videos/', 'zur_videos/');
        needsUpdate = true;
        this.logger.log(`Fixing video publicId: ${video.publicId} -> ${newPublicId}`);
      } else if (newPublicId.startsWith('zur_images/') && newPublicId.includes('zur_videos/')) {
        newPublicId = newPublicId.replace('zur_images/', '');
        needsUpdate = true;
        this.logger.log(`Fixing video publicId: ${video.publicId} -> ${newPublicId}`);
      }
      
      if (needsUpdate) {
        video.publicId = newPublicId;
        await this.vidRepo.save(video);
        fixedCount++;
      }
    }
    
    this.logger.log(`Fixed ${fixedCount} video records`);
    return { fixedCount, totalVideos: videos.length };
  }

  // 修復錯誤存儲在圖片表中的視頻記錄
  async fixVideoRecordsInImageTable() {
    this.logger.log('Fixing video records in image table...');
    
    // 查找圖片表中包含 'zur_videos' 的記錄
    const imagesWithVideoPublicId = await this.imgRepo.find({
      where: {
        publicId: {
          contains: 'zur_videos'
        } as any
      }
    });
    
    this.logger.log(`Found ${imagesWithVideoPublicId.length} video records in image table`);
    
    let fixedCount = 0;
    
    for (const imageRecord of imagesWithVideoPublicId) {
      // 創建視頻記錄
      const videoRecord = this.vidRepo.create({
        url: imageRecord.url,
        publicId: imageRecord.publicId.replace('zur_images/', ''),
        description: imageRecord.description,
        category: imageRecord.category,
        project: imageRecord.project,
        seoTitle: imageRecord.seoTitle,
        seoDescription: imageRecord.seoDescription,
        seoKeywords: imageRecord.seoKeywords,
        ogImage: imageRecord.ogImage,
        createdAt: imageRecord.createdAt
      });
      
      // 保存到視頻表
      await this.vidRepo.save(videoRecord);
      
      // 從圖片表刪除
      await this.imgRepo.remove(imageRecord);
      
      this.logger.log(`Fixed video record: ${imageRecord.publicId} -> ${videoRecord.publicId}`);
      fixedCount++;
    }
    
    this.logger.log(`Fixed ${fixedCount} video records`);
    return { fixedCount, totalFound: imagesWithVideoPublicId.length };
  }

  /**
   * 新增：深度診斷方法
   */
  async debugView360() {
    this.logger.log('[DIAGNOSTIC] Starting debugView360...');
    try {
      const view360s = await this.v360Repo.find();
      this.logger.log(`[DIAGNOSTIC] Found ${view360s.length} records in the view360 table.`);

      if (view360s.length > 0) {
        this.logger.log('[DIAGNOSTIC] Raw data from database for first record:', JSON.stringify(view360s[0], null, 2));
      }

      return view360s;
    } catch (error) {
      this.logger.error('[DIAGNOSTIC] Error fetching from v360Repo:', error);
      throw error;
    }
  }
}
