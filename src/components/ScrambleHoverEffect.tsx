import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

const CELL_SIZE = 20; // Smaller cells for denser text
const MAX_RADIUS = 300; // Maximum effect radius for performance
const CHAR_POOL = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ';

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
  const [grid, setGrid] = useState<{ [key: string]: string }>({});
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Generate text content for a cell with proper spacing
  const generateCellContent = useCallback(() => {
    return Array(3).fill(0)
      .map(() => CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)])
      .join('');
  }, []);

  // Create gradient mask and background gradients
  const maskImage = useMotionTemplate`radial-gradient(${radiusSize}px at ${mouseX}px ${mouseY}px, ${gradientColors})`;
  const backgroundImage = useMotionTemplate`linear-gradient(to right, rgba(124, 58, 237, 0.5), rgba(236, 72, 153, 0.5))`;

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

    // Calculate grid cells to update based on mouse position
    const centerCellX = Math.floor(x / CELL_SIZE);
    const centerCellY = Math.floor(y / CELL_SIZE);
    const radius = Math.ceil(radiusSize / CELL_SIZE);

    // Only update cells within the radius
    const newGrid = { ...grid };
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const cellX = centerCellX + dx;
        const cellY = centerCellY + dy;
        
        // Check if cell is within the circular radius
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          const key = `${cellX},${cellY}`;
          // Randomly decide whether to update existing cells
          if (!newGrid[key] || Math.random() < 0.3) {
            newGrid[key] = generateCellContent();
          }
        }
      }
    }

    setGrid(newGrid);
  }, [grid, generateCellContent, radiusSize]);

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
        {Object.entries(grid).map(([key, content]) => {
          const [x, y] = key.split(',').map(Number);
          return (
            <div
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
                transition: 'color 150ms ease',
              }}
            >
              {content}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ScrambleHoverEffect;