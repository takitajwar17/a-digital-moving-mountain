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
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
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