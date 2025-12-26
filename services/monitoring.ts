// services/monitoring.ts
// 错误监控和性能监控服务

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  environment: string;
}

class MonitoringService {
  private static instance: MonitoringService;
  private isProduction: boolean;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 100;

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production' || 
                      (typeof window !== 'undefined' && 
                       window.location.hostname !== 'localhost' && 
                       !window.location.hostname.includes('127.0.0.1'));
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // 记录信息日志
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  // 记录警告日志
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  // 记录错误日志
  error(message: string, error?: any, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      ...(error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: this.isProduction ? undefined : error.stack, // 生产环境不记录堆栈
        errorType: typeof error
      })
    };
    
    this.log('error', message, errorContext);
  }

  // 记录调试日志（仅在非生产环境）
  debug(message: string, context?: Record<string, any>): void {
    if (!this.isProduction) {
      this.log('debug', message, context);
    }
  }

  // 性能监控：记录API响应时间
  recordApiPerformance(endpoint: string, duration: number, status: number): void {
    if (duration > 2000) { // 超过2秒的请求记录为警告
      this.warn(`Slow API response`, {
        endpoint,
        duration,
        status,
        threshold: 2000
      });
    } else {
      this.debug(`API response`, {
        endpoint,
        duration,
        status
      });
    }
  }

  // 记录数据库性能
  recordDatabasePerformance(operation: string, duration: number, collection?: string): void {
    if (duration > 1000) { // 超过1秒的数据库操作记录为警告
      this.warn(`Slow database operation`, {
        operation,
        duration,
        collection,
        threshold: 1000
      });
    } else {
      this.debug(`Database operation`, {
        operation,
        duration,
        collection
      });
    }
  }

  // 内部日志记录方法
  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context),
      environment: this.isProduction ? 'production' : 'development'
    };

    // 添加到缓冲区
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift(); // 移除最旧的日志
    }

    // 在控制台输出（生产环境只输出error和warn）
    if (this.isProduction) {
      if (level === 'error' || level === 'warn') {
        console[level](`[${level.toUpperCase()}] ${message}`, this.redactSensitiveData(logEntry.context));
      }
    } else {
      console[level](`[${level.toUpperCase()}] ${message}`, logEntry.context);
    }

    // 在生产环境中，可以考虑发送日志到远程服务
    if (this.isProduction && level === 'error') {
      this.sendErrorToRemoteService(logEntry);
    }
  }

  // 脱敏处理上下文数据
  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return context;
    
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(context)) {
      sanitized[key] = this.redactSensitiveData(value);
    }
    
    return sanitized;
  }

  // 脱敏敏感数据
  private redactSensitiveData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      // 脱敏常见的敏感字段
      if (this.isSensitiveField(data)) {
        return '[REDACTED]';
      }
      
      // 检查是否包含敏感信息的键名
      return data;
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        const sanitizedKey = this.isSensitiveField(key) ? `${key}_redacted` : key;
        result[sanitizedKey] = this.redactSensitiveData(value);
      }
      return result;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.redactSensitiveData(item));
    }

    return data;
  }

  // 判断是否为敏感字段
  private isSensitiveField(field: string): boolean {
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /auth/i,
      /credential/i,
      /credit.*card/i,
      /card.*number/i,
      /cvv/i,
      /cvc/i,
      /ssn/i,
      /social.*security/i,
      /bank.*account/i,
      /routing.*number/i
    ];

    return sensitivePatterns.some(pattern => pattern.test(field));
  }

  // 发送错误到远程服务（占位符实现）
  private sendErrorToRemoteService(logEntry: LogEntry): void {
    // 这里可以集成真实的错误监控服务，如 Sentry, LogRocket 等
    // 为简化，我们暂时只记录到控制台
    console.error('Error Report:', {
      timestamp: logEntry.timestamp,
      message: logEntry.message,
      context: logEntry.context
    });
    
    // 实际项目中，这里应该发送到远程错误监控服务
    // 例如：fetch('/api/error-report', { method: 'POST', body: JSON.stringify(logEntry) });
  }

  // 获取日志缓冲区（用于调试）
  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  // 清空日志缓冲区
  clearLogBuffer(): void {
    this.logBuffer = [];
  }
}

// 创建全局监控服务实例
export const monitoringService = MonitoringService.getInstance();

// 便捷的错误处理包装器
export const withErrorHandling = async <T>(
  operation: () => Promise<T>, 
  operationName: string,
  context?: Record<string, any>
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    monitoringService.error(`Error in ${operationName}`, error, context);
    return null;
  }
};

// 性能监控装饰器
export const performanceMonitor = (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
  const method = descriptor.value;
  
  descriptor.value = async function(...args: any[]) {
    const start = performance.now();
    const monitoring = MonitoringService.getInstance();
    
    try {
      const result = await method.apply(this, args);
      const end = performance.now();
      const duration = end - start;
      
      monitoring.recordApiPerformance(`${target.constructor.name}.${propertyName}`, duration, 200);
      
      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      
      monitoring.recordApiPerformance(`${target.constructor.name}.${propertyName}`, duration, 500);
      monitoring.error(`Error in ${target.constructor.name}.${propertyName}`, error);
      
      throw error;
    }
  };
  
  return descriptor;
};