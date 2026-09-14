"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface RollingPillButtonProps {
  label: string;
  hoverLabel?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  circleColor?: string;
  primaryTextColor?: string;
  hoverTextColor?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
}

export default function RollingPillButton({
  label,
  hoverLabel,
  icon,
  iconPosition = "left",
  onClick,
  className = "",
  circleColor = "bg-[#39ff88]/30",
  primaryTextColor = "",
  hoverTextColor = "",
  disabled = false,
  type = "button",
}: RollingPillButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const displayHoverLabel = hoverLabel || label;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className={`group relative overflow-hidden transition-all duration-300 select-none cursor-pointer ${className}`}
    >
      {/* 1. EXPANDING CIRCLE FILL FROM BOTTOM CENTER */}
      {circleColor && (
        <motion.span
          initial={{ scale: 0, x: "-50%", y: "50%" }}
          animate={
            isHovered
              ? { scale: 3.5, x: "-50%", y: "0%" }
              : { scale: 0, x: "-50%", y: "50%" }
          }
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className={`absolute left-1/2 bottom-0 w-24 h-24 rounded-full ${circleColor} pointer-events-none z-0`}
        />
      )}

      {/* BUTTON CONTENT */}
      <span className="relative z-10 inline-flex items-center justify-center gap-1.5 w-full h-full">
        {icon && iconPosition === "left" && (
          <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </span>
        )}

        {/* 2. VERTICAL ROLLING TEXT STACK */}
        <span className="relative overflow-hidden inline-block h-[1.25em] align-middle">
          {/* Primary Label */}
          <motion.span
            initial={{ y: 0 }}
            animate={isHovered ? { y: "-100%" } : { y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={`block whitespace-nowrap ${primaryTextColor}`}
          >
            {label}
          </motion.span>

          {/* Hover Label */}
          <motion.span
            initial={{ y: "100%" }}
            animate={isHovered ? { y: "0%" } : { y: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={`absolute top-0 left-0 right-0 block whitespace-nowrap text-center ${hoverTextColor}`}
          >
            {displayHoverLabel}
          </motion.span>
        </span>

        {icon && iconPosition === "right" && (
          <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">
            {icon}
          </span>
        )}
      </span>
    </button>
  );
}
