// src/media/entities/view360.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('view360s')
export class View360 {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column()
  publicId: string;

  @Column({ default: '' })
  description: string;

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

  @Column({ type: 'json', nullable: true })
  faq: { question: string; answer: string }[];

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ default: '' })
  address: string;

  @Column({ default: '' })
  city: string;

  @Column({ default: '' })
  zipcode: string;

  @CreateDateColumn()
  createdAt: Date;
}
