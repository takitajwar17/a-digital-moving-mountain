'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { generateQRCode, generatePanelURL, QRCodeOptions } from '@/utils/qrCode';

interface QRCodeDisplayProps {
  year: number;
  baseURL?: string;
  mode?: 'gallery' | 'mobile' | 'kiosk';
  size?: number;
  title?: string;
  description?: string;
  options?: QRCodeOptions;
  onError?: (error: Error) => void;
  className?: string;
}

export default function QRCodeDisplay({
  year,
  baseURL,
  mode = 'mobile',
  size = 256,
  title,
  description,
  options,
  onError,
  className = ''
}: QRCodeDisplayProps) {
  const [qrCodeDataURL, setQRCodeDataURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Generate QR code
  useEffect(() => {
    const generateCode = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use current origin if baseURL not provided
        const currentBaseURL = baseURL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        
        // Generate URL for the specific year and mode
        const url = generatePanelURL(currentBaseURL, year, { mode });
        
        // Generate QR code
        const qrCode = await generateQRCode(url, {
          size,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          ...options
        });
        
        setQRCodeDataURL(qrCode);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate QR code');
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    generateCode();
  }, [year, baseURL, mode, size, options, onError]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg ${className}`} style={{ width: size, height: size }}>
        <div className="text-center p-4">
          <p className="text-red-500 text-sm">Failed to generate QR code</p>
          <p className="text-gray-500 text-xs mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        {qrCodeDataURL && (
          <Image
            src={qrCodeDataURL}
            alt={`QR code for ${year} artwork panel`}
            width={size}
            height={size}
            className="block"
          />
        )}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 mt-2 text-center max-w-xs">{description}</p>
      )}
      
      <div className="text-xs text-gray-500 mt-2 text-center">
        <p>Scan to view {year} panel</p>
        <p className="capitalize">{mode} mode</p>
      </div>
    </div>
  );
}