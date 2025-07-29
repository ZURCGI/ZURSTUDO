// src/upload/cloudinary.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  BadRequestException,
  UseGuards,
  Logger,
  Query,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';
import { MediaService } from '../media/media.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { IsIn, IsOptional, IsString } from 'class-validator';

class SignatureDto {
  @IsString()
  @IsIn(['zur_images', 'zur_videos', 'zur_view360'])
  folder: string = 'zur_images';

  @IsOptional()
  @IsString()
  @IsIn(['image', 'video', 'auto'])
  resource_type?: string = 'auto';

  @IsOptional()
  @IsString()
  public_id?: string;

  @IsOptional()
  file_size?: number; // 檔案大小（bytes）
}

class UploadCallbackDto {
  @IsString()
  public_id: string;

  @IsString()
  secure_url: string;

  @IsOptional()
  @IsString()
  resource_type?: string;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  project?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsString()
  alt?: string;
}

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class CloudinaryController {
  private readonly logger = new Logger(CloudinaryController.name);

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => MediaService))
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 取得 Cloudinary 簽名用於直接上傳
   * 前端使用此簽名直接上傳到 Cloudinary，避免後端中轉
   */
  @Post('signature')
  getCloudinarySignature(@Body() body: SignatureDto) {
    this.logger.log(
      `getCloudinarySignature called, folder: ${body.folder}, resource_type: ${body.resource_type}`,
    );
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const folder = body.folder || 'zur_images';
      const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
      const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
      const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
      if (!apiSecret || !apiKey || !cloudName) {
        throw new BadRequestException('Cloudinary 配置不完整');
      }
      // 只簽名 folder 和 timestamp
      const signatureString = `folder=${folder}&timestamp=${timestamp}`;
      const signature = crypto
        .createHash('sha1')
        .update(signatureString + apiSecret)
        .digest('hex');
      this.logger.log(`Signature generated for params: ${signatureString}`);
      return {
        success: true,
        signature,
        timestamp,
        api_key: apiKey,
        cloud_name: cloudName,
        folder,
        upload_url: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Signature generation failed: ${errorMessage}`);
      throw new BadRequestException(`簽名生成失敗: ${errorMessage}`);
    }
  }

  /**
   * 處理直接上傳完成後的回調
   * 當前端直接上傳到 Cloudinary 完成後，會呼叫此端點來儲存資料庫記錄
   */
  @Post('callback')
  async handleUploadCallback(@Body() body: UploadCallbackDto) {
    this.logger.log(
      `[CloudinaryController] /upload/callback received body: ${JSON.stringify(body)}`,
    );
    try {
      // 驗證上傳結果
      if (!body.public_id || !body.secure_url) {
        throw new BadRequestException('缺少必要的上傳資訊');
      }

      // 根據 resource_type 和 folder 決定儲存到哪個資料表
      const resourceType = body.resource_type;
      let mediaType: 'image' | 'video' | 'view360';

      if (resourceType === 'video') {
        mediaType = 'video';
      } else if (body.folder === 'zur_view360') {
        mediaType = 'view360';
      } else {
        mediaType = 'image';
      }

      // 建立模擬的 file 物件，符合現有的 MediaService 介面
      const fileData = {
        path: body.secure_url,
        url: body.secure_url,
        filename: body.public_id,
        public_id: body.public_id,
      };

      const dto = {
        description: body.description || '',
        category: body.category || '',
        project: body.project || '',
        seoTitle: body.seoTitle || '',
        seoDescription: body.seoDescription || '',
        seoKeywords: body.seoKeywords || '',
        ogImage: body.ogImage || '',
        alt: body.alt || '',
      };

      this.logger.log(
        `[CloudinaryController] saving to DB, mediaType: ${mediaType}, fileData: ${JSON.stringify(fileData)}, dto: ${JSON.stringify(dto)}`,
      );
      let savedMedia;
      if (mediaType === 'image') {
        savedMedia = await this.mediaService.saveImageToDb(fileData, dto);
      } else if (mediaType === 'video') {
        savedMedia = await this.mediaService.saveVideoToDb(fileData, dto);
      } else {
        savedMedia = await this.mediaService.saveView360ToDb(fileData, dto);
      }
      this.logger.log(
        `[CloudinaryController] Media saved to database: ${savedMedia.id}`,
      );

      return {
        success: true,
        media: savedMedia,
        message: '上傳完成並已儲存到資料庫',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `[CloudinaryController] Upload callback processing failed: ${errorMessage}`,
      );
      throw new BadRequestException(`處理上傳回調失敗: ${errorMessage}`);
    }
  }

  /**
   * 測試簽名端點（用於開發測試）
   */
  @Get('test-signature')
  testSignature(@Query('folder') folder: string = 'zur_images') {
    this.logger.log(`Test signature requested for folder: ${folder}`);

    const timestamp = Math.floor(Date.now() / 1000);
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');

    const signatureString = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash('sha1')
      .update(signatureString + apiSecret)
      .digest('hex');

    return {
      success: true,
      signature,
      timestamp,
      api_key: apiKey,
      cloud_name: cloudName,
      folder,
      signature_string: signatureString,
    };
  }
}
