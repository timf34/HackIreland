// Inspired by https://ui.aceternity.com/components/evervault-card

import { useMotionValue, useMotionTemplate, motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { generateRandomString } from "../lib/utils";

export const EvervaultCard = ({
  text,
  className,
  radiusSize = 250,
}: {
  text?: string;
  className?: string;
  radiusSize?: number;
}) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);
 
  const [randomString, setRandomString] = useState("");
 
  useEffect(() => {
    let str = generateRandomString(20000);
    setRandomString(str);
  }, []);
 
  function onMouseMove({ currentTarget, clientX, clientY }: any) {
    const rect = currentTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
 
    const str = generateRandomString(20000);
    setRandomString(str);
  }
 
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
      />
    </div>
  );
};

function CardPattern({ mouseX, mouseY, randomString, radiusSize }: any) {
  let maskImage = useMotionTemplate`radial-gradient(${radiusSize}px at ${mouseX}px ${mouseY}px, white, transparent)`;
  let style = { maskImage, WebkitMaskImage: maskImage };
 
  return (
    <div className="pointer-events-none absolute inset-0 w-full h-full">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-100 mix-blend-overlay transition duration-500 w-full h-full"
        style={style}
      >
        <div className="absolute inset-0 w-full h-full">
          <p className="text-[10px] leading-[10px] break-words whitespace-pre-wrap text-white font-mono font-bold transition duration-500">
            {randomString}
          </p>
        </div>
      </motion.div>
    </div>
  );
} 