// src/media/entities/image.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Index()
  @Column()
  publicId: string;

  @Column({ default: '' })
  description: string;

  @Index()
  @Column({ default: '' })
  category: string;

  @Column({ default: '' })
  project: string;

  @Column({ default: '' })
  seoTitle: string;

  @Column({ default: '' })
  seoDescription: string;

  @Column({ default: '' })
  seoKeywords: string;

  @Column({ default: '' })
  ogImage: string;

  @Column({ default: '' })
  alt: string;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
