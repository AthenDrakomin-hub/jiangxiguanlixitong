// api/print.ts
// Cloud printing API endpoint (Feyin/Yilianyun compatible)

export const config = {
  runtime: 'edge',
};

interface CloudPrintConfig {
  apiUrl: string;
  user: string;
  ukey: string;
  sn: string;
}

interface PrintRequest {
  mode: 'cloud' | 'browser';
  config?: CloudPrintConfig;
  content: string;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: PrintRequest = await req.json();
    const { mode, config, content } = body;

    if (mode === 'cloud') {
      if (!config) {
        return new Response(
          JSON.stringify({ success: false, message: 'Cloud config required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 调用飞鹅云打印 API
      const result = await printToFeyin(config, content);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Unsupported mode' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Print API error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Print failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 飞鹅云打印 API 调用
 * 文档: https://www.feieyun.com/open/index.html
 */
async function printToFeyin(
  config: CloudPrintConfig,
  content: string
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  try {
    // 生成签名（飞鹅云要求）
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = generateFeyinSign(config.user, config.ukey, timestamp);

    // 构造请求参数
    const params = new URLSearchParams({
      user: config.user,
      stime: timestamp.toString(),
      sig: sign,
      apiname: 'Open_printMsg', // 飞鹅云打印接口
      sn: config.sn,
      content: content,
      times: '1', // 打印次数
    });

    // 调用飞鹅云 API
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const result = await response.json();

    // 飞鹅云返回格式: { ret: 0, msg: 'ok', data: {...} }
    if (result.ret === 0) {
      return { success: true, message: 'Print success', data: result.data };
    } else {
      return { success: false, message: result.msg || 'Print failed' };
    }
  } catch (error) {
    console.error('Feyin API error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * 生成飞鹅云签名
 * 算法: SHA1(user + ukey + timestamp)
 */
function generateFeyinSign(
  user: string,
  ukey: string,
  timestamp: number
): string {
  const str = user + ukey + timestamp.toString();
  return sha1(str);
}

/**
 * SHA1 哈希函数（Edge Runtime 兼容）
 */
async function sha1(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
