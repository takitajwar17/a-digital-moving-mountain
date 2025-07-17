'use client';

import { useState } from 'react';
import { Comment } from '@/types/comment';
import CommentInput from '../Input/CommentInput';
import InkRenderer from './InkRenderer';

interface CommentOverlayProps {
  comments: Comment[];
  onCommentClick: (comment: Comment) => void;
  panelDimensions: { width: number; height: number };
  isAddingComment: boolean;
  commentPosition: { x: number; y: number } | null;
  onCommentSubmit: (text: string) => void;
  onCommentCancel: () => void;
}

export default function CommentOverlay({
  comments,
  onCommentClick,
  panelDimensions,
  isAddingComment,
  commentPosition,
  onCommentSubmit,
  onCommentCancel
}: CommentOverlayProps) {
  const [hoveredComment, setHoveredComment] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Existing Comments */}
      {comments.map((comment) => (
        <div key={comment.id} className="absolute">
          <InkRenderer
            comment={comment}
            panelDimensions={panelDimensions}
            animate={true}
            className="cursor-pointer"
            onAnimationComplete={() => console.log(`Animation complete for comment ${comment.id}`)}
          />
        </div>
      ))}

      {/* New Comment Input */}
      {isAddingComment && commentPosition && (
        <div
          className="absolute pointer-events-auto"
          style={{
            left: `${commentPosition.x * panelDimensions.width}px`,
            top: `${commentPosition.y * panelDimensions.height}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <CommentInput
            onSubmit={onCommentSubmit}
            onCancel={onCommentCancel}
            placeholder="Share your thoughts..."
            maxLength={280}
          />
        </div>
      )}
    </div>
  );
}