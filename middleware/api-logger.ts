// middleware/api-logger.ts
// API请求日志和性能监控中间件

import { monitoringService } from '../services/monitoring.js';

interface ApiLogContext {
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  duration?: number;
  statusCode?: number;
  requestBody?: any;
  responseBody?: any;
}

export class ApiLogger {
  // 记录API请求
  static async logRequest(
    req: Request, 
    handler: (req: Request) => Promise<Response>
  ): Promise<Response> {
    const startTime = Date.now();
    const context: ApiLogContext = {
      method: req.method || 'UNKNOWN',
      url: req.url,
      userAgent: req.headers.get('user-agent') || undefined
    };

    try {
      // 执行原始请求处理程序
      const response = await handler(req);
      
      // 计算响应时间
      const duration = Date.now() - startTime;
      const responseBody = await response.text();
      const clonedResponse = new Response(responseBody, response);
      
      // 记录成功请求
      context.duration = duration;
      context.statusCode = response.status;
      context.responseBody = this.safeJsonParse(responseBody);
      
      monitoringService.debug('API Request Completed', context);
      
      // 记录性能指标
      monitoringService.recordApiPerformance(context.url, duration, response.status);
      
      return clonedResponse;
    } catch (error) {
      // 计算响应时间
      const duration = Date.now() - startTime;
      
      // 记录错误请求
      context.duration = duration;
      context.statusCode = 500;
      
      monitoringService.error('API Request Failed', error, context);
      
      // 记录性能指标
      monitoringService.recordApiPerformance(context.url, duration, 500);
      
      throw error;
    }
  }

  // 安全的JSON解析，避免解析错误
  private static safeJsonParse(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch {
      return jsonString;
    }
  }

  // 从请求中提取IP地址（简化版本）
  static getIpAddress(req: Request): string {
    // 在Edge Runtime环境中，获取IP的方式可能不同
    // 这里提供一个简化实现
    return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
           req.headers.get('x-real-ip') || 
           'unknown';
  }
}