import { DataSource } from 'typeorm';
import { join } from 'path';

const isDevelopment = process.env.NODE_ENV === 'development';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  ssl: false, // 強制禁用 SSL 以解決連接問題
});
