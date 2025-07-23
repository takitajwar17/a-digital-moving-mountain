import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodeData {
  url: string;
  year?: number;
  panel?: string;
  mode?: 'gallery' | 'mobile' | 'kiosk';
  sessionId?: string;
}

/**
 * Generate QR code URL for specific artwork panel
 */
export function generatePanelURL(
  baseURL: string,
  year: number,
  options?: {
    mode?: 'gallery' | 'mobile' | 'kiosk';
    sessionId?: string;
  }
): string {
  // Ensure baseURL ends with /display for the main artwork viewer
  const url = new URL(`${baseURL.replace(/\/$/, '')}/display`);
  url.searchParams.set('year', year.toString());
  
  if (options?.mode) {
    url.searchParams.set('mode', options.mode);
  }
  
  if (options?.sessionId) {
    url.searchParams.set('session', options.sessionId);
  }
  
  // Add timestamp for tracking
  url.searchParams.set('t', Date.now().toString());
  
  return url.toString();
}

/**
 * Generate QR code data URL (base64 image)
 */
export async function generateQRCode(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const qrOptions = {
    width: options.size || 256,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF'
    },
    errorCorrectionLevel: options.errorCorrectionLevel || 'M'
  };

  try {
    return await QRCode.toDataURL(data, qrOptions);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('QR code generation failed');
  }
}

/**
 * Generate QR code SVG string
 */
export async function generateQRCodeSVG(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const qrOptions = {
    width: options.size || 256,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF'
    },
    errorCorrectionLevel: options.errorCorrectionLevel || 'M'
  };

  try {
    return await QRCode.toString(data, { type: 'svg', ...qrOptions });
  } catch (error) {
    console.error('Failed to generate QR code SVG:', error);
    throw new Error('QR code SVG generation failed');
  }
}

/**
 * Generate QR codes for all artwork panels
 */
export async function generateAllPanelQRCodes(
  baseURL: string,
  years: number[],
  options: QRCodeOptions = {}
): Promise<Record<number, string>> {
  const qrCodes: Record<number, string> = {};
  
  for (const year of years) {
    const url = generatePanelURL(baseURL, year, { mode: 'mobile' });
    qrCodes[year] = await generateQRCode(url, options);
  }
  
  return qrCodes;
}

/**
 * Generate gallery-specific QR code with kiosk mode
 */
export async function generateGalleryQRCode(
  baseURL: string,
  year: number,
  options: QRCodeOptions = {}
): Promise<string> {
  const url = generatePanelURL(baseURL, year, { 
    mode: 'kiosk',
    sessionId: `gallery_${Date.now()}`
  });
  
  return await generateQRCode(url, {
    size: 512, // Larger size for gallery displays
    margin: 4,
    errorCorrectionLevel: 'H', // High error correction for gallery environment
    ...options
  });
}

/**
 * Parse QR code URL parameters
 */
export function parseQRCodeURL(url: string): QRCodeData | null {
  try {
    const urlObj = new URL(url);
    const year = urlObj.searchParams.get('year');
    const panel = urlObj.searchParams.get('panel');
    const mode = urlObj.searchParams.get('mode') as 'gallery' | 'mobile' | 'kiosk';
    const sessionId = urlObj.searchParams.get('session');
    
    return {
      url: url,
      year: year ? parseInt(year) : undefined,
      panel: panel || undefined,
      mode: mode || undefined,
      sessionId: sessionId || undefined
    };
  } catch (error) {
    console.error('Failed to parse QR code URL:', error);
    return null;
  }
}

/**
 * Generate QR code for sharing specific comment
 */
export async function generateCommentShareQRCode(
  baseURL: string,
  year: number,
  commentId: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const url = new URL(baseURL);
  url.searchParams.set('year', year.toString());
  url.searchParams.set('comment', commentId);
  url.searchParams.set('mode', 'share');
  
  return await generateQRCode(url.toString(), options);
}

/**
 * Generate batch QR codes for printing
 */
export async function generatePrintableQRCodes(
  baseURL: string,
  years: number[]
): Promise<Array<{ year: number; qrCode: string; url: string }>> {
  const results = [];
  
  for (const year of years) {
    const url = generatePanelURL(baseURL, year, { mode: 'mobile' });
    const qrCode = await generateQRCode(url, {
      size: 400,
      margin: 6,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    
    results.push({ year, qrCode, url });
  }
  
  return results;
}

/**
 * Validate QR code data
 */
export function validateQRCodeData(data: string): boolean {
  try {
    const url = new URL(data);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generate QR code with custom logo/branding
 */
export async function generateBrandedQRCode(
  data: string,
  options: QRCodeOptions & { logo?: string } = {}
): Promise<string> {
  // Generate base QR code
  const qrCode = await generateQRCode(data, options);
  
  // TODO: If logo is provided, overlay it on the QR code
  // This would require canvas manipulation or image processing
  
  return qrCode;
}