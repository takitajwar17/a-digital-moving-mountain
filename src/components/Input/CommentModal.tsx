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
      <div className={cn("w-full bg-white rounded-xl border shadow-sm", className)}>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                rows={6}
                className={cn(
                  "resize-none bg-white min-h-[150px]",
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
        
        <div className="flex justify-between px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isSubmitting || isOverLimit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
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
        className={cn("sm:max-w-md bg-white", className)}
        onPointerDownOutside={handleCancel}
        onEscapeKeyDown={handleCancel}
      >
        <DialogHeader>
          <DialogTitle>Add Your Comment</DialogTitle>
          <DialogDescription>
            Share your thoughts about this artwork with the community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              rows={6}
              className={cn(
                "resize-none bg-white min-h-[150px]",
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!text.trim() || isSubmitting || isOverLimit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Helpful hint */}
        <div className="text-xs text-muted-foreground text-center mt-2">
          Press Cmd/Ctrl + Enter to post quickly
        </div>
      </DialogContent>
    </Dialog>
  );
}