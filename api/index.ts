import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ 
    message: '江西酒店管理系统API服务',
    status: 'running',
    timestamp: new Date().toISOString()
  });
}