"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Hide on mobile
        if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
            return;
        }

        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "BUTTON" || target.tagName === "A" || target.closest("button") || target.closest("a") || target.style.cursor === "pointer") {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <>
            {/* Main Dot */}
            <motion.div
                className="fixed top-0 left-0 w-3 h-3 bg-[#39ff88] rounded-full shadow-[0_0_12px_#39ff88] pointer-events-none z-[9999]"
                animate={{
                    x: mousePosition.x - 6,
                    y: mousePosition.y - 6,
                    scale: isClicked ? 0.7 : isHovered ? 1.6 : 1,
                }}
                transition={{
                    type: "tween",
                    ease: "backOut",
                    duration: 0.1
                }}
            />
            {/* Trailing Reticle Ring */}
            <motion.div
                className="fixed top-0 left-0 w-9 h-9 border border-[#39ff88]/60 rounded-full pointer-events-none z-[9998] flex items-center justify-center"
                style={{
                    boxShadow: "0 0 15px rgba(57, 255, 136, 0.25)"
                }}
                animate={{
                    x: mousePosition.x - 18,
                    y: mousePosition.y - 18,
                    scale: isClicked ? 1.4 : isHovered ? 1.8 : 1,
                    opacity: isClicked ? 0.9 : 0.6,
                    rotate: isHovered ? 90 : 0
                }}
                transition={{
                    type: "spring",
                    stiffness: 160,
                    damping: 16,
                    mass: 0.4
                }}
            >
                <div className="w-1 h-1 bg-[#39ff88] opacity-60 rounded-full"></div>
            </motion.div>
        </>
    );
};

export default CustomCursor;
