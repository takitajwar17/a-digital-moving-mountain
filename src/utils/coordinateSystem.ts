export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface RelativePosition {
  x: number; // 0-1 relative to canvas width
  y: number; // 0-1 relative to canvas height
}

export interface AbsolutePosition {
  x: number; // pixel position
  y: number; // pixel position
}

/**
 * Convert relative position (0-1) to absolute pixel position
 */
export function relativeToAbsolute(
  relative: RelativePosition,
  dimensions: Dimensions
): AbsolutePosition {
  return {
    x: relative.x * dimensions.width,
    y: relative.y * dimensions.height
  };
}

/**
 * Convert absolute pixel position to relative position (0-1)
 */
export function absoluteToRelative(
  absolute: AbsolutePosition,
  dimensions: Dimensions
): RelativePosition {
  return {
    x: absolute.x / dimensions.width,
    y: absolute.y / dimensions.height
  };
}

/**
 * Check if a position is within the canvas bounds
 */
export function isPositionInBounds(
  position: RelativePosition,
  tolerance: number = 0
): boolean {
  return (
    position.x >= -tolerance &&
    position.x <= 1 + tolerance &&
    position.y >= -tolerance &&
    position.y <= 1 + tolerance
  );
}

/**
 * Clamp a position to stay within canvas bounds
 */
export function clampPosition(
  position: RelativePosition,
  margin: number = 0
): RelativePosition {
  return {
    x: Math.max(margin, Math.min(1 - margin, position.x)),
    y: Math.max(margin, Math.min(1 - margin, position.y))
  };
}

/**
 * Calculate distance between two positions
 */
export function getDistance(
  pos1: Position,
  pos2: Position
): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find the closest position from a list of positions
 */
export function findClosestPosition(
  target: Position,
  positions: Position[]
): { position: Position; distance: number; index: number } | null {
  if (positions.length === 0) return null;

  let closest = positions[0];
  let minDistance = getDistance(target, closest);
  let closestIndex = 0;

  for (let i = 1; i < positions.length; i++) {
    const distance = getDistance(target, positions[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closest = positions[i];
      closestIndex = i;
    }
  }

  return {
    position: closest,
    distance: minDistance,
    index: closestIndex
  };
}

/**
 * Check if two positions are too close to each other
 */
export function arePositionsTooClose(
  pos1: Position,
  pos2: Position,
  minDistance: number
): boolean {
  return getDistance(pos1, pos2) < minDistance;
}

/**
 * Find a suitable position for a new comment avoiding collisions
 */
export function findAvailablePosition(
  preferredPosition: RelativePosition,
  existingPositions: RelativePosition[],
  minDistance: number = 0.03, // 3% of canvas size
  maxAttempts: number = 50
): RelativePosition {
  let bestPosition = preferredPosition;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const hasCollision = existingPositions.some(existing =>
      arePositionsTooClose(bestPosition, existing, minDistance)
    );

    if (!hasCollision && isPositionInBounds(bestPosition, 0.02)) {
      return clampPosition(bestPosition, 0.02);
    }

    // Try a new position in a spiral pattern around the preferred position
    const angle = (attempts / maxAttempts) * Math.PI * 2 * 4; // 4 full rotations
    const radius = (attempts / maxAttempts) * 0.1; // Up to 10% of canvas size

    bestPosition = {
      x: preferredPosition.x + Math.cos(angle) * radius,
      y: preferredPosition.y + Math.sin(angle) * radius
    };

    attempts++;
  }

  // If we couldn't find a good position, return the clamped preferred position
  return clampPosition(preferredPosition, 0.02);
}

/**
 * Transform coordinates based on zoom and pan
 */
export function transformCoordinates(
  position: Position,
  zoom: number,
  pan: Position
): Position {
  return {
    x: position.x * zoom + pan.x,
    y: position.y * zoom + pan.y
  };
}

/**
 * Inverse transform coordinates (from screen to canvas)
 */
export function inverseTransformCoordinates(
  screenPosition: Position,
  zoom: number,
  pan: Position
): Position {
  return {
    x: (screenPosition.x - pan.x) / zoom,
    y: (screenPosition.y - pan.y) / zoom
  };
}

/**
 * Get the visible bounds of the canvas given current zoom and pan
 */
export function getVisibleBounds(
  canvasSize: Dimensions,
  viewportSize: Dimensions,
  zoom: number,
  pan: Position
): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} {
  const left = -pan.x / zoom;
  const top = -pan.y / zoom;
  const right = left + viewportSize.width / zoom;
  const bottom = top + viewportSize.height / zoom;

  return { left, top, right, bottom };
}

/**
 * Check if a position is visible in the current viewport
 */
export function isPositionVisible(
  position: RelativePosition,
  canvasSize: Dimensions,
  viewportSize: Dimensions,
  zoom: number,
  pan: Position
): boolean {
  const absolutePos = relativeToAbsolute(position, canvasSize);
  const bounds = getVisibleBounds(canvasSize, viewportSize, zoom, pan);

  return (
    absolutePos.x >= bounds.left &&
    absolutePos.x <= bounds.right &&
    absolutePos.y >= bounds.top &&
    absolutePos.y <= bounds.bottom
  );
}

/**
 * Generate a grid of positions for systematic placement
 */
export function generateGrid(
  dimensions: Dimensions,
  spacing: number = 0.1
): RelativePosition[] {
  const positions: RelativePosition[] = [];
  
  for (let x = spacing; x < 1 - spacing; x += spacing) {
    for (let y = spacing; y < 1 - spacing; y += spacing) {
      positions.push({ x, y });
    }
  }
  
  return positions;
}

/**
 * Create a random position within bounds
 */
export function randomPosition(
  margin: number = 0.05
): RelativePosition {
  return {
    x: margin + Math.random() * (1 - 2 * margin),
    y: margin + Math.random() * (1 - 2 * margin)
  };
}