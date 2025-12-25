// api/partner-accounts.ts
// 合作伙伴账户管理 API（Edge Runtime）

export const config = {
  runtime: 'edge',
};

// CORS 头设置
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
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

// 获取所有合作伙伴账户
async function getPartnerAccounts() {
  try {
    const { DatabaseManager } = await import('../lib/database.js');
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }
    
    const db = dbManager.getDatabase();
    const accounts = await db.getAll<any>('partner_accounts:');
    
    return new Response(
      JSON.stringify({
        success: true,
        data: accounts,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('获取合作伙伴账户失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '获取合作伙伴账户失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 根据ID获取单个合作伙伴账户
async function getPartnerAccountById(id: string) {
  try {
    const { DatabaseManager } = await import('../lib/database.js');
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }
    
    const db = dbManager.getDatabase();
    const account = await db.get<any>(`partner_accounts:${id}`);
    
    if (!account) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '合作伙伴账户不存在',
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
        data: account,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('获取合作伙伴账户失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '获取合作伙伴账户失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 创建新合作伙伴账户
async function createPartnerAccount(accountData: any) {
  try {
    // 验证必需字段
    if (!accountData.name_cn || !accountData.name_en || !accountData.contact_person || !accountData.phone || accountData.credit_limit === undefined) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '缺少必需字段：name_cn, name_en, contact_person, phone, credit_limit',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const { DatabaseManager } = await import('../lib/database.js');
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }
    
    const db = dbManager.getDatabase();
    
    // 检查合作伙伴账户是否已存在（通过名称）
    const existingAccounts = await db.getAll<any>('partner_accounts:');
    const existingAccount = existingAccounts.find((a: any) => a.name_cn === accountData.name_cn || a.name_en === accountData.name_en);
    if (existingAccount) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '合作伙伴账户已存在',
        }),
        {
          status: 409,
          headers: corsHeaders,
        }
      );
    }
    
    // 创建账户对象
    const newAccount = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      name_cn: accountData.name_cn,
      name_en: accountData.name_en,
      contact_person: accountData.contact_person,
      phone: accountData.phone,
      credit_limit: parseFloat(accountData.credit_limit),
      current_balance: 0, // 新账户余额为0
      status: accountData.status || 'active',
      notes: accountData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // 保存到数据库
    await db.create('partner_accounts', newAccount);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: newAccount,
        message: '合作伙伴账户创建成功',
      }),
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('创建合作伙伴账户失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '创建合作伙伴账户失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 更新合作伙伴账户
async function updatePartnerAccount(id: string, accountData: any) {
  try {
    const { DatabaseManager } = await import('../lib/database.js');
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }
    
    const db = dbManager.getDatabase();
    const existingAccount = await db.get<any>(`partner_accounts:${id}`);
    
    if (!existingAccount) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '合作伙伴账户不存在',
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    // 准备更新数据
    const updateData: any = {
      ...accountData,
      updatedAt: new Date().toISOString(),
    };
    
    // 如果提供了信用额度，需要转换为数字
    if (accountData.credit_limit !== undefined) {
      updateData.credit_limit = parseFloat(accountData.credit_limit);
    }
    
    // 移除不允许更新的字段
    delete (updateData as any).id;
    delete (updateData as any).createdAt;
    
    // 执行更新
    const updatedAccount = await db.update('partner_accounts', id, updateData);
    
    if (!updatedAccount) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '更新合作伙伴账户失败',
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: updatedAccount,
        message: '合作伙伴账户更新成功',
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('更新合作伙伴账户失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '更新合作伙伴账户失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 删除合作伙伴账户
async function deletePartnerAccount(id: string) {
  try {
    const { DatabaseManager } = await import('../lib/database.js');
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }
    
    const db = dbManager.getDatabase();
    const existingAccount = await db.get<any>(`partner_accounts:${id}`);
    
    if (!existingAccount) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '合作伙伴账户不存在',
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    // 检查账户是否有未结清的余额
    if (existingAccount.current_balance > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '不能删除有未结清余额的账户',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    const success = await db.remove('partner_accounts', id);
    
    if (success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: '合作伙伴账户删除成功',
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
          message: '合作伙伴账户删除失败',
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  } catch (error) {
    console.error('删除合作伙伴账户失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '删除合作伙伴账户失败',
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
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const accountId = pathParts[pathParts.length - 1]; // 获取路径中的账户ID（如果存在）
    
    // 对于敏感操作（POST, PUT, DELETE）添加认证保护
    if (req.method !== 'GET') {
      const authHeader = req.headers.get('Authorization');
      const adminUser = process.env.VITE_ADMIN_USER || 'admin';
      const adminPass = process.env.VITE_ADMIN_PASS || 'admin123';
      const adminKey = `${adminUser}:${adminPass}`; // 创建认证密钥
      
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
    
    // 检查是否是获取特定账户信息的请求
    const isSpecificAccount = req.method === 'GET' && accountId && (/^[0-9]+$/.test(accountId) || /^[a-zA-Z0-9]+$/.test(accountId));
    
    switch (req.method) {
      case 'GET':
        if (isSpecificAccount) {
          return await getPartnerAccountById(accountId);
        } else {
          return await getPartnerAccounts();
        }
      case 'POST':
        const createData = await req.json();
        return await createPartnerAccount(createData);
      case 'PUT':
        if (!accountId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: '缺少账户ID',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        const updateData = await req.json();
        return await updatePartnerAccount(accountId, updateData);
      case 'DELETE':
        if (!accountId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: '缺少账户ID',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        return await deletePartnerAccount(accountId);
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