// Inspired by https://ui.aceternity.com/components/evervault-card

// TODO: Make this more efficient so it works across the larger Sponsors section! 
//  Think of what John Carmack might do! Should ideally only render within the radius of the mouse I guess, and slightly beyond it. 

import { useMotionValue, useMotionTemplate, motion } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "../lib/utils";
import { generateRandomString } from "../lib/utils";

export const EvervaultCard = ({
  className,
  radiusSize = 250,
  fontSize = "8px",
  lineHeight = "8px",
  textUpdateRate = 100,
  baseTextLength = 50,
  textMultiplier = 100,
  gradientStyle = "white, transparent",
}: {
  className?: string;
  radiusSize?: number;
  fontSize?: string;
  lineHeight?: string;
  textUpdateRate?: number;
  baseTextLength?: number;
  textMultiplier?: number;
  gradientStyle?: string;
}) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);
 
  const [randomString, setRandomString] = useState("");
  const [lastUpdate, setLastUpdate] = useState(0);
 
  // Generate initial text
  useEffect(() => {
    const baseStr = generateRandomString(baseTextLength);
    const str = baseStr.repeat(textMultiplier);
    setRandomString(str);
  }, [baseTextLength, textMultiplier]);
 
  // Throttled mouse move handler
  const onMouseMove = useCallback(({ currentTarget, clientX, clientY }: any) => {
    const now = Date.now();
    if (now - lastUpdate < textUpdateRate) return;

    const rect = currentTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
 
    const baseStr = generateRandomString(baseTextLength);
    const str = baseStr.repeat(textMultiplier);
    setRandomString(str);
    setLastUpdate(now);
  }, [lastUpdate, textUpdateRate, baseTextLength, textMultiplier]);
 
  return (
    <div
      className={cn(
        "absolute inset-0 bg-transparent",
        className
      )}
      onMouseMove={onMouseMove}
    >
      <CardPattern
        mouseX={mouseX}
        mouseY={mouseY}
        randomString={randomString}
        radiusSize={radiusSize}
        fontSize={fontSize}
        lineHeight={lineHeight}
        gradientStyle={gradientStyle}
      />
    </div>
  );
};

function CardPattern({ 
  mouseX, 
  mouseY, 
  randomString, 
  radiusSize,
  fontSize,
  lineHeight,
  gradientStyle 
}: any) {
  const maskImage = useMotionTemplate`radial-gradient(${radiusSize}px at ${mouseX}px ${mouseY}px, ${gradientStyle})`;
  const style = useMemo(() => ({ 
    maskImage, 
    WebkitMaskImage: maskImage 
  }), [maskImage]);
 
  return (
    <div className="pointer-events-none absolute inset-0 w-full h-full">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-100 mix-blend-overlay transition duration-500 w-full h-full backdrop-blur-sm"
        style={style}
      >
        <div className="absolute inset-0 w-full h-full">
          <p 
            className={cn(
              "break-words whitespace-pre-wrap text-white font-mono font-bold transition duration-500",
            )}
            style={{ 
              fontSize, 
              lineHeight 
            }}
          >
            {randomString}
          </p>
        </div>
      </motion.div>
    </div>
  );
} 