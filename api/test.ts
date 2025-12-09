import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ 
    message: 'API测试端点工作正常',
    timestamp: new Date().toISOString()
  });
}