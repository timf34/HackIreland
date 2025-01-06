import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

const CELL_SIZE = 50; // Size of each grid cell in pixels
const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';

interface ScrambleEffectProps {
  radiusSize?: number;
  textColor?: string;
  gradientColors?: string;
  className?: string;
}

export const ScrambleHoverEffect: React.FC<ScrambleEffectProps> = ({
  radiusSize = 400,
  textColor = 'rgba(255, 255, 255, 0.5)',
  gradientColors = 'white, transparent',
  className = '',
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState<{ [key: string]: string }>({});
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const maskImage = useMotionTemplate`radial-gradient(${radiusSize}px at ${mouseX}px ${mouseY}px, ${gradientColors})`;

  const generateCellContent = useCallback(() => {
    return Array(16).fill(0)
      .map(() => CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)])
      .join('');
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
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

    const newGrid = { ...grid };
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const cellX = centerCellX + dx;
        const cellY = centerCellY + dy;
        const key = `${cellX},${cellY}`;
        
        if (!newGrid[key]) {
          newGrid[key] = generateCellContent();
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
        className="absolute inset-0"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          pointerEvents: 'none'
        }}
      >
        {Object.entries(grid).map(([key, content]) => {
          const [x, y] = key.split(',').map(Number);
          return (
            <div
              key={key}
              className="absolute font-mono text-xs whitespace-pre pointer-events-none"
              style={{
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                color: textColor,
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