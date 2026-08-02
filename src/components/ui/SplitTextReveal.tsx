"use client";
import React from "react";
import { motion, Variants } from "framer-motion";

export function SplitTextReveal({
  text,
  className = "",
  active = true,
  delay = 0,
  stagger = 0.05
}: {
  text: string;
  className?: string;
  active?: boolean;
  delay?: number;
  stagger?: number;
}) {
  // We split by spaces to keep words together, then by characters inside
  const words = text.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      }
    }
  };

  const child: Variants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      rotateX: -90,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      scale: 1,
      transition: { 
        type: "spring",
        damping: 15,
        stiffness: 150,
        mass: 0.5
      }
    }
  };

  if (!active) {
    return <div className={`opacity-0 ${className}`}>{text}</div>;
  }

  return (
    <motion.div
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
      style={{ perspective: 1000 }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex mr-[0.25em] overflow-hidden" style={{ perspective: 1000 }}>
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              variants={child}
              className="inline-block origin-bottom"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}
