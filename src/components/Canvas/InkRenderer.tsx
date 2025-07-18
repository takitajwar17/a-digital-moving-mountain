'use client';

import { useEffect, useRef, useState } from 'react';
import { Comment } from '@/types/comment';
import { getLanguageDirection, getLanguageScript } from '@/utils/languageDetection';

interface InkRendererProps {
  comment: Comment;
  panelDimensions: { width: number; height: number };
  onAnimationComplete?: () => void;
  animate?: boolean;
  className?: string;
}

export default function InkRenderer({
  comment,
  panelDimensions,
  onAnimationComplete,
  animate = true,
  className = ''
}: InkRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  const direction = getLanguageDirection(comment.language || 'en');
  const script = getLanguageScript(comment.language || 'en');

  // Calculate position and size
  const x = comment.position.x * panelDimensions.width;
  const y = comment.position.y * panelDimensions.height;
  const maxWidth = Math.min(200, panelDimensions.width * 0.3);
  const fontSize = script === 'chinese' || script === 'japanese' ? 14 : 12;

  // Ink brush effects based on language/script
  const getInkStyle = () => {
    switch (script) {
      case 'chinese':
      case 'japanese':
        return {
          strokeWidth: 2,
          brush: 'calligraphy',
          opacity: 0.8,
          color: '#1a1a1a'
        };
      case 'arabic':
        return {
          strokeWidth: 1.5,
          brush: 'naskh',
          opacity: 0.85,
          color: '#2d2d2d'
        };
      case 'devanagari':
        return {
          strokeWidth: 1.2,
          brush: 'devanagari',
          opacity: 0.9,
          color: '#333333'
        };
      default:
        return {
          strokeWidth: 1,
          brush: 'western',
          opacity: 0.7,
          color: '#4a4a4a'
        };
    }
  };

  const inkStyle = getInkStyle();

  // Animation effect
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        
        // Animate ink flowing
        const duration = 2000;
        const startTime = Date.now();
        
        const animateInk = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          setAnimationProgress(progress);
          
          if (progress < 1) {
            requestAnimationFrame(animateInk);
          } else {
            onAnimationComplete?.();
          }
        };
        
        requestAnimationFrame(animateInk);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
      setAnimationProgress(1);
    }
  }, [animate, onAnimationComplete]);

  // Generate ink brush path
  const generateInkPath = (text: string, width: number) => {
    const chars = text.split('');
    let path = '';
    const charWidth = width / chars.length;
    
    chars.forEach((char, index) => {
      const charX = index * charWidth;
      const variation = Math.sin(index * 0.5) * 2;
      
      // Create brush-like stroke for each character
      path += `M ${charX} ${variation} Q ${charX + charWidth * 0.3} ${-variation} ${charX + charWidth * 0.7} ${variation * 0.5} T ${charX + charWidth} ${variation}`;
    });
    
    return path;
  };

  // Generate paper texture effect
  const generatePaperTexture = () => {
    const dots = [];
    for (let i = 0; i < 20; i++) {
      dots.push({
        x: Math.random() * maxWidth,
        y: Math.random() * 60,
        size: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.1 + 0.02
      });
    }
    return dots;
  };

  const paperTexture = generatePaperTexture();

  if (!isVisible) return null;

  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        maxWidth: `${maxWidth}px`,
        direction: direction
      }}
    >
      <svg
        ref={svgRef}
        width={maxWidth}
        height="80"
        className="absolute inset-0"
        style={{ filter: 'url(#inkEffect)' }}
      >
        <defs>
          {/* Ink brush effect filter */}
          <filter id="inkEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              baseFrequency="0.04"
              numOctaves="3"
              result="noise"
              seed="2"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1"
              result="displacement"
            />
            <feGaussianBlur
              in="displacement"
              stdDeviation="0.3"
              result="blur"
            />
            <feDropShadow
              dx="0.5"
              dy="0.5"
              stdDeviation="0.5"
              floodColor="#000000"
              floodOpacity="0.1"
            />
          </filter>

          {/* Paper texture */}
          <pattern id="paperTexture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="#fefefe" />
            {paperTexture.map((dot, index) => (
              <circle
                key={index}
                cx={dot.x}
                cy={dot.y}
                r={dot.size}
                fill="#e8e8e8"
                opacity={dot.opacity}
              />
            ))}
          </pattern>
        </defs>

        {/* Background paper */}
        <rect
          width={maxWidth}
          height="80"
          fill="url(#paperTexture)"
          rx="4"
          opacity="0.9"
        />

        {/* Ink brush strokes */}
        <path
          d={generateInkPath(comment.text || '', maxWidth - 20)}
          stroke={inkStyle.color}
          strokeWidth={inkStyle.strokeWidth}
          fill="none"
          opacity={inkStyle.opacity * animationProgress}
          strokeDasharray={animate ? "0 1000" : "none"}
          strokeDashoffset={animate ? 1000 * (1 - animationProgress) : 0}
          style={{
            transition: 'stroke-dashoffset 2s ease-in-out'
          }}
        />
      </svg>

      {/* Text content */}
      <div
        className="relative z-10 p-3 text-gray-800"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1.4',
          fontFamily: getFontFamily(script),
          textAlign: direction === 'rtl' ? 'right' : 'left',
          opacity: animationProgress,
          transition: 'opacity 0.5s ease-in-out'
        }}
      >
        <div className="break-words">
          {comment.text}
        </div>
        
        {/* Metadata */}
        <div className="text-xs text-gray-500 mt-1 opacity-60">
          {new Date(comment.timestamp).toLocaleDateString()}
        </div>
      </div>

      {/* Ink drip effect */}
      {animate && animationProgress > 0.5 && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div
            className="w-0.5 bg-gray-600 rounded-full opacity-30"
            style={{
              height: `${Math.random() * 8 + 4}px`,
              animation: 'inkDrip 1s ease-out'
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes inkDrip {
          0% {
            height: 0;
            opacity: 0.5;
          }
          100% {
            height: ${Math.random() * 8 + 4}px;
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  );
}

function getFontFamily(script: string): string {
  switch (script) {
    case 'chinese':
      return '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
    case 'japanese':
      return '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif';
    case 'korean':
      return '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans CJK KR", sans-serif';
    case 'arabic':
      return '"Geeza Pro", "Arabic Typesetting", "Tahoma", sans-serif';
    case 'devanagari':
      return '"Devanagari Sangam MN", "Noto Sans Devanagari", "Mangal", sans-serif';
    case 'cyrillic':
      return '"Helvetica Neue", "Arial", sans-serif';
    case 'thai':
      return '"Thonburi", "Leelawadee UI", "Tahoma", sans-serif';
    default:
      return '"Helvetica Neue", "Arial", sans-serif';
  }
}