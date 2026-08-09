"use client";
import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";

export function CinematicLetterbox() {
  const isTransitioning = useAppStore((s) => s.isTransitioning);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <div className="fixed inset-0 z-[110] pointer-events-none flex flex-col justify-between">
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="w-full h-[12vh] bg-black shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="w-full h-[12vh] bg-black shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
