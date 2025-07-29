#!/usr/bin/env node

/**
 * 部屬前安全檢查腳本
 * 執行: node pre-deploy-security.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 開始部屬前安全檢查...\n');

// 1. 檢查環境變數
console.log('📋 1. 檢查環境變數...');
const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NODE_ENV'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.log('❌ 缺少必要的環境變數:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('\n請設定這些環境變數後再部屬！');
  process.exit(1);
} else {
  console.log('✅ 所有必要環境變數已設定');
}

// 2. 檢查 JWT Secret 強度
console.log('\n📋 2. 檢查 JWT Secret 強度...');
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret && jwtSecret.length < 32) {
  console.log('⚠️  警告: JWT_SECRET 長度不足32字元，建議使用更強的密鑰');
} else {
  console.log('✅ JWT Secret 強度符合要求');
}

// 3. 檢查 NODE_ENV
console.log('\n📋 3. 檢查環境設定...');
if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️  警告: NODE_ENV 不是 production，建議在生產環境設定為 production');
} else {
  console.log('✅ NODE_ENV 設定正確');
}

// 4. 檢查檔案安全性
console.log('\n📋 4. 檢查檔案安全性...');

// 檢查 .env 是否在 .gitignore 中
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env')) {
    console.log('✅ .env 檔案在 .gitignore 中');
  } else {
    console.log('❌ .env 檔案不在 .gitignore 中，請添加！');
  }
} else {
  console.log('❌ 找不到 .gitignore 檔案');
}

// 檢查是否有明文金鑰
const setEnvPath = path.join(__dirname, 'set-env.ps1');
if (fs.existsSync(setEnvPath)) {
  const setEnvContent = fs.readFileSync(setEnvPath, 'utf8');
  if (setEnvContent.includes('your_api_key_here') || setEnvContent.includes('your_api_secret_here')) {
    console.log('⚠️  警告: set-env.ps1 中可能還有明文金鑰，請檢查！');
  } else {
    console.log('✅ set-env.ps1 中沒有明文金鑰');
  }
}

// 5. 檢查 console.log
console.log('\n📋 5. 檢查 console.log 清理...');
const srcPath = path.join(__dirname, 'src');
const consoleLogCount = countConsoleLogs(srcPath);
if (consoleLogCount > 0) {
  console.log(`⚠️  發現 ${consoleLogCount} 個 console.log，建議在生產環境移除`);
} else {
  console.log('✅ 沒有發現 console.log');
}

// 6. 生成安全建議
console.log('\n📋 6. 安全建議...');
console.log('✅ 建議在部屬前執行以下操作:');
console.log('   1. 設定強密碼策略');
console.log('   2. 啟用 HTTPS');
console.log('   3. 設定資料庫備份');
console.log('   4. 監控錯誤日誌');
console.log('   5. 定期安全掃描');

console.log('\n🎉 安全檢查完成！');
console.log('如果沒有錯誤，可以安全部屬。');

// 輔助函數
function countConsoleLogs(dirPath) {
  let count = 0;
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = content.match(/console\.log/g);
        if (matches) {
          count += matches.length;
        }
      }
    });
  }
  
  scanDirectory(dirPath);
  return count;
} 