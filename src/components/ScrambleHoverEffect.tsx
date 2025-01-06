import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

const CELL_SIZE = 20; // Smaller cells for denser text
const MAX_RADIUS = 300; // Maximum effect radius for performance
const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?アイウエオカキクケコサシスセソタチツ';
const CLEANUP_DELAY = 100; // Delay before starting to remove cells

interface GridCell {
  content: string;
  lastUpdate: number;
}

interface ScrambleEffectProps {
  radiusSize?: number;
  textColor?: string;
  gradientColors?: string;
  className?: string;
}

export const ScrambleHoverEffect: React.FC<ScrambleEffectProps> = ({
  radiusSize = Math.min(250, MAX_RADIUS),
  textColor = 'rgba(255, 255, 255, 0.7)',
  gradientColors = 'transparent, rgba(255, 255, 255, 0.1)',
  className = '',
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState<{ [key: string]: GridCell }>({});
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const generateCellContent = useCallback(() => {
    return Array(3).fill(0)
      .map(() => CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)])
      .join('');
  }, []);

  const maskImage = useMotionTemplate`radial-gradient(${radiusSize}px at ${mouseX}px ${mouseY}px, ${gradientColors})`;
  const backgroundImage = useMotionTemplate`linear-gradient(to right, rgba(124, 58, 237, 0.5), rgba(236, 72, 153, 0.5))`;

  // Cleanup old cells
  const cleanupOldCells = useCallback(() => {
    const now = Date.now();
    setGrid(prevGrid => {
      const newGrid = { ...prevGrid };
      let hasChanges = false;
      
      Object.entries(newGrid).forEach(([key, cell]) => {
        if (now - cell.lastUpdate > 500) { // Remove cells older than 500ms
          delete newGrid[key];
          hasChanges = true;
        }
      });
      
      return hasChanges ? newGrid : prevGrid;
    });
  }, []);

  // Setup cleanup interval
  useEffect(() => {
    const cleanupInterval = setInterval(cleanupOldCells, 100);
    return () => clearInterval(cleanupInterval);
  }, [cleanupOldCells]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX.set(x);
    mouseY.set(y);

    const centerCellX = Math.floor(x / CELL_SIZE);
    const centerCellY = Math.floor(y / CELL_SIZE);
    const radius = Math.ceil(radiusSize / CELL_SIZE);
    const now = Date.now();

    setGrid(prevGrid => {
      const newGrid = { ...prevGrid };
      
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const cellX = centerCellX + dx;
          const cellY = centerCellY + dy;
          
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
            const key = `${cellX},${cellY}`;
            if (!newGrid[key] || Math.random() < 0.3) {
              newGrid[key] = {
                content: generateCellContent(),
                lastUpdate: now
              };
            } else {
              // Update timestamp for existing cells within radius
              newGrid[key].lastUpdate = now;
            }
          }
        }
      }

      return newGrid;
    });
  }, [generateCellContent, radiusSize]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`absolute inset-0 overflow-hidden pointer-events-auto ${className}`}
      style={{ pointerEvents: 'all' }}
    >
      <motion.div
        className="absolute inset-0 mix-blend-overlay backdrop-blur-[1px]"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          backgroundImage,
          pointerEvents: 'none'
        }}
      >
        {Object.entries(grid).map(([key, cell]) => {
          const [x, y] = key.split(',').map(Number);
          const age = Date.now() - cell.lastUpdate;
          const opacity = Math.max(0, 1 - age / 500); // Fade out over 500ms
          
          return (
            <motion.div
              key={key}
              className="absolute font-mono font-bold pointer-events-none select-none"
              style={{
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                color: textColor,
                fontSize: '12px',
                lineHeight: '12px',
                opacity,
              }}
            >
              {cell.content}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ScrambleHoverEffect;