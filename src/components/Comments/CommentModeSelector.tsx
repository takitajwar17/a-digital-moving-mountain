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
  onSubmitText: (text: string, color: string) => void;
  onSubmitDrawing: (imageData: string, color: string) => void;
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

  const handleTextSubmit = (text: string, color: string) => {
    onSubmitText(text, color);
  };

  const handleDrawingSubmit = (imageData: string, color: string) => {
    onSubmitDrawing(imageData, color);
  };

  return (
    <div 
      className={cn("w-[95vw] max-w-[600px] h-[90vh] max-h-[500px] bg-white rounded-xl border shadow-lg", className)}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-lg font-semibold leading-none">Add Comment</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-10 w-10 sm:h-8 sm:w-8"
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-4 flex-1 flex flex-col">
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'text' | 'drawing')} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 mb-3 h-12 sm:h-10">
            <TabsTrigger value="text" className="flex items-center gap-2 bg-white data-[state=active]:bg-white text-base sm:text-sm h-10 sm:h-8">
              <MessageSquare className="h-5 w-5 sm:h-4 sm:w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="drawing" className="flex items-center gap-2 bg-white data-[state=active]:bg-white text-base sm:text-sm h-10 sm:h-8">
              <Paintbrush className="h-5 w-5 sm:h-4 sm:w-4" />
              Draw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-0 flex-1">
            <CommentModal
              onSubmit={handleTextSubmit}
              onCancel={onCancel}
              className="border-none shadow-none bg-transparent h-full"
              embedded={true}
            />
          </TabsContent>

          <TabsContent value="drawing" className="mt-0 flex-1">
            <DrawingCanvas
              onSave={handleDrawingSubmit}
              onCancel={onCancel}
              className="border-none shadow-none bg-transparent h-full"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}