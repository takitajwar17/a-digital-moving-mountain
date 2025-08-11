'use client';

import { useState, useEffect } from 'react';
import { perfLogger } from '@/utils/performanceLogger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Zap, 
  Download, 
  Wifi, 
  HardDrive,
  BarChart,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function PerformanceDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [metrics, setMetrics] = useState({
    totalImages: 0,
    optimizedImages: 0,
    cacheHits: 0,
    averageLoadTime: 0,
    networkQuality: 'unknown',
    prefetchedResources: 0,
  });
  const [updateCounter, setUpdateCounter] = useState(0);

  useEffect(() => {
    // Update metrics every second
    const interval = setInterval(() => {
      setMetrics(perfLogger.getMetrics());
      setUpdateCounter(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Show dashboard on key press (Ctrl/Cmd + Shift + P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Activity className="w-4 h-4 mr-2" />
          Performance
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-64' : 'w-96'
    }`}>
      <Card className="shadow-2xl border-2 border-blue-500/20 bg-background/95 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg">Performance Monitor</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Press Ctrl+Shift+P to toggle
          </CardDescription>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="space-y-4">
            {/* Network Status */}
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Network</span>
              </div>
              <Badge variant={metrics.networkQuality === 'fast' ? 'default' : 'secondary'}>
                {metrics.networkQuality}
              </Badge>
            </div>

            {/* Image Loading Stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold">Image Loading</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-muted rounded">
                  <div className="text-muted-foreground">Total Loaded</div>
                  <div className="text-lg font-bold">{metrics.totalImages}</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-muted-foreground">Optimized</div>
                  <div className="text-lg font-bold text-green-500">
                    {metrics.optimizedImages}
                    {metrics.totalImages > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({Math.round((metrics.optimizedImages / metrics.totalImages) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold">Performance</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-muted rounded">
                  <div className="text-muted-foreground">Avg Load Time</div>
                  <div className="text-lg font-bold">
                    {metrics.averageLoadTime.toFixed(0)}ms
                  </div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-muted-foreground">Cache Hits</div>
                  <div className="text-lg font-bold text-green-500">
                    {metrics.cacheHits}
                  </div>
                </div>
              </div>
            </div>

            {/* Prefetch Stats */}
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Prefetched</span>
              </div>
              <Badge variant="outline">{metrics.prefetchedResources} resources</Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  console.log('%c📊 Opening Performance Summary...', 'color: #3B82F6; font-weight: bold;');
                  perfLogger.showSummary();
                }}
              >
                <BarChart className="w-3 h-3 mr-1" />
                View Logs
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  perfLogger.clear();
                  setMetrics({
                    totalImages: 0,
                    optimizedImages: 0,
                    cacheHits: 0,
                    averageLoadTime: 0,
                    networkQuality: 'unknown',
                    prefetchedResources: 0,
                  });
                }}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
              <p>✅ Image optimization is {metrics.optimizedImages > 0 ? 'working' : 'ready'}</p>
              <p>📊 Open console for detailed logs</p>
              <p>🔍 Use window.__perfLogger for debugging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}