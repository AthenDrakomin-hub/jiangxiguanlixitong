export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { username, password } = await req.json();

    // 从服务器环境变量读取管理员凭据（不会暴露到前端）
    const ADMIN_USER = process.env.ADMIN_USER || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASS || 'Admin123';

    // 验证用户名和密码
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // 登录成功，生成简单的 token（实际项目中应使用 JWT）
      const token = btoa(`${username}:${Date.now()}`);

      return new Response(
        JSON.stringify({
          success: true,
          token: token,
          message: '登录成功 / Login successful',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 登录失败
    return new Response(
      JSON.stringify({
        success: false,
        message: '用户名或密码错误 / Invalid username or password',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '登录失败 / Login failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
