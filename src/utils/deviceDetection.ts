export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type InputMethod = 'touch' | 'keyboard' | 'stylus';

export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';

  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent) || 
                  (navigator.maxTouchPoints > 1 && window.innerWidth > 768);

  if (isMobile && !isTablet) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

export function getInputMethod(): InputMethod {
  if (typeof window === 'undefined') return 'keyboard';

  // Check for touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check for stylus support (experimental)
  const hasStylus = window.PointerEvent && 
                   navigator.maxTouchPoints > 0 &&
                   /stylus/i.test(navigator.userAgent);

  if (hasStylus) return 'stylus';
  if (hasTouch) return 'touch';
  return 'keyboard';
}

export function isKioskMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for fullscreen mode
  const isFullscreen = document.fullscreenElement !== null;
  
  // Check for kiosk mode indicators
  const isKiosk = window.location.search.includes('kiosk=true') ||
                 window.location.hash.includes('kiosk') ||
                 localStorage.getItem('kioskMode') === 'true';

  return isFullscreen || isKiosk;
}

export function getScreenOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'landscape';
  
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function supportsHover(): boolean {
  if (typeof window === 'undefined') return true;
  
  return window.matchMedia('(hover: hover)').matches;
}

export function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 1920, height: 1080 };
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

export function getUserAgentInfo(): {
  browser: string;
  version: string;
  os: string;
} {
  if (typeof navigator === 'undefined') {
    return { browser: 'unknown', version: 'unknown', os: 'unknown' };
  }

  const userAgent = navigator.userAgent;
  
  // Browser detection
  let browser = 'unknown';
  let version = 'unknown';
  
  if (userAgent.includes('Chrome')) {
    browser = 'chrome';
    version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Firefox')) {
    browser = 'firefox';
    version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Safari')) {
    browser = 'safari';
    version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Edge')) {
    browser = 'edge';
    version = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 'unknown';
  }

  // OS detection
  let os = 'unknown';
  if (userAgent.includes('Windows')) os = 'windows';
  else if (userAgent.includes('Mac')) os = 'macos';
  else if (userAgent.includes('Linux')) os = 'linux';
  else if (userAgent.includes('Android')) os = 'android';
  else if (userAgent.includes('iOS')) os = 'ios';

  return { browser, version, os };
}