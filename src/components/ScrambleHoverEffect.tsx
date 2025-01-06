import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

const CELL_SIZE = 20;
const MAX_RADIUS = 100;
const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const UPDATE_RATE = 100;

interface GridCell {
  content: string;
  lastUpdate: number;
  isUnderMouse: boolean;
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
  gradientColors = 'transparent',
  className = '',
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState<{ [key: string]: GridCell }>({});
  const [lastMousePosition, setLastMousePosition] = useState<{ x: number, y: number } | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const generateCellContent = useCallback(() => {
    return Array(3).fill(0)
      .map(() => CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)])
      .join('');
  }, []);

  const maskImage = useMotionTemplate`radial-gradient(${radiusSize * 2}px at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.1) 30%, transparent 100%)`;

  // Set up periodic text scrambling for cells under mouse
  useEffect(() => {
    if (!lastMousePosition) return;

    const updateCellsUnderMouse = () => {
      const { x, y } = lastMousePosition;
      const centerCellX = Math.floor(x / CELL_SIZE);
      const centerCellY = Math.floor(y / CELL_SIZE);
      const radius = Math.ceil(radiusSize / CELL_SIZE);

      setGrid(prevGrid => {
        const newGrid = { ...prevGrid };
        for (let dx = -radius; dx <= radius; dx++) {
          for (let dy = -radius; dy <= radius; dy++) {
            const cellX = centerCellX + dx;
            const cellY = centerCellY + dy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius) {
              const key = `${cellX},${cellY}`;
              if (Math.random() < 0.3) {
                newGrid[key] = {
                  content: generateCellContent(),
                  lastUpdate: Date.now(),
                  isUnderMouse: true
                };
              } else if (!newGrid[key]) {
                newGrid[key] = {
                  content: generateCellContent(),
                  lastUpdate: Date.now(),
                  isUnderMouse: true
                };
              }
            }
          }
        }
        return newGrid;
      });
    };

    updateIntervalRef.current = setInterval(updateCellsUnderMouse, UPDATE_RATE);
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [lastMousePosition, radiusSize, generateCellContent]);

  // Clean up old cells that are not under the mouse
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setGrid(prevGrid => {
        const now = Date.now();
        const newGrid = { ...prevGrid };
        let hasChanges = false;

        Object.entries(newGrid).forEach(([key, cell]) => {
          if (!cell.isUnderMouse && now - cell.lastUpdate > 500) {
            delete newGrid[key];
            hasChanges = true;
          }
        });

        return hasChanges ? newGrid : prevGrid;
      });
    }, 100);

    return () => clearInterval(cleanupInterval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX.set(x);
    mouseY.set(y);
    setLastMousePosition({ x, y });

    const centerCellX = Math.floor(x / CELL_SIZE);
    const centerCellY = Math.floor(y / CELL_SIZE);
    const radius = Math.ceil(radiusSize / CELL_SIZE);

    setGrid(prevGrid => {
      const newGrid = { ...prevGrid };
      Object.keys(newGrid).forEach(key => {
        newGrid[key].isUnderMouse = false;
      });

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const cellX = centerCellX + dx;
          const cellY = centerCellY + dy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance <= radius) {
            const key = `${cellX},${cellY}`;
            newGrid[key] = {
              content: generateCellContent(),
              lastUpdate: Date.now(),
              isUnderMouse: true
            };
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
      {/* Background gradient that shows through mask */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-80 mix-blend-overlay transition duration-500"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          pointerEvents: 'none',
          backdropFilter: 'blur(1px)'
        }}
      >
        {/* Scrambled text layer */}
        <div className="absolute inset-0">
          {Object.entries(grid).map(([key, cell]) => {
            const [x, y] = key.split(',').map(Number);
            const opacity = cell.isUnderMouse ? 1 : 
              Math.max(0, 1 - (Date.now() - cell.lastUpdate) / 500);
            
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
        </div>
      </motion.div>
    </div>
  );
};

export default ScrambleHoverEffect;