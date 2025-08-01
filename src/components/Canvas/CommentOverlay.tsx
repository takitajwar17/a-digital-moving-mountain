'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Comment } from '@/types/comment';
import CommentModeSelector from '../Comments/CommentModeSelector';

interface CommentOverlayProps {
  comments: Comment[];
  onCommentClick: (comment: Comment) => void;
  panelDimensions: { width: number; height: number };
  isAddingComment: boolean;
  commentPosition: { x: number; y: number } | null;
  clickScreenPosition?: { x: number; y: number } | null;
  onCommentSubmit: (text: string, color: string) => void;
  onDrawingSubmit: (imageData: string, color: string) => void;
  onCommentCancel: () => void;
}

// Smart positioning to avoid edge cutoffs
function getModalTransform(
  position: { x: number; y: number },
  panelDimensions: { width: number; height: number },
  clickPosition?: { x: number; y: number }
): { transform: string; position: 'fixed' | 'absolute'; fixedStyles?: React.CSSProperties } {
  const modalWidth = 400; // actual modal width
  const modalHeight = 300; // actual modal height
  
  // Always use fixed positioning to escape container constraints
  if (typeof window !== 'undefined' && clickPosition) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let left = clickPosition.x;
    let top = clickPosition.y;
    
    // Adjust horizontal position to keep modal within viewport
    if (left + modalWidth / 2 > windowWidth) {
      left = windowWidth - modalWidth / 2 - 20; // 20px margin
    }
    if (left - modalWidth / 2 < 0) {
      left = modalWidth / 2 + 20; // 20px margin
    }
    
    // Adjust vertical position to keep modal within viewport
    if (top + modalHeight / 2 > windowHeight) {
      top = windowHeight - modalHeight / 2 - 20; // 20px margin
    }
    if (top - modalHeight / 2 < 0) {
      top = modalHeight / 2 + 20; // 20px margin
    }
    
    return {
      position: 'fixed',
      transform: 'translate(-50%, -50%)',
      fixedStyles: {
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
        margin: 0,
        padding: 0
      }
    };
  }
  
  // Fallback for mobile or when no click position
  return {
    position: 'fixed',
    transform: 'translate(-50%, -50%)',
    fixedStyles: {
      top: '50vh',
      left: '50vw',
      zIndex: 9999,
      margin: 0,
      padding: 0
    }
  };
}

export default function CommentOverlay({
  comments,
  onCommentClick,
  panelDimensions,
  isAddingComment,
  commentPosition,
  clickScreenPosition,
  onCommentSubmit,
  onDrawingSubmit,
  onCommentCancel
}: CommentOverlayProps) {
  const [, ] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Existing Comments */}
      {comments.map((comment) => (
        <div 
          key={comment.id} 
          className="absolute pointer-events-auto"
          style={{
            left: `${comment.position.x * panelDimensions.width}px`,
            top: `${comment.position.y * panelDimensions.height}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {comment.type === 'text' ? (
            <div 
              className="bg-transparent px-4 py-3 cursor-pointer transition-all max-w-xs touch-manipulation min-h-[44px] flex items-center"
              onClick={() => onCommentClick(comment)}
              onTouchStart={() => onCommentClick(comment)}
            >
              <p 
                className="text-lg md:text-sm leading-relaxed font-medium drop-shadow-lg"
                style={{ color: comment.color || '#000000' }}
              >
                {comment.text}
              </p>
            </div>
          ) : (
            <div 
              className="bg-transparent p-2 cursor-pointer transition-all touch-manipulation min-h-[44px] flex items-center justify-center"
              onClick={() => onCommentClick(comment)}
              onTouchStart={() => onCommentClick(comment)}
            >
              <div 
                className="rounded-lg p-1"
              >
                <Image 
                  src={comment.imageData || ''} 
                  alt="User drawing" 
                  width={96}
                  height={96}
                  className="max-w-28 max-h-28 md:max-w-20 md:max-h-20 rounded drop-shadow-lg"
                  unoptimized={true}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* New Comment Input */}
      {isAddingComment && commentPosition && (() => {
        const positioning = getModalTransform(commentPosition, panelDimensions, clickScreenPosition || undefined);
        const isMobile = positioning.position === 'fixed';
        
        return (
          <>
            {/* Mobile backdrop */}
            {isMobile && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-auto"
                onClick={onCommentCancel}
                onTouchStart={onCommentCancel}
                style={{ zIndex: 999 }}
              />
            )}
            
            <div
              className="pointer-events-auto z-50"
              style={{
                position: positioning.position,
                left: positioning.position === 'fixed' ? undefined : `${commentPosition.x * panelDimensions.width}px`,
                top: positioning.position === 'fixed' ? undefined : `${commentPosition.y * panelDimensions.height}px`,
                transform: positioning.transform,
                touchAction: 'manipulation',
                ...positioning.fixedStyles
              }}
            >
              <CommentModeSelector
                onSubmitText={onCommentSubmit}
                onSubmitDrawing={onDrawingSubmit}
                onCancel={onCommentCancel}
              />
            </div>
          </>
        );
      })()}
    </div>
  );
}