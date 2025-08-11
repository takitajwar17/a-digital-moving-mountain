/**
 * Performance Logger Utility
 * Provides detailed logging for all performance optimizations
 */

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';
export type LogCategory = 'IMAGE_LOAD' | 'PRELOAD' | 'RESOURCE_HINT' | 'CACHE' | 'NETWORK' | 'OPTIMIZATION';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, unknown>;
  duration?: number;
}

class PerformanceLogger {
  private logs: LogEntry[] = [];
  private startTimes: Map<string, number> = new Map();
  private enabled: boolean = true;
  private consoleStyles = {
    info: 'color: #3B82F6; font-weight: bold;',
    success: 'color: #10B981; font-weight: bold;',
    warning: 'color: #F59E0B; font-weight: bold;',
    error: 'color: #EF4444; font-weight: bold;',
    debug: 'color: #6B7280; font-style: italic;',
  };

  constructor() {
    // Enable logging in development or if explicitly enabled
    this.enabled = process.env.NODE_ENV === 'development' || 
                   (typeof window !== 'undefined' && window.localStorage?.getItem('enablePerfLogging') === 'true');
    
    if (this.enabled && typeof window !== 'undefined') {
      // Make logger accessible in console for debugging
      (window as Window & { __perfLogger?: PerformanceLogger }).__perfLogger = this;
      console.log('%c🚀 Performance Logger Enabled', 'color: #10B981; font-size: 14px; font-weight: bold;');
      console.log('%cUse window.__perfLogger.showSummary() to see performance report', 'color: #6B7280;');
    }
  }

  /**
   * Start timing an operation
   */
  startTimer(key: string): void {
    this.startTimes.set(key, performance.now());
  }

  /**
   * End timing and log the duration
   */
  endTimer(key: string, category: LogCategory, message: string, details?: Record<string, unknown>): number {
    const startTime = this.startTimes.get(key);
    if (!startTime) {
      this.log('warning', category, `Timer '${key}' was not started`, details);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(key);
    
    this.log('info', category, message, { ...details, duration: `${duration.toFixed(2)}ms` }, duration);
    return duration;
  }

  /**
   * Log a message
   */
  log(level: LogLevel, category: LogCategory, message: string, details?: Record<string, unknown>, duration?: number): void {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      details,
      duration,
    };

    this.logs.push(entry);
    this.consoleLog(entry);
  }

  /**
   * Output to console with styling
   */
  private consoleLog(entry: LogEntry): void {
    const prefix = `[${entry.category}]`;
    const style = this.consoleStyles[entry.level];
    const emoji = this.getEmoji(entry.level);
    
    if (entry.details) {
      console.groupCollapsed(
        `%c${emoji} ${prefix} ${entry.message}`,
        style
      );
      console.log('Details:', entry.details);
      if (entry.duration) {
        console.log(`Duration: ${entry.duration.toFixed(2)}ms`);
      }
      console.groupEnd();
    } else {
      console.log(
        `%c${emoji} ${prefix} ${entry.message}`,
        style
      );
    }
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'debug': return '🔍';
      default: return 'ℹ️';
    }
  }

  /**
   * Show performance summary
   */
  showSummary(): void {
    console.group('%c📊 Performance Summary', 'color: #3B82F6; font-size: 16px; font-weight: bold;');
    
    // Group logs by category
    const byCategory = this.logs.reduce((acc, log) => {
      if (!acc[log.category]) acc[log.category] = [];
      acc[log.category].push(log);
      return acc;
    }, {} as Record<LogCategory, LogEntry[]>);

    Object.entries(byCategory).forEach(([category, logs]) => {
      console.group(`%c${category} (${logs.length} events)`, 'color: #6B7280; font-weight: bold;');
      
      // Calculate stats
      const durations = logs.filter(l => l.duration).map(l => l.duration!);
      if (durations.length > 0) {
        const total = durations.reduce((a, b) => a + b, 0);
        const avg = total / durations.length;
        console.log(`Total time: ${total.toFixed(2)}ms`);
        console.log(`Average: ${avg.toFixed(2)}ms`);
        console.log(`Min: ${Math.min(...durations).toFixed(2)}ms`);
        console.log(`Max: ${Math.max(...durations).toFixed(2)}ms`);
      }
      
      // Show recent logs
      console.table(logs.slice(-5).map(l => ({
        level: l.level,
        message: l.message,
        duration: l.duration ? `${l.duration.toFixed(2)}ms` : '-',
      })));
      
      console.groupEnd();
    });
    
    console.groupEnd();
  }

  /**
   * Get performance metrics
   */
  getMetrics(): {
    totalImages: number;
    optimizedImages: number;
    cacheHits: number;
    averageLoadTime: number;
    networkQuality: string;
    prefetchedResources: number;
  } {
    const imageLoads = this.logs.filter(l => l.category === 'IMAGE_LOAD');
    const optimized = imageLoads.filter(l => l.details?.optimized).length;
    const cacheHits = this.logs.filter(l => l.details?.fromCache).length;
    const loadTimes = imageLoads.filter(l => l.duration).map(l => l.duration!);
    const avgLoadTime = loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0;
    const networkLogs = this.logs.filter(l => l.category === 'NETWORK');
    const networkQuality = (networkLogs[networkLogs.length - 1]?.details?.quality as string) || 'unknown';
    const prefetched = this.logs.filter(l => l.category === 'RESOURCE_HINT').length;

    return {
      totalImages: imageLoads.length,
      optimizedImages: optimized,
      cacheHits,
      averageLoadTime: avgLoadTime,
      networkQuality,
      prefetchedResources: prefetched,
    };
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
    this.startTimes.clear();
    console.log('%c🧹 Performance logs cleared', 'color: #6B7280;');
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('enablePerfLogging', enabled.toString());
    }
    console.log(`%c📊 Performance logging ${enabled ? 'enabled' : 'disabled'}`, 'color: #6B7280;');
  }
}

// Singleton instance
export const perfLogger = new PerformanceLogger();

// Convenience functions
export const logImageLoad = (url: string, details: Record<string, unknown>) => 
  perfLogger.log('info', 'IMAGE_LOAD', `Loading image: ${url}`, details);

export const logPreload = (url: string, success: boolean, details?: Record<string, unknown>) => 
  perfLogger.log(success ? 'success' : 'error', 'PRELOAD', `Preload ${success ? 'completed' : 'failed'}: ${url}`, details);

export const logOptimization = (message: string, details: Record<string, unknown>) => 
  perfLogger.log('info', 'OPTIMIZATION', message, details);

export const logResourceHint = (type: string, url: string) => 
  perfLogger.log('debug', 'RESOURCE_HINT', `Added ${type} hint: ${url}`);

export const logNetworkStatus = (quality: string, details: Record<string, unknown>) => 
  perfLogger.log('info', 'NETWORK', `Network quality: ${quality}`, details);

export const logCacheStatus = (hit: boolean, url: string) => 
  perfLogger.log(hit ? 'success' : 'debug', 'CACHE', `Cache ${hit ? 'hit' : 'miss'}: ${url}`);