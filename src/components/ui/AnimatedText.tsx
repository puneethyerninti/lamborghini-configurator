"use client";
import React from "react";
import { motion } from "framer-motion";

export function AnimatedText({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.01, staggerDirection: -1 as const },
    }
  };

  const child = {
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 15, stiffness: 100 } },
    hidden: { opacity: 0, y: 30, transition: { type: "spring" as const, damping: 15, stiffness: 100 } },
    exit: { opacity: 0, y: -20, transition: { type: "spring" as const, damping: 15, stiffness: 100 } },
  };

  return (
    <motion.div style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }} variants={container} initial="hidden" animate="visible" exit="exit" className={className}>
      {words.map((word, index) => (
        <span key={index} style={{ marginRight: "0.25em", display: "inline-flex" }}>
          {Array.from(word).map((letter, letterIndex) => (
            <motion.span variants={child} key={letterIndex} style={{ display: "inline-block" }}>
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}
