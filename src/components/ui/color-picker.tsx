'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
}

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'White', value: '#ffffff' },
];

export function ColorPicker({ selectedColor, onColorChange, className }: ColorPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium leading-none">Color</label>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((color) => (
          <Button
            key={color.value}
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "w-8 h-8 p-0 rounded-full border-2 transition-all",
              selectedColor === color.value 
                ? "ring-2 ring-offset-2 ring-offset-background" 
                : "hover:scale-110"
            )}
            style={{ 
              backgroundColor: color.value,
              borderColor: selectedColor === color.value ? color.value : '#e5e7eb'
            }}
            onClick={() => onColorChange(color.value)}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
}