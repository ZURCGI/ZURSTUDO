import cloudinary from 'cloudinary';
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { CloudinaryService } from './cloudinary.service';

@Controller('archive')
export class ArchiveController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get(':folder/:publicId')
  serve(
    @Param('folder') folder: string,
    @Param('publicId') publicId: string,
    @Res() res: Response,
  ) {
    // 取得 URL 並重定向
    const url = cloudinary.url(`${folder}/${publicId}`, { secure: true });
    return res.redirect(url);
  }
}
