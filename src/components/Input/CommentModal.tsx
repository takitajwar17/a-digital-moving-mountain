'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from '@/components/ui/color-picker';
import { cn } from '@/lib/utils';

interface CommentInputProps {
  onSubmit: (text: string, color: string) => void;
  onCancel: () => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  embedded?: boolean; // New prop to control modal vs embedded mode
}

export default function CommentModal({
  onSubmit,
  onCancel,
  placeholder = 'Share your thoughts...',
  maxLength = 280,
  className = '',
  embedded = false
}: CommentInputProps) {
  const [text, setText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the textarea after a brief delay to ensure modal is fully rendered
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(text.trim(), selectedColor);
      setText('');
      setSelectedColor('#000000');
      if (!embedded) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (embedded) {
      onCancel();
    } else {
      setIsOpen(false);
      setTimeout(onCancel, 200); // Wait for modal close animation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const remainingChars = maxLength - text.length;
  const isNearLimit = remainingChars <= 20;
  const isOverLimit = remainingChars < 0;

  // Embedded mode - render without Dialog wrapper
  if (embedded) {
    return (
      <div className={cn("w-full h-full bg-white rounded-xl border shadow-sm flex flex-col", className)}>
        <div className="p-2 flex-1 flex flex-col">
          <form onSubmit={handleSubmit} className="h-full flex flex-col space-y-2">
            {/* Color Picker */}
            <ColorPicker
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
            
            <div className="flex-1 flex flex-col space-y-2">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                  "resize-none bg-white flex-1 min-h-[60px] text-sm",
                  isOverLimit && "border-destructive focus-visible:ring-destructive/20"
                )}
                maxLength={maxLength + 50}
              />
              
              {/* Character count */}
              <div className="flex justify-end text-xs text-muted-foreground">
                <span className={cn(
                  isOverLimit ? "text-destructive" : 
                  isNearLimit ? "text-yellow-600" : "text-muted-foreground"
                )}>
                  {text.length}/{maxLength}
                </span>
              </div>
            </div>
          </form>
        </div>
        
        <div className="flex justify-between px-2 pb-2 border-t pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="h-8 text-xs"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isSubmitting || isOverLimit}
            className="h-8 text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-3 w-3 mr-1" />
                Post
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Full modal mode
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className={cn("w-[47.5vw] max-w-[300px] h-[45vh] max-h-[250px] bg-white", className)}
        onPointerDownOutside={handleCancel}
        onEscapeKeyDown={handleCancel}
      >
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base">Add Your Comment</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Share your thoughts about this artwork
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Color Picker */}
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
          
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={3}
              className={cn(
                "resize-none bg-white min-h-[60px] text-sm",
                isOverLimit && "border-destructive focus-visible:ring-destructive/20"
              )}
              maxLength={maxLength + 50}
              style={{ fontSize: '14px' }} // Prevent zoom on iOS
            />
            
            {/* Character count */}
            <div className="flex justify-end text-xs text-muted-foreground">
              <span className={cn(
                isOverLimit ? "text-destructive" : 
                isNearLimit ? "text-yellow-600" : "text-muted-foreground"
              )}>
                {text.length}/{maxLength}
              </span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="h-8 text-xs sm:h-8 sm:text-xs order-2 sm:order-1"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!text.trim() || isSubmitting || isOverLimit}
              className="h-8 text-xs sm:h-8 sm:text-xs order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-1" />
                  Post Comment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Helpful hint - hide on mobile */}
        <div className="hidden sm:block text-[10px] text-muted-foreground text-center mt-1">
          Press Cmd/Ctrl + Enter to post quickly
        </div>
      </DialogContent>
    </Dialog>
  );
}