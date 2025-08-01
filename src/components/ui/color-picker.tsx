'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
  compact?: boolean;
}

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'White', value: '#ffffff' },
];

export function ColorPicker({ selectedColor, onColorChange, className, compact = false }: ColorPickerProps) {
  if (compact) {
    // Render as a single button that cycles through colors
    const currentColorIndex = COLORS.findIndex(c => c.value === selectedColor);
    const currentColor = COLORS[currentColorIndex] || COLORS[0];
    
    const handleClick = () => {
      const nextIndex = (currentColorIndex + 1) % COLORS.length;
      onColorChange(COLORS[nextIndex].value);
    };
    
    return (
      <button
        type="button"
        className={cn(
          "w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-all",
          className
        )}
        style={{ backgroundColor: currentColor.value }}
        onClick={handleClick}
        title={`Color: ${currentColor.name} (click to change)`}
      />
    );
  }

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