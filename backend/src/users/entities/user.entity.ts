// src/users/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  EDITOR = 'editor',
  MEDIA_EDITOR = 'media_editor', // 專門用於媒體編輯的角色
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum', // 明確指定資料庫中的枚舉名稱
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
