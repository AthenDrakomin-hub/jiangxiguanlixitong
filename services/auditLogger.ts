// services/auditLogger.ts
// Audit logger for tracking system events

export default class AuditLogger {
  static log<T>(event: string, data?: T) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      data,
    };

    // In a real implementation, this would save to a database or file
    // For now, we'll just log to console
    console.log('[AUDIT]', logEntry);
  }
}
