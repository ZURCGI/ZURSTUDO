// src/users/users.service.ts
import { Injectable, OnModuleInit, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // 啟動時檢查並建立預設管理員
  async onModuleInit() {
    const exist = await this.usersRepo.findOne({
      where: { username: 'admin' },
    });
    if (!exist) {
      try {
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      const pwHash = await bcrypt.hash(defaultPassword, 10); // 從環境變數讀取預設密碼
      const admin = this.usersRepo.create({
        username: 'admin',
        passwordHash: pwHash,
        isAdmin: true,
        role: UserRole.ADMIN,
      });
        await this.usersRepo.save(admin);
        this.logger.log(
          '✅ 已自動建立預設管理員：username=admin / password=admin123 (請立即更改密碼)',
        );
      } catch (e) {
        // 若已存在或其他，忽略
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        this.logger.warn('⚠️ 建立預設管理員時發生錯誤:', errorMessage);
      }
    } else {
      this.logger.log('ℹ️ 預設管理員帳號已存在');
    }
  }

  // 根據 username 查使用者
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { username } });
  }

  // 根據 ID 查使用者
  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  // 依 userId 變更密碼
  async changePassword(userId: string, newPassword: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new ConflictException('使用者不存在');
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.passwordHash = hashedPassword;
    return this.usersRepo.save(user);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      throw new ConflictException(`密碼加密失敗: ${errorMessage}`);
    }
  }

  // 創建媒體編輯者帳號
  async createMediaEditor(createUserDto: CreateUserDto) {
    const { username, password, email } = createUserDto;
    
    // 檢查用戶名是否已存在
    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('用戶名已存在');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const mediaEditor = this.usersRepo.create({
        username,
        passwordHash: hashedPassword,
        email,
        isAdmin: false,
        role: UserRole.EDITOR, // 暫時使用 EDITOR 角色，直到資料庫遷移完成
      });
      
      const savedUser = await this.usersRepo.save(mediaEditor);
      this.logger.log(`✅ 已建立媒體編輯者帳號：${username}`);
      
      // 返回用戶資訊（不包含密碼）
      const { passwordHash, ...userInfo } = savedUser;
      return {
        message: '媒體編輯者帳號建立成功',
        user: userInfo,
      };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      throw new ConflictException(`建立媒體編輯者帳號失敗: ${errorMessage}`);
    }
  }

  // 創建管理員帳號
  async createAdmin(createUserDto: CreateUserDto) {
    const { username, password, email } = createUserDto;
    
    // 檢查用戶名是否已存在
    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('用戶名已存在');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = this.usersRepo.create({
        username,
        passwordHash: hashedPassword,
        email,
        isAdmin: true,
        role: UserRole.ADMIN,
      });
      
      const savedUser = await this.usersRepo.save(admin);
      this.logger.log(`✅ 已建立管理員帳號：${username}`);
      
      // 返回用戶資訊（不包含密碼）
      const { passwordHash, ...userInfo } = savedUser;
      return {
        message: '管理員帳號建立成功',
        user: userInfo,
      };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      throw new ConflictException(`建立管理員帳號失敗: ${errorMessage}`);
    }
  }
}
