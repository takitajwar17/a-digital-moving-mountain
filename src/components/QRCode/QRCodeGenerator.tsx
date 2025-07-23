'use client';

import { useState } from 'react';
import Image from 'next/image';
import { generateAllPanelQRCodes, generatePrintableQRCodes } from '@/utils/qrCode';
import QRCodeDisplay from './QRCodeDisplay';

interface QRCodeGeneratorProps {
  years: number[];
  baseURL?: string;
  mode?: 'gallery' | 'mobile' | 'kiosk';
  className?: string;
}

export default function QRCodeGenerator({
  years,
  baseURL,
  mode = 'mobile',
  className = ''
}: QRCodeGeneratorProps) {
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);
  const [generating, setGenerating] = useState(false);
  const [generatedQRCodes, setGeneratedQRCodes] = useState<Record<number, string>>({});

  // Generate QR codes for all years
  const handleGenerateAll = async () => {
    try {
      setGenerating(true);
      const currentBaseURL = baseURL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      
      const qrCodes = await generateAllPanelQRCodes(currentBaseURL, years, {
        size: 256,
        margin: 2,
        errorCorrectionLevel: 'M'
      });
      
      setGeneratedQRCodes(qrCodes);
    } catch (error) {
      console.error('Failed to generate QR codes:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Generate printable QR codes
  const handleGeneratePrintable = async () => {
    try {
      setGenerating(true);
      const currentBaseURL = baseURL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      
      const printableQRCodes = await generatePrintableQRCodes(currentBaseURL, years);
      
      // Create a printable page
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        let printHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>A Digital Moving Mountain - QR Codes</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .qr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin: 20px 0; }
              .qr-item { text-align: center; page-break-inside: avoid; }
              .qr-item h3 { margin: 0 0 10px 0; font-size: 18px; }
              .qr-item img { max-width: 200px; height: auto; }
              .qr-item p { margin: 10px 0 0 0; font-size: 12px; color: #666; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>A Digital Moving Mountain - QR Codes</h1>
            <p>Scan these QR codes to access the interactive artwork panels on your mobile device.</p>
            <div class="qr-grid">
        `;
        
        printableQRCodes.forEach(({ year, qrCode }) => {
          printHTML += `
            <div class="qr-item">
              <h3>${year}</h3>
              <img src="${qrCode}" alt="QR code for ${year}" />
              <p>Scan to view ${year} panel</p>
            </div>
          `;
        });
        
        printHTML += `
            </div>
            <footer style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
              <p>A Digital Moving Mountain - Interactive Digital Art Experience</p>
              <p>Based on "A Moving Mountain" by Dr. Gan Yu</p>
            </footer>
          </body>
          </html>
        `;
        
        printWindow.document.write(printHTML);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Failed to generate printable QR codes:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateAll}
          disabled={generating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm"
        >
          {generating ? 'Generating...' : 'Generate All QR Codes'}
        </button>

        <button
          onClick={handleGeneratePrintable}
          disabled={generating}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm"
        >
          Generate Printable Version
        </button>
      </div>

      {/* Single QR Code Display */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <QRCodeDisplay
          year={selectedYear}
          baseURL={baseURL}
          mode={mode}
          size={256}
          title={`${selectedYear} Panel`}
          description={`Scan to access the ${selectedYear} artwork panel on your mobile device`}
        />
      </div>

      {/* All Generated QR Codes */}
      {Object.keys(generatedQRCodes).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">All Generated QR Codes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(generatedQRCodes).map(([year, qrCode]) => (
              <div key={year} className="bg-white p-4 rounded-lg shadow-md text-center">
                <h4 className="text-sm font-medium text-gray-900 mb-2">{year}</h4>
                <Image
                  src={qrCode}
                  alt={`QR code for ${year}`}
                  className="w-full h-auto max-w-32 mx-auto"
                  width={128}
                  height={128}
                />
                <p className="text-xs text-gray-500 mt-2">Scan to view {year} panel</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Select a year to generate individual QR codes</li>
          <li>• Use &quot;Generate All QR Codes&quot; to create QR codes for all panels</li>
          <li>• Use &quot;Generate Printable Version&quot; to create a printer-friendly page</li>
          <li>• QR codes link to the mobile-optimized artwork viewer</li>
          <li>• Visitors can scan these codes to access the interactive canvas</li>
        </ul>
      </div>
    </div>
  );
}