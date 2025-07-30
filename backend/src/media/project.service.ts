import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Image } from './entities/image.entity';
import { Video } from './entities/video.entity';
import { View360 } from './entities/view360.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Image)
    private readonly imgRepo: Repository<Image>,
    @InjectRepository(Video)
    private readonly vidRepo: Repository<Video>,
    @InjectRepository(View360)
    private readonly v360Repo: Repository<View360>,
  ) {}

  async findAll(): Promise<Project[]> {
    try {
      return await this.projectRepo.find({ order: { name: 'ASC' } });
    } catch (e) {
      console.error('[ProjectService] findAll error:', e);
      throw e;
    }
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('找不到此專案');
    }
    return project;
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    const exists = await this.projectRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('案名已存在');
    const project = this.projectRepo.create(dto);
    return this.projectRepo.save(project);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    
    // Check if name is being updated and if it conflicts with existing project
    if (dto.name && dto.name !== project.name) {
      const exists = await this.projectRepo.findOne({ where: { name: dto.name } });
      if (exists) throw new ConflictException('案名已存在');
    }
    
    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async deleteProject(name: string): Promise<{ success: boolean; message: string }> {
    console.log(`[ProjectService] 開始刪除專案: ${name}`);
    
    // 檢查是否有媒體使用此案名
    const hasImage = await this.imgRepo.count({ where: { project: name } });
    const hasVideo = await this.vidRepo.count({ where: { project: name } });
    const hasView360 = await this.v360Repo.count({ where: { project: name } });
    
    console.log(`[ProjectService] 檢查結果 - 圖片: ${hasImage}, 影片: ${hasVideo}, 360°: ${hasView360}`);
    
    if (hasImage || hasVideo || hasView360) {
      console.log(`[ProjectService] 刪除失敗 - 專案 ${name} 仍有相關媒體`);
      throw new BadRequestException('請先刪除所有相關媒體');
    }
    
    const result = await this.projectRepo.delete({ name });
    if (result.affected === 0) {
      console.log(`[ProjectService] 刪除失敗 - 找不到專案: ${name}`);
      throw new NotFoundException('找不到此案名');
    }
    
    console.log(`[ProjectService] 專案刪除成功: ${name}`);
    return { success: true, message: '案名已刪除' };
  }
} 