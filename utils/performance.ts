// Performance monitoring utilities

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number; // in milliseconds
  timestamp: number;
}

// Simple performance monitoring class
export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static maxMetrics = 100;

  static startMeasure(_componentName: string): number {
    return performance.now();
  }

  static endMeasure(componentName: string, startTime: number) {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Add to metrics
    this.metrics.push({
      componentName,
      renderTime,
      timestamp: Date.now()
    });
    
    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Log slow renders (> 16ms = 60fps)
    if (renderTime > 16) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
    
    return renderTime;
  }

  static getAverageRenderTime(componentName: string): number {
    const componentMetrics = this.metrics.filter(m => m.componentName === componentName);
    if (componentMetrics.length === 0) return 0;
    
    const totalRenderTime = componentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return totalRenderTime / componentMetrics.length;
  }

  static getSlowestComponents(limit: number = 5): PerformanceMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, limit);
  }

  static clearMetrics() {
    this.metrics = [];
  }
}

// Hook for measuring component render performance
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = PerformanceMonitor.startMeasure(componentName);
  
  // Return a function to end measurement
  return () => PerformanceMonitor.endMeasure(componentName, startTime);
};