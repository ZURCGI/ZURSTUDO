import { Controller, Get, Post, Put, Body, UseGuards, Res, HttpStatus, NotFoundException, BadRequestException, Delete, Param, ParseIntPipe, ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: '取得所有專案' })
  @ApiResponse({ status: 200, description: '成功取得專案列表', type: [Project] })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  async findAll(@Res() res: Response) {
    try {
      const projects = await this.projectService.findAll();
      return res.status(HttpStatus.OK).json(projects);
    } catch (e) {
      console.error('[ProjectController] findAll error:', e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch projects' });
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: '取得單一專案' })
  @ApiResponse({ status: 200, description: '成功取得專案', type: Project })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '找不到專案' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    try {
      const project = await this.projectService.findOne(id);
      return res.status(HttpStatus.OK).json(project);
    } catch (e) {
      if (e instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: e.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch project' });
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: '建立新專案' })
  @ApiResponse({ status: 201, description: '成功建立專案', type: Project })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 409, description: '案名已存在' })
  async create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.projectService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'media_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新專案' })
  @ApiResponse({ status: 200, description: '成功更新專案', type: Project })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '找不到專案' })
  @ApiResponse({ status: 409, description: '案名已存在' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto, @Res() res: Response) {
    try {
      const project = await this.projectService.update(id, dto);
      return res.status(HttpStatus.OK).json(project);
    } catch (e) {
      if (e instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: e.message });
      }
      if (e instanceof ConflictException) {
        return res.status(HttpStatus.CONFLICT).json({ message: e.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update project' });
    }
  }

  @Delete(':name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '刪除專案' })
  @ApiResponse({ status: 200, description: '成功刪除專案' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 400, description: '請先刪除所有相關媒體' })
  @ApiResponse({ status: 404, description: '找不到此案名' })
  async delete(@Param('name') name: string, @Res() res: Response) {
    try {
      const result = await this.projectService.deleteProject(name);
      return res.status(HttpStatus.OK).json(result);
    } catch (e) {
      if (e instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
      }
      if (e instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: e.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '刪除失敗' });
    }
  }
} 