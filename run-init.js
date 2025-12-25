// 运行数据库初始化脚本
import { initializeDatabase } from './init-neon-db-simple.ts';

// 设置环境变量
process.env.NEON_CONNECTION_STRING = "postgresql://neondb_owner:npg_X1qLoyl5RaQP@ep-tiny-boat-a11ned2e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function run() {
  try {
    await initializeDatabase();
    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('初始化失败:', error);
  }
}

run();