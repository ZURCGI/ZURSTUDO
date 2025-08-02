import { DataSource } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';

// 確保能讀取到 .env 檔案
config();

// 從環境變數中獲取資料庫 URL
const databaseUrl = process.env.DATABASE_URL;

// 如果 DATABASE_URL 未設定，則拋出錯誤，防止應用程式在配置不完整的情況下啟動
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// ==================================================================
// 核心邏輯：判斷是否正在連線到 Render 的資料庫
// ==================================================================
const isConnectingToRender = databaseUrl.includes('render.com') || databaseUrl.includes('onrender.com');

console.log(`Database URL detected: ${databaseUrl}`);
console.log(`Is connecting to Render.com database? -> ${isConnectingToRender}`);

export default new DataSource({
  type: 'postgres',

  // 使用環境變數中的 DATABASE_URL
  url: databaseUrl,

  // 實體和遷移的路徑 (維持不變)
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],

  // ==================================================================
  // 最終的 SSL 設定：
  // 只要目標是 Render，就啟用 SSL；否則，禁用。
  // ==================================================================
  ssl: isConnectingToRender
    ? {
        // 連線到 Render 時，啟用 SSL 並信任其憑證
        rejectUnauthorized: false
      }
    : false, // 連線到本地或其他非 Render 資料庫時，禁用 SSL
});
