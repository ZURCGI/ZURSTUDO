#!/usr/bin/env node

/**
 * JWT 配置驗證腳本
 * 執行: node scripts/validate-jwt-config.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔒 JWT 配置安全性檢查...\n');

// 讀取 .env 文件
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env 文件不存在');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);

if (!jwtSecretMatch) {
  console.log('❌ 找不到 JWT_SECRET 環境變數');
  process.exit(1);
}

const jwtSecret = jwtSecretMatch[1].trim();

// 檢查 JWT Secret 長度
console.log('📏 JWT Secret 長度檢查:');
console.log(`   當前長度: ${jwtSecret.length} 字符`);
if (jwtSecret.length >= 64) {
  console.log('   ✅ 長度符合安全要求 (≥64字符)');
} else if (jwtSecret.length >= 32) {
  console.log('   ⚠️  長度基本符合要求 (≥32字符)');
} else {
  console.log('   ❌ 長度不足，建議至少 32 字符');
}

// 檢查是否為默認值
console.log('\n🔍 默認值檢查:');
if (jwtSecret.includes('zur_studio_secure_jwt_secret')) {
  console.log('   ❌ 檢測到默認 JWT_SECRET');
  console.log('   💡 建議生成新的強密鑰');
} else {
  console.log('   ✅ 不是默認值');
}

// 檢查熵值（隨機性）
console.log('\n🎲 隨機性檢查:');
const entropy = calculateEntropy(jwtSecret);
console.log(`   熵值: ${entropy.toFixed(2)} bits`);
if (entropy > 4.0) {
  console.log('   ✅ 隨機性良好');
} else {
  console.log('   ⚠️  隨機性較低，建議使用更隨機的密鑰');
}

// 生成建議的新密鑰
console.log('\n🔧 建議的新 JWT_SECRET:');
const newSecret = crypto.randomBytes(64).toString('hex');
console.log(`   ${newSecret}`);

console.log('\n📝 使用方法:');
console.log('   1. 將上面的新密鑰複製到 .env 文件');
console.log('   2. 重新啟動應用程序');
console.log('   3. 所有現有用戶需要重新登入');

function calculateEntropy(str) {
  const charCount = {};
  for (const char of str) {
    charCount[char] = (charCount[char] || 0) + 1;
  }
  
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(charCount)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
} 