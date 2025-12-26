// api/permissions.ts
// 权限管理 API（Edge Runtime）

import { dbManager } from '../lib/database.js';
import { Permission } from '../types.js';

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

// 获取权限列表
async function getPermissions() {
  try {
    const dbManagerInstance = dbManager;
    if (!dbManagerInstance.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManagerInstance.initialize({ type: dbType as any });
    }
    
    const db = dbManagerInstance.getDatabase();
    const permissions = await db.getAll<Permission>('permissions:');
    
    return new Response(
      JSON.stringify({
        success: true,
        data: permissions,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('获取权限列表失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '获取权限列表失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 根据ID获取单个权限
async function getPermissionById(id: string) {
  try {
    const dbManagerInstance = dbManager;
    if (!dbManagerInstance.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManagerInstance.initialize({ type: dbType as any });
    }
    
    const db = dbManagerInstance.getDatabase();
    const permission = await db.get<Permission>(`permissions:${id}`);
    
    if (!permission) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '权限不存在',
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
        data: permission,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('获取权限失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '获取权限失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 创建新权限
async function createPermission(permissionData: any) {
  try {
    // 验证必需字段
    if (!permissionData.id || !permissionData.name || !permissionData.category) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '缺少必需字段：id, name, category',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const dbManagerInstance = dbManager;
    if (!dbManagerInstance.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManagerInstance.initialize({ type: dbType as any });
    }
    
    const db = dbManagerInstance.getDatabase();
    
    // 检查权限ID是否已存在
    const existingPermission = await db.get<Permission>(`permissions:${permissionData.id}`);
    if (existingPermission) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '权限ID已存在',
        }),
        {
          status: 409,
          headers: corsHeaders,
        }
      );
    }
    
    // 创建权限对象
    const newPermission: Permission = {
      id: permissionData.id,
      name: permissionData.name,
      description: permissionData.description || '',
      category: permissionData.category,
    };
    
    // 保存到数据库
    await db.create('permissions', newPermission);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: newPermission,
        message: '权限创建成功',
      }),
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('创建权限失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '创建权限失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 更新权限
async function updatePermission(id: string, permissionData: any) {
  try {
    const dbManagerInstance = dbManager;
    if (!dbManagerInstance.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManagerInstance.initialize({ type: dbType as any });
    }
    
    const db = dbManagerInstance.getDatabase();
    const existingPermission = await db.get<Permission>(`permissions:${id}`);
    
    if (!existingPermission) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '权限不存在',
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    // 更新权限对象
    const updatedPermission: Permission = {
      ...existingPermission,
      ...permissionData,
      id, // 确保ID不变
    };
    
    // 保存更新
    await db.update('permissions', id, updatedPermission);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: updatedPermission,
        message: '权限更新成功',
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('更新权限失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '更新权限失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 删除权限
async function deletePermission(id: string) {
  try {
    const dbManagerInstance = dbManager;
    if (!dbManagerInstance.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManagerInstance.initialize({ type: dbType as any });
    }
    
    const db = dbManagerInstance.getDatabase();
    const existingPermission = await db.get<Permission>(`permissions:${id}`);
    
    if (!existingPermission) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '权限不存在',
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    // 删除权限
    const success = await db.remove('permissions', id);
    
    return new Response(
      JSON.stringify({
        success: success,
        message: success ? '权限删除成功' : '权限删除失败',
      }),
      {
        status: success ? 200 : 500,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('删除权限失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '删除权限失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  const id = url.searchParams.get('id');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    if (method === 'GET') {
      if (id) {
        return await getPermissionById(id);
      } else {
        return await getPermissions();
      }
    } else if (method === 'POST') {
      const body = await req.json();
      return await createPermission(body);
    } else if (method === 'PUT' && id) {
      const body = await req.json();
      return await updatePermission(id, body);
    } else if (method === 'DELETE' && id) {
      return await deletePermission(id);
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Method not allowed',
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            Allow: 'GET, POST, PUT, DELETE, OPTIONS',
          },
        }
      );
    }
  } catch (error) {
    console.error('权限API错误:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}