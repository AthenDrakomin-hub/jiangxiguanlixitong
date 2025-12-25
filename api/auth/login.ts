// api/auth/login.ts
// 登录认证 API（Edge Runtime）

import { dbManager } from '../../lib/database.js';
import { User } from '../../types.js';
import { createHash } from 'crypto';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // CORS 头设置
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }

  try {
    // 检查数据库连接状态
    if (!dbManager.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '用户名和密码不能为空',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // 从数据库获取用户
    const db = dbManager.getDatabase();
    const allUsers = await db.getAll<User>('users');
    
    // 查找匹配的用户
    const user = allUsers.find((u: User) => u.username === username && u.isActive);
    
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '用户名或密码错误',
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // 验证密码（使用简单的哈希比较，生产环境应使用更安全的密码哈希算法）
    const passwordHash = createHash('sha256').update(password).digest('hex');
    if (user.password !== passwordHash && user.password !== password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '用户名或密码错误',
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // 登录成功，返回用户信息
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login successful',
        user: {
          username: user.username,
          role: user.role || 'staff',
          language: user.language || (user.role === 'admin' || user.role === 'manager' ? 'zh' : 'tl'),
        },
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}