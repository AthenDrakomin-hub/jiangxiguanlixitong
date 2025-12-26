// api/users.ts
// 用户管理 API（Edge Runtime）

import { DatabaseManager } from '../lib/database.js';
import { User } from '../types.js';

export const config = {
  runtime: 'edge',
};

// CORS 头设置
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://www.jiangxijiudian.store',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 处理预检请求
function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// 获取用户列表
async function getUsers() {
  try {
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isInitialized()) {
      // 初始化数据库连接
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }
    
    const db = dbManager.getDatabase();
    const users = await db.getAll<User>('users:');
    
    return new Response(
      JSON.stringify({
        success: true,
        data: users,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '获取用户列表失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 根据ID获取单个用户
async function getUserById(id: string) {
  try {
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }
    
    const db = dbManager.getDatabase();
    const user = await db.get<User>(`users:${id}`);
    
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '用户不存在',
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: user,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('获取用户失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '获取用户失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 创建新用户
async function createUser(userData: any) {
  try {
    // 验证必需字段
    if (!userData.username || !userData.password || !userData.role) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '缺少必需字段：username, password, role',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // 验证密码长度
    if (userData.password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '密码长度至少为6位',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }
    
    const db = dbManager.getDatabase();
    
    // 检查用户名是否已存在
    const existingUsers = await db.getAll<User>('users:');
    const existingUser = existingUsers.find(u => u.username === userData.username);
    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '用户名已存在',
        }),
        {
          status: 409,
          headers: corsHeaders,
        }
      );
    }
    
    // 加密密码（在实际应用中应该使用更安全的加密方式）
    // 这里为了简化，我们直接存储密码的简单哈希
    const hashedPassword = await hashPassword(userData.password);
    
    // 根据角色设置默认语言
    const defaultLanguage = userData.role === 'admin' || userData.role === 'manager' ? 'zh' : 'tl';
    const userLanguage = userData.language || defaultLanguage;
    
    // 创建用户对象
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      username: userData.username,
      password: hashedPassword, // 实际应用中应使用更安全的密码哈希
      role: userData.role,
      language: userLanguage,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // 保存到数据库
    await db.create('users', {
      ...newUser,
      password: hashedPassword // 不将密码返回给客户端
    });
    
    // 返回不包含密码的用户信息
    const { password, ...userWithoutPassword } = newUser;
    
    return new Response(
      JSON.stringify({
        success: true,
        data: userWithoutPassword,
        message: '用户创建成功',
      }),
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('创建用户失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '创建用户失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 更新用户
async function updateUser(id: string, userData: any) {
  try {
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }
    
    const db = dbManager.getDatabase();
    const existingUser = await db.get<User>(`users:${id}`);
    
    if (!existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '用户不存在',
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    // 准备更新数据
    const updateData: Partial<User> = {
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    
    // 如果提供了新密码，需要哈希处理
    if (userData.password) {
      if (userData.password.length < 6) {
        return new Response(
          JSON.stringify({
            success: false,
            message: '密码长度至少为6位',
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
      updateData.password = await hashPassword(userData.password);
    }
    
    // 如果没有提供语言设置，根据角色设置默认语言
    if (!updateData.language) {
      const defaultLanguage = userData.role === 'admin' || userData.role === 'manager' ? 'zh' : 'tl';
      updateData.language = defaultLanguage;
    }
    
    // 移除不允许更新的字段
    delete (updateData as any).id;
    delete (updateData as any).createdAt;
    
    // 执行更新
    const updatedUser = await db.update('users', id, updateData as Partial<User>);
    
    if (!updatedUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '更新用户失败',
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    
    // 返回不包含密码的用户信息
    const { password, ...userWithoutPassword } = updatedUser;
    
    return new Response(
      JSON.stringify({
        success: true,
        data: userWithoutPassword,
        message: '用户更新成功',
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('更新用户失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '更新用户失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 删除用户
async function deleteUser(id: string) {
  try {
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }
    
    const db = dbManager.getDatabase();
    const existingUser = await db.get<User>(`users:${id}`);
    
    if (!existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '用户不存在',
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    // 防止删除管理员账户
    if (existingUser.username === 'admin') {
      return new Response(
        JSON.stringify({
          success: false,
          message: '无法删除管理员账户',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    const success = await db.remove('users', id);
    
    if (success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: '用户删除成功',
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: '用户删除失败',
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  } catch (error) {
    console.error('删除用户失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '删除用户失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 简单的密码哈希函数（实际应用中应使用 bcrypt 等更安全的方式）
async function hashPassword(password: string): Promise<string> {
  // 这里使用一个简单的哈希方法，实际应用中应使用 bcrypt 或其他安全的哈希算法
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default async function handler(req: Request) {
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const userId = pathParts[pathParts.length - 1]; // 获取路径中的用户ID（如果存在）
    
    // 对于敏感操作（POST, PUT, DELETE）添加认证保护
    if (req.method !== 'GET') {
      const authHeader = req.headers.get('Authorization');
      const adminUser = process.env.VITE_ADMIN_USER || 'admin';
      const adminPass = process.env.VITE_ADMIN_PASS || 'admin123';
      
      // 验证Bearer认证头
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({
            success: false,
            message: '认证失败：缺少 Bearer Token',
          }),
          {
            status: 401,
            headers: corsHeaders,
          }
        );
      }
      
      const providedKey = authHeader.substring(7); // 移除 "Bearer " 前缀
      const adminKey = `${adminUser}:${adminPass}`; // 创建认证密钥
      
      if (providedKey !== adminKey) {
        return new Response(
          JSON.stringify({
            success: false,
            message: '认证失败：密钥不匹配',
          }),
          {
            status: 401,
            headers: corsHeaders,
          }
        );
      }
    }
    
    // 检查是否是获取特定用户信息的请求
    const isSpecificUser = req.method === 'GET' && userId && (/^[0-9]+$/.test(userId) || /^[a-zA-Z0-9]+$/.test(userId));
    
    switch (req.method) {
      case 'GET':
        if (isSpecificUser) {
          return await getUserById(userId);
        } else {
          return await getUsers();
        }
      case 'POST':
        const createData = await req.json();
        return await createUser(createData);
      case 'PUT':
        if (!userId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: '缺少用户ID',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        const updateData = await req.json();
        return await updateUser(userId, updateData);
      case 'DELETE':
        if (!userId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: '缺少用户ID',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        return await deleteUser(userId);
      default:
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
  } catch (error) {
    console.error('处理请求失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '内部服务器错误',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}