import { dbManager } from '../lib/database.js';
import { DatabaseConfig, StorageType } from '../types.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // CORS 头设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    if (req.method === 'POST') {
      const body = await req.json();
      const { type, connectionString } = body;

      // 验证必需的参数
      if (!type) {
        return new Response(
          JSON.stringify({
            success: false,
            message: '数据库类型是必需的',
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // 根据数据库类型进行连接测试
      let connectionSuccess = false;
      let connectionMessage = '';
      
      try {
        // 根据数据库类型设置配置
        let settings;
        switch (type) {
          case 'neon':
            settings = {
              connectionString: connectionString || '',
            };
            connectionMessage = 'Neon 连接测试';
            break;
          case 'memory':
            settings = null;
            // 内存数据库不需要连接测试
            connectionSuccess = true;
            connectionMessage = '内存数据库连接成功';
            break;
          default:
            return new Response(
              JSON.stringify({
                success: false,
                message: `不支持的数据库类型: ${type}`,
              }),
              {
                status: 400,
                headers: corsHeaders,
              }
            );
        }

        // 创建数据库配置对象

        // 对于Neon数据库，需要进行实际连接测试
        if (type === 'neon' && connectionString) {
          try {
            // 在Edge Functions环境中，使用动态导入来安全地加载Neon驱动
            // 如果Neon驱动不可用，连接测试会失败，但不会崩溃应用
            const module = await eval(`import('@neondatabase/serverless')`);
            const { neon } = module;
            const sql = neon(connectionString);
            
            // 执行一个简单的查询来测试连接
            await sql`SELECT 1`;
            
            connectionSuccess = true;
            connectionMessage = 'Neon 数据库连接成功';
          } catch (error) {
            console.error('Neon数据库连接测试失败:', error);
            connectionMessage = `Neon数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`;
          }
        } else if (type !== 'memory') {
          // 对于其他非内存数据库，返回连接成功（因为我们当前只实现了内存数据库）
          connectionSuccess = true;
          connectionMessage = `${type.toUpperCase()} 配置已保存`;
        } else {
          connectionSuccess = true;
          connectionMessage = '内存数据库连接成功';
        }
      } catch (error) {
        console.error('数据库连接测试失败:', error);
        connectionMessage = `连接失败: ${error instanceof Error ? error.message : '未知错误'}`;
      }

      return new Response(
        JSON.stringify({
          success: connectionSuccess,
          message: connectionMessage,
          type: type,
        }),
        {
          status: connectionSuccess ? 200 : 500,
          headers: corsHeaders,
        }
      );
    }

    // GET 请求：返回当前数据库状态
    if (req.method === 'GET') {
      const isInitialized = dbManager.isInitialized();
      
      // 在实际实现中，这里应该返回当前配置的数据库类型
      // 当前简化实现返回内存数据库类型
      return new Response(
        JSON.stringify({
          success: true,
          initialized: isInitialized,
          status: isInitialized ? 'connected' : 'disconnected',
          type: isInitialized ? 'memory' : 'not_initialized', // 在完整实现中，这应该是实际的数据库类型
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    // PUT 请求：重新配置数据库
    if (req.method === 'PUT') {
      const body = await req.json();
      const { type, connectionString } = body;

      if (!type) {
        return new Response(
          JSON.stringify({
            success: false,
            message: '数据库类型是必需的',
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      try {
        // 根据数据库类型设置配置
        let settings;
        switch (type) {
          case 'neon':
            settings = {
              connectionString: connectionString || '',
            };
            break;
          case 'memory':
            settings = null;
            break;
          default:
            return new Response(
              JSON.stringify({
                success: false,
                message: `不支持的数据库类型: ${type}`,
              }),
              {
                status: 400,
                headers: corsHeaders,
              }
            );
        }

        // 创建数据库配置对象
        const config: DatabaseConfig = {
          type: type as StorageType,
          settings: settings
        };

        // 重新配置数据库
        await dbManager.reconfigure(config);

        return new Response(
          JSON.stringify({
            success: true,
            message: `数据库已重新配置为 ${type}`,
            type: type,
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } catch (error) {
        console.error('数据库重新配置失败:', error);
        return new Response(
          JSON.stringify({
            success: false,
            message: `数据库重新配置失败: ${error instanceof Error ? error.message : '未知错误'}`,
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          Allow: 'GET, POST, PUT, OPTIONS',
        },
      }
    );
  } catch (error) {
    console.error('数据库配置API错误:', error);
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