/**
 * Neon 数据库迁移脚本
 * 用于在 Neon 数据库中创建必要的表结构
 */

import { neon } from '@neondatabase/serverless';

// 从环境变量获取连接字符串
const connectionString = process.env.NEON_CONNECTION_STRING;

if (!connectionString) {
  console.error('错误: 未设置 NEON_CONNECTION_STRING 环境变量');
  process.exit(1);
}

async function runMigration() {
  const sql = neon(connectionString!);

  try {
    console.log('开始数据库迁移...');

    // 创建 kv_store 表用于存储键值对数据
    await sql`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // 创建索引以提高查询性能
    await sql`
      CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store(key);
    `;

    // 创建更新时间触发器函数
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // 为 kv_store 表创建更新时间触发器
    await sql`
      DROP TRIGGER IF EXISTS update_kv_store_updated_at ON kv_store;
    `;

    await sql`
      CREATE TRIGGER update_kv_store_updated_at 
        BEFORE UPDATE ON kv_store 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `;

    console.log('数据库迁移完成！');
    console.log('已创建 kv_store 表和相关索引');
  } catch (error) {
    console.error('数据库迁移失败:', error);
    throw error;
  } finally {
    // 在实际应用中，连接池通常由应用生命周期管理
    // 这里为了演示目的，实际部署时可能不需要手动关闭
  }
}

async function main() {
  try {
    await runMigration();
  } catch (error) {
    console.error('迁移过程中发生错误:', error);
    process.exit(1);
  }
}

// 检查是否直接运行此模块
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runMigration };