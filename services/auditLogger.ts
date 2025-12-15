import { AuditLog } from '../types';

// 定义日志级别
type LogLevel = 'info' | 'warn' | 'error';

// 审计日志服务
class AuditLogger {
  private static instance: AuditLogger;
  private logs: AuditLog[] = [];

  private constructor() {}

  // 获取单例实例
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // 记录日志
  log(level: LogLevel, action: string, details: string, userId?: string): void {
    const logEntry: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      action,
      details,
      userId: userId || 'unknown',
    };

    // 添加到内存日志数组
    this.logs.push(logEntry);

    // 同时输出到控制台（开发环境）
    if (
      typeof process !== 'undefined' &&
      process.env &&
      process.env.NODE_ENV === 'development'
    ) {
      console.log(`[${level.toUpperCase()}] ${action}: ${details}`);
    }

    // 如果日志数量超过100条，移除最旧的日志
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    // 保存到 localStorage（如果可用）
    this.saveToStorage();
  }

  // 获取所有日志
  getLogs(): AuditLog[] {
    return [...this.logs];
  }

  // 根据用户ID获取日志
  getUserLogs(userId: string): AuditLog[] {
    return this.logs.filter((log) => log.userId === userId);
  }

  // 根据日期范围获取日志
  getLogsByDateRange(startDate: Date, endDate: Date): AuditLog[] {
    return this.logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // 清除日志
  clearLogs(): void {
    this.logs = [];
    this.saveToStorage();
  }

  // 保存日志到 localStorage
  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('audit_logs', JSON.stringify(this.logs));
      }
    } catch (error) {
      console.error('Failed to save audit logs to localStorage:', error);
    }
  }

  // 从 localStorage 加载日志
  loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedLogs = localStorage.getItem('audit_logs');
        if (storedLogs) {
          this.logs = JSON.parse(storedLogs);
        }
      }
    } catch (error) {
      console.error('Failed to load audit logs from localStorage:', error);
    }
  }
}

// 创建并导出单例实例
const auditLogger = AuditLogger.getInstance();

// 页面加载时从存储中恢复日志
if (typeof window !== 'undefined') {
  auditLogger.loadFromStorage();
}

export default auditLogger;
