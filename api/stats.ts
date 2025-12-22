import { VercelRequest, VercelResponse } from '@vercel/node';
import { kvClient } from './db.js';

// 统计数据的 Redis Key 前缀
const STATS_PREFIX = 'tech_stats:';

// 支持的技术栈列表
const TECH_STACKS = [
  'react',
  'typescript',
  'vite',
  'tailwind',
  'vercel',
  'upstash-redis',
  'recharts',
  'lucide-react',
  'dnd-kit',
];

// 统计数据类型
interface TechStats {
  techId: string;
  likes: number;
  views: number;
}

/**
 * 技术栈统计 API
 * GET  /api/stats - 获取所有技术栈的统计数据
 * POST /api/stats - 更新统计数据（点赞或查看）
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check if database is connected
  if (!kvClient.isConnected()) {
    res.status(503).json({
      success: false,
      message: 'Database connection not available',
      error: 'Missing Redis configuration',
    });
    return;
  }

  try {
    switch (method) {
      case 'GET':
        await handleGetStats(req, res);
        break;

      case 'POST':
        await handleUpdateStats(req, res);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({
          success: false,
          message: `Method ${method} Not Allowed`,
        });
    }
  } catch (error) {
    console.error('Stats API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * 获取所有技术栈的统计数据
 */
async function handleGetStats(req: VercelRequest, res: VercelResponse) {
  const statsData: TechStats[] = [];

  // 批量获取所有技术栈的统计数据
  for (const techId of TECH_STACKS) {
    const key = `${STATS_PREFIX}${techId}`;
    const data = await kvClient.get(key);

    if (data) {
      statsData.push({
        techId,
        likes: data.likes || 0,
        views: data.views || 0,
      });
    } else {
      // 如果不存在，初始化为 0
      statsData.push({
        techId,
        likes: 0,
        views: 0,
      });
    }
  }

  res.status(200).json({
    success: true,
    data: statsData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 更新统计数据（点赞或查看）
 */
async function handleUpdateStats(req: VercelRequest, res: VercelResponse) {
  const { techId, action } = req.body;

  // 验证参数
  if (!techId || !TECH_STACKS.includes(techId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid techId. Must be one of: ' + TECH_STACKS.join(', '),
    });
    return;
  }

  if (!action || !['like', 'view'].includes(action)) {
    res.status(400).json({
      success: false,
      message: 'Invalid action. Must be "like" or "view"',
    });
    return;
  }

  const key = `${STATS_PREFIX}${techId}`;

  // 获取当前数据
  const currentData = (await kvClient.get(key)) || { likes: 0, views: 0 };

  // 更新数据
  if (action === 'like') {
    currentData.likes = (currentData.likes || 0) + 1;
  } else if (action === 'view') {
    currentData.views = (currentData.views || 0) + 1;
  }

  // 保存更新后的数据
  await kvClient.set(key, currentData);

  res.status(200).json({
    success: true,
    data: {
      techId,
      likes: currentData.likes,
      views: currentData.views,
    },
    message: `Successfully updated ${action} count for ${techId}`,
  });
}
