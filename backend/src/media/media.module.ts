// src/media/media.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { Image } from './entities/image.entity';
import { Video } from './entities/video.entity';
import { View360 } from './entities/view360.entity';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { CloudinaryModule } from '../upload/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Image,
      Video,
      View360,
      Project,
    ]),
    forwardRef(() => CloudinaryModule),
  ],
  providers: [MediaService, ProjectService],
  controllers: [MediaController, ProjectController],
  exports: [MediaService],
})
export class MediaModule {}
