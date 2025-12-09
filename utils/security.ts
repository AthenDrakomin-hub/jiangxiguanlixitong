// Security utilities

// Sanitize user input to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Validate and sanitize URL
export const sanitizeUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return parsedUrl.href;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// Generate a secure random ID
export const generateSecureId = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
};

// Check if running in a secure context
export const isSecureContext = (): boolean => {
  return window.isSecureContext || window.location.protocol === 'https:';
};

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private timeWindow: number; // in milliseconds

  constructor(maxRequests: number = 10, timeWindow: number = 60000) { // 10 requests per minute
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Filter out old requests
    const recentRequests = requests.filter(time => now - time < this.timeWindow);
    
    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }

  clear(key: string) {
    this.requests.delete(key);
  }
}