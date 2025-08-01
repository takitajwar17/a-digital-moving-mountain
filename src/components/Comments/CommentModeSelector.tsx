'use client';

import { useState } from 'react';
import { MessageSquare, Paintbrush, X } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CommentModal from '@/components/Input/CommentModal';
import DrawingCanvas from '@/components/Drawing/DrawingCanvas';
import { cn } from '@/lib/utils';

interface CommentModeSelectorProps {
  onSubmitText: (text: string) => void;
  onSubmitDrawing: (imageData: string, text?: string) => void;
  onCancel: () => void;
  className?: string;
}

export default function CommentModeSelector({
  onSubmitText,
  onSubmitDrawing,
  onCancel,
  className = ''
}: CommentModeSelectorProps) {
  const [mode, setMode] = useState<'text' | 'drawing'>('text');

  const handleTextSubmit = (text: string) => {
    onSubmitText(text);
  };

  const handleDrawingSubmit = (imageData: string, text?: string) => {
    onSubmitDrawing(imageData, text);
  };

  return (
    <div 
      className={cn("w-full max-w-md bg-white rounded-xl border shadow-lg", className)}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold leading-none">Add Comment</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'text' | 'drawing')}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="text" className="flex items-center gap-2 bg-white data-[state=active]:bg-white">
              <MessageSquare className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="drawing" className="flex items-center gap-2 bg-white data-[state=active]:bg-white">
              <Paintbrush className="h-4 w-4" />
              Draw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <CommentModal
              onSubmit={handleTextSubmit}
              onCancel={onCancel}
              className="border-none shadow-none bg-transparent"
              embedded={true}
            />
          </TabsContent>

          <TabsContent value="drawing" className="mt-4">
            <DrawingCanvas
              onSave={handleDrawingSubmit}
              onCancel={onCancel}
              className="border-none shadow-none bg-transparent"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}