// api/auth/login.ts
// 登录认证 API（Edge Runtime）

export const config = {
  runtime: 'edge-runtime@1.5.0',
};

// 定义认证凭证
const ADMIN_USER = process.env.VITE_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.VITE_ADMIN_PASS || 'admin123';

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
    const { username, password } = await req.json();

    // 验证凭据
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Login successful',
          token: 'fake-jwt-token-for-demo',
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
          message: 'Invalid credentials',
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }
  } catch (error) {
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
