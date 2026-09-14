"use client";

/**
 * @author: @kokonut-labs
 * @description: Slide Text Button with animated vertical text transition
 * @version: 1.0.0
 * @date: 2025-11-02
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SlideTextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: ReactNode; 
  hoverText?: ReactNode;
  isActive?: boolean; 
}

export default function SlideTextButton({
  text,
  hoverText,
  isActive = false,
  className,
  onClick,
  ...props
}: SlideTextButtonProps) {
  const slideText = hoverText ?? text;

  return (
    <motion.div
      animate={{ x: 0, opacity: 1, transition: { duration: 0.2 } }}
      className="relative"
      initial={{ x: 200, opacity: 0 }}
    >
      <button
        onClick={onClick}
        className={cn(
          "group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full px-8 font-medium transition-all duration-300",
          isActive 
            ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] scale-110" 
            : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:scale-105",
          className
        )}
        {...props}
      >
        {/* Invisible text to reserve width */}
        <span className="invisible opacity-0 pointer-events-none px-2 text-lg font-medium whitespace-nowrap">
            {slideText}
        </span>

        <span className="absolute inset-0 flex items-center justify-center group-hover:-translate-y-full transition-transform duration-300 ease-in-out h-full w-full">
          <span className="flex items-center gap-2 opacity-100 transition-opacity duration-300 group-hover:opacity-0">
            <span className="font-medium text-lg flex items-center">{text}</span>
          </span>
          <span className="absolute top-full left-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 h-full w-full">
            <span className="font-medium text-lg flex items-center whitespace-nowrap">{slideText}</span>
          </span>
        </span>
      </button>
    </motion.div>
  );
}
