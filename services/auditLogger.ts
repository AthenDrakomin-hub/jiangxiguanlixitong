// services/auditLogger.ts
// Audit logger for tracking system events

export const auditLogger = {
  log(
    level: 'info' | 'warn' | 'error',
    action: string,
    details: string,
    userId: string
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      action,
      details,
      userId,
    };

    // Log to console for debugging
    console.log('[AUDIT]', logEntry);

    // TODO: 未来可以调用 API 将日志持久化到数据库
    // Example: await apiClient.post('/audit_logs', logEntry);
  },
};
