// scripts/compress-frontend-assets.js
// 示例：后端安全地压缩前端资源（如客房点餐页面的JS文件）

import { safeSpawn, safeExecWithShell } from '../lib/safe-exec.js';
import fs from 'fs';
import path from 'path';

/**
 * 安全地压缩单个客房点餐页面的JS文件
 * @param {string} location - 客房号（如'8201'）
 */
export async function compressOrderJS(location) {
  // 1. 验证客房号格式（安全最佳实践）
  const validLocation = validateLocationFormat(location);
  if (!validLocation) {
    throw new Error(`无效的客房号: ${location}`);
  }

  // 2. 检查文件是否存在
  const inputFile = path.join('dist', `order-${validLocation}.js`);
  if (!fs.existsSync(inputFile)) {
    throw new Error(`文件不存在: ${inputFile}`);
  }

  const outputFile = path.join('dist', `order-${validLocation}.min.js`);

  // 3. 使用安全的spawn方法（方案1：移除shell:true）
  console.log(`正在压缩客房${validLocation}的JS文件...`);
  
  try {
    const child = safeSpawn('terser', [
      inputFile,
      '--compress',
      '--mangle',
      '--output',
      outputFile
    ]);

    return new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ 客房${validLocation}的JS压缩完成: ${outputFile}`);
          resolve(outputFile);
        } else {
          reject(new Error(`JS压缩失败，退出码: ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`执行压缩命令时出错: ${error.message}`));
      });
    });
  } catch (error) {
    console.error(`❌ 压缩客房${validLocation}的JS文件时出错:`, error.message);
    throw error;
  }
}

/**
 * 安全地批量压缩所有客房点餐页面的JS文件（需要通配符，使用shell）
 * @param {string} pattern - 文件匹配模式（如'order-*.js'）
 */
export async function compressAllOrderJS(pattern = 'order-*.js') {
  // 1. 验证模式安全性（简单白名单检查）
  if (!/^order-\*\.js$/.test(pattern)) {
    throw new Error(`不支持的文件模式: ${pattern}`);
  }

  const inputPattern = path.join('dist', pattern);
  const outputFile = path.join('dist', 'order-all.min.js');

  console.log(`正在批量压缩所有客房JS文件...`);
  
  try {
    // 2. 使用安全的exec方法（方案2：必须用shell时转义参数）
    const child = safeExecWithShell('terser', [
      inputPattern,
      '--compress',
      '--mangle',
      '--output',
      outputFile
    ]);

    return new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ 所有客房JS文件压缩完成: ${outputFile}`);
          resolve(outputFile);
        } else {
          reject(new Error(`批量JS压缩失败，退出码: ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`执行批量压缩命令时出错: ${error.message}`));
      });
    });
  } catch (error) {
    console.error(`❌ 批量压缩JS文件时出错:`, error.message);
    throw error;
  }
}

/**
 * 验证客房号格式（安全最佳实践）
 * @param {string} location - 客房号
 * @returns {string|null} - 验证后的客房号或null
 */
function validateLocationFormat(location) {
  // 仅允许4位数字的客房号（如8201, 8301等）
  if (!location || typeof location !== 'string') {
    return null;
  }

  if (/^\d{4}$/.test(location)) {
    const roomNumber = parseInt(location, 10);
    // 有效的客房号范围：
    // - 2楼: 8201-8232
    // - 3楼: 8301-8332
    if ((roomNumber >= 8201 && roomNumber <= 8232) || 
        (roomNumber >= 8301 && roomNumber <= 8332)) {
      return location;
    }
  }

  return null;
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法:');
    console.log('  node compress-frontend-assets.js <客房号>     # 压缩单个客房JS');
    console.log('  node compress-frontend-assets.js --all       # 批量压缩所有客房JS');
    process.exit(0);
  }

  if (args[0] === '--all') {
    compressAllOrderJS()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('批量压缩失败:', error.message);
        process.exit(1);
      });
  } else {
    const location = args[0];
    compressOrderJS(location)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(`压缩客房${location}的JS文件失败:`, error.message);
        process.exit(1);
      });
  }
}