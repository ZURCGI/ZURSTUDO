import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';
import { MediaService } from './media.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { UploadView360Dto } from './dto/upload-view360.dto';
import {
  BatchDeleteDto,
  BatchUpdateCategoryDto,
  BatchUpdateDescriptionDto,
  BatchMoveToFolderDto,
  BatchTagDto,
} from './dto/batch-operations.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import {
  CloudinaryResource,
  CloudinaryApiResponse,
} from '../upload/cloudinary.service';
import { ApiRoles } from '../auth/roles.guard';
import { RenameMediaDto } from './dto/rename-media.dto';

// 建立 CloudinaryStorage 工廠函數
const createCloudinaryStorage = (
  folder: string,
  resourceType: 'image' | 'video',
) => {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  const cloudinary = require('cloudinary');

  // 確保 cloudinary 有正確配置
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      resource_type: resourceType,
      transformation:
        resourceType === 'image'
          ? [
              { width: 1920, height: 1080, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ]
          : undefined,
    },
  });
};

@ApiTags('media')
@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);
  
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({
    summary: '媒體服務健康檢查',
    description: '檢查媒體服務是否正常運行',
  })
  @ApiResponse({ status: 200, description: '服務正常' })
  @Get('health')
  // eslint-disable-next-line @typescript-eslint/require-await
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'media-service',
      streamUpload: true,
    };
  }

  // 測試端點：直接查詢資料庫
  @Get('debug')
  async debug() {
    return this.mediaService.debug();
  }

  @Get('debug-videos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async debugVideos() {
    this.logger.debug('DebugVideos called');
    const videos = await this.mediaService.debugVideos();
    return {
      totalVideos: videos.length,
      videos: videos.map(v => ({
        id: v.id,
        publicId: v.publicId,
        url: v.url,
        type: 'video'
      }))
    };
  }

  /**
   * 新增：臨時的診斷路由
   */
  @Get('/debug-view360')
  async debugView360() {
    return this.mediaService.debugView360();
  }

  @ApiRoles(['admin', 'media_editor'], '同步 Cloudinary 資源', '同步 Cloudinary 和資料庫中的媒體資源')
  @ApiResponse({ status: 200, description: '同步完成' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiBearerAuth('JWT-auth')
  @Post('sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  async sync() {
    this.logger.log('Sync called');
    return this.mediaService.syncWithCloudinary();
  }

  // 新的完整同步端點：使用 upsert 同步所有 Cloudinary 資源
  @ApiRoles(['admin', 'media_editor'], '完整同步 Cloudinary', 'upsert 同步所有 Cloudinary 資源')
  @Post('sync-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  async syncAll() {
    this.logger.log('SyncAll called');
    return this.mediaService.syncAllFromCloudinary();
  }

  // 搜尋並同步端點
  @ApiRoles(['admin', 'media_editor'], '搜尋並同步 Cloudinary', '搜尋並同步 Cloudinary 資源')
  @Post('search-sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  async searchAndSync(
    @Body()
    body: {
      expression: string;
      max_results?: number;
      sync_to_db?: boolean;
    },
  ) {
    this.logger.debug('SearchAndSync called with:', body);
    return this.mediaService.searchAndSyncFromCloudinary(body.expression, {
      max_results: body.max_results,
      sync_to_db: body.sync_to_db,
    });
  }

  // 搜尋端點（僅搜尋，不同步）
  @ApiRoles(['admin', 'media_editor'], '搜尋 Cloudinary', '僅搜尋，不同步')
  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  async search(
    @Query('expression') expression: string,
    @Query('max_results') maxResults?: string,
  ) {
    this.logger.debug('Search called with expression:', expression);
    const maxResultsNum = maxResults ? parseInt(maxResults, 10) : 100;
    return this.mediaService.searchAndSyncFromCloudinary(expression, {
      max_results: maxResultsNum,
      sync_to_db: false,
    });
  }

  @ApiRoles(['admin', 'media_editor'], '上傳圖片', '上傳圖片到 Cloudinary 並保存到資料庫')
  @ApiResponse({ status: 201, description: '圖片上傳成功' })
  @ApiResponse({ status: 400, description: '檔案格式錯誤或檔案過大' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiBearerAuth('JWT-auth')
  @Post('upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createCloudinaryStorage('zur_images', 'image'),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB 限制
    }),
  )
  async uploadImage(
    @Req() req,
    @UploadedFile() file: any,
    @Body() dto: UploadImageDto,
  ) {
    this.logger.debug('UploadImage called', { dto });

    if (!file) {
      this.logger.warn('No file received');
      throw new BadRequestException('請附帶檔案');
    }

    // multer-storage-cloudinary 回傳的格式
    const url = file.path || file.url;
    if (!url) {
      this.logger.error('File uploaded but no URL returned', { file });
      throw new BadRequestException('上傳失敗，無法取得檔案 URL');
    }

    this.logger.log('File uploaded successfully', { url });
    return this.mediaService.saveImageToDb(file, dto);
  }

  @ApiRoles(['admin', 'media_editor'], '上傳影片', '上傳影片到 Cloudinary 並保存到資料庫')
  @Post('upload-video')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createCloudinaryStorage('zur_videos', 'video'),
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB 限制
    }),
  )
  async uploadVideo(
    @Req() req,
    @UploadedFile() file: any,
    @Body() dto: UploadVideoDto,
  ) {
    if (!file) throw new BadRequestException('請附帶檔案');
    return this.mediaService.saveVideoToDb(file, dto);
  }

  @ApiRoles(['admin', 'media_editor'], '上傳 360 圖片', '上傳 360 圖片到 Cloudinary 並保存到資料庫')
  @Post('upload-view360')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createCloudinaryStorage('zur_view360', 'image'),
      limits: { fileSize: 30 * 1024 * 1024 }, // 30MB 限制
    }),
  )
  async uploadView360(
    @Req() req,
    @UploadedFile() file: any,
    @Body() dto: UploadView360Dto,
  ) {
    if (!file) throw new BadRequestException('請附帶檔案');
    return this.mediaService.saveView360ToDb(file, dto);
  }

  @ApiOperation({
    summary: '列出所有媒體',
    description: '取得所有媒體資源列表，支援分頁和篩選',
  })
  @ApiResponse({ status: 200, description: '媒體列表' })
  @Get('list')
  async listAllMedia(@Query() query) {
    return this.mediaService.listAll(query);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  async getCategories() {
    this.logger.debug('GetCategories called');
    return this.mediaService.getCategories();
  }

  @Get('tags')
  @UseGuards(JwtAuthGuard)
  async getTags() {
    this.logger.debug('GetTags called');
    return this.mediaService.getTags();
  }

  @Get('fix-video-publicids')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async fixVideoPublicIds() {
    this.logger.debug('FixVideoPublicIds called');
    return this.mediaService.fixVideoPublicIds();
  }

  @Get('manually-fix-videos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async manuallyFixVideoRecords() {
    this.logger.debug('ManuallyFixVideoRecords called');
    return this.mediaService.manuallyFixVideoRecords();
  }

  @Get('fix-videos-in-image-table')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async fixVideoRecordsInImageTable() {
    this.logger.debug('FixVideoRecordsInImageTable called');
    return this.mediaService.fixVideoRecordsInImageTable();
  }

  @Get('fix-videos-public')
  async fixVideoRecordsPublic() {
    this.logger.debug('FixVideoRecordsPublic called');
    return this.mediaService.fixVideoRecordsInImageTable();
  }

  @ApiRoles(['admin', 'media_editor'], '更新媒體描述/分類', '更新媒體描述或分類')
  @Patch('update/:type/:publicId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  async updateDescription(
    @Req() req,
    @Param('type') type: 'image' | 'video' | 'view360',
    @Param('publicId') publicId: string,
    @Body() body: { description?: string; category?: string },
  ) {
    publicId = decodeURIComponent(publicId);
    return this.mediaService.updateDescription(
      type,
      publicId,
      body.description,
      body.category,
    );
  }

  @ApiRoles(['admin', 'media_editor'], '刪除媒體', '刪除指定媒體檔案')
  @Delete(':type/:publicId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  async delete(
    @Req() req,
    @Param('type') type: 'image' | 'video' | 'view360',
    @Param('publicId') publicId: string,
  ) {
    publicId = decodeURIComponent(publicId);
    this.logger.debug('Delete called', { type, publicId });

    // 驗證參數
    if (!type || !['image', 'video', 'view360'].includes(type)) {
      throw new BadRequestException(`無效的媒體類型: ${type}`);
    }

    if (!publicId) {
      throw new BadRequestException('publicId 不能為空');
    }

    // 檢查 publicId 是否已經包含完整路徑
    let finalPublicId = publicId;
    if (!publicId.startsWith('zur_')) {
      // 如果 publicId 不包含完整路徑，則構建完整路徑
      finalPublicId = `${type === 'image' ? 'zur_images' : type === 'video' ? 'zur_videos' : 'zur_view360'}/${publicId}`;
    }

    this.logger.debug('Final publicId', { finalPublicId });

    return this.mediaService.deleteMedia(type, finalPublicId);
  }

  @Patch(':type/:id/rename')
  @UseGuards(JwtAuthGuard)
  async renameMedia(
    @Param('type') type: 'image' | 'video' | 'view360',
    @Param('id') id: string,
    @Body() dto: RenameMediaDto,
  ) {
    return this.mediaService.renameMedia(type, id, dto.newName);
  }

  // 批次操作端點
  @Post('batch/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  async batchDelete(@Body() dto: BatchDeleteDto) {
    this.logger.debug('BatchDelete called', { itemsCount: dto.items.length });
    return this.mediaService.batchDelete(dto.items);
  }

  @Post('batch/update-category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  async batchUpdateCategory(@Body() dto: BatchUpdateCategoryDto) {
    this.logger.debug('BatchUpdateCategory called', {
      itemsCount: dto.items.length,
      category: dto.category,
    });
    return this.mediaService.batchUpdateCategory(dto.items, dto.category);
  }

  @Post('batch/update-description')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  async batchUpdateDescription(@Body() dto: BatchUpdateDescriptionDto) {
    this.logger.debug('BatchUpdateDescription called', {
      itemsCount: dto.items.length,
      description: dto.description,
    });
    return this.mediaService.batchUpdateDescription(dto.items, dto.description);
  }

  @Post('batch/move-to-folder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  async batchMoveToFolder(@Body() dto: BatchMoveToFolderDto) {
    this.logger.debug('BatchMoveToFolder called', {
      itemsCount: dto.items.length,
      folder: dto.folder,
    });
    return this.mediaService.batchMoveToFolder(dto.items, dto.folder);
  }

  @Post('batch/tag')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  async batchTag(@Body() dto: BatchTagDto) {
    this.logger.debug('BatchTag called', {
      itemsCount: dto.items.length,
      tags: dto.tags,
    });
    return this.mediaService.batchTag(dto.items, dto.tags);
  }



  // 通配符路由必須放在最後，避免攔截其他路由
  @Get('*publicId')
  async findOne(@Param('publicId') publicId: string) {
    const item = await this.mediaService.findOne(publicId);
    if (!item) {
      throw new NotFoundException(`找不到媒體 ${publicId}`);
    }
    return item;
  }
}
