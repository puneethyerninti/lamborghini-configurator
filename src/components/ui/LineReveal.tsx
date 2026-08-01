import React from "react";

export function LineReveal({ 
  direction = "x", 
  delay = 0, 
  className = "",
  color = "bg-white/20"
}: { 
  direction?: "x" | "y"; 
  delay?: number;
  className?: string;
  color?: string;
}) {
  return (
    <div 
      className={`${color} ${direction === "x" ? "animate-line-x" : "animate-line-y"} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}
