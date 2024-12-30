// Inspired by https://ui.aceternity.com/components/evervault-card

import { useMotionValue, useMotionTemplate, motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { generateRandomString } from "../lib/utils";

export const EvervaultCard = ({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);
 
  const [randomString, setRandomString] = useState("");
 
  useEffect(() => {
    let str = generateRandomString(1500);
    setRandomString(str);
  }, []);
 
  function onMouseMove({ currentTarget, clientX, clientY }: any) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
 
    const str = generateRandomString(1500);
    setRandomString(str);
  }
 
  return (
    <div
      className={cn(
        "absolute inset-0 bg-transparent",
        className
      )}
    >
      <div
        onMouseMove={onMouseMove}
        className="w-full h-full relative overflow-hidden bg-transparent"
      >
        <CardPattern
          mouseX={mouseX}
          mouseY={mouseY}
          randomString={randomString}
        />
      </div>
    </div>
  );
};

function CardPattern({ mouseX, mouseY, randomString }: any) {
  let maskImage = useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`;
  let style = { maskImage, WebkitMaskImage: maskImage };
 
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-100 mix-blend-overlay transition duration-500"
        style={style}
      >
        <p className="absolute inset-x-0 text-[8px] h-full break-words whitespace-pre-wrap text-white font-mono font-bold transition duration-500 overflow-hidden">
          {randomString}
        </p>
      </motion.div>
    </div>
  );
} 