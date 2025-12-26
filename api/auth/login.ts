// api/auth/login.ts
// 登录认证 API（Edge Runtime）

import { dbManager } from '../../lib/database.js';
import { User } from '../../types.js';
import { monitoringService } from '../../services/monitoring.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const startTime = Date.now();
  // CORS 头设置
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://www.jiangxijiudian.store',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    const duration = Date.now() - startTime;
    monitoringService.recordApiPerformance(`OPTIONS /api/auth/login`, duration, 200);
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    const duration = Date.now() - startTime;
    monitoringService.recordApiPerformance(`${req.method} /api/auth/login (method not allowed)`, duration, 405);
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
      const duration = Date.now() - startTime;
      monitoringService.recordApiPerformance('POST /api/auth/login (validation failed)', duration, 400);
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
      const duration = Date.now() - startTime;
      monitoringService.recordApiPerformance('POST /api/auth/login (user not found)', duration, 401);
      monitoringService.warn('Failed login attempt', {
        username,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      });
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
    // 使用Web标准的SubtleCrypto API进行SHA-256哈希
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const passwordHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (user.password !== passwordHash && user.password !== password) {
      const duration = Date.now() - startTime;
      monitoringService.recordApiPerformance('POST /api/auth/login (invalid password)', duration, 401);
      monitoringService.warn('Failed login attempt with wrong password', {
        username: user.username,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      });
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
    const duration = Date.now() - startTime;
    monitoringService.recordApiPerformance('POST /api/auth/login', duration, 200);
    monitoringService.info('Successful login', {
      username: user.username,
      role: user.role,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    });
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
    const duration = Date.now() - startTime;
    monitoringService.error('Login error', error, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      duration
    });
    monitoringService.recordApiPerformance('POST /api/auth/login (error)', duration, 500);
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