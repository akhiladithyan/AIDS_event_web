"use client";

import React from "react";
import { motion } from "framer-motion";

interface InfiniteRibbonProps {
    texts: string[];
    rotation?: number;
    direction?: "left" | "right";
    className?: string;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
}

const Ribbon = ({
    texts,
    rotation = 0,
    direction = "left",
    className = "",
    backgroundColor = "bg-[#08100b]",
    textColor = "text-[#39ff88]",
    borderColor = "border-[#39ff88]/30"
}: InfiniteRibbonProps) => {
    return (
        <div
            className={`w-full flex overflow-hidden py-3 border-y shadow-[0_0_20px_rgba(57,255,136,0.15)] backdrop-blur-md ${className} ${backgroundColor} ${textColor} ${borderColor}`}
            style={{
                transform: `rotate(${rotation}deg)`,
                zIndex: 10,
            }}
        >
            <motion.div
                className="flex min-w-full shrink-0 items-center justify-around gap-8 whitespace-nowrap"
                animate={{
                    x: direction === "left" ? ["0%", "-100%"] : ["-100%", "0%"],
                }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 40,
                }}
            >
                {texts.concat(texts).concat(texts).map((text, idx) => (
                    <span key={idx} className="font-orbitron text-sm md:text-lg font-bold flex items-center tracking-widest uppercase">
                        {text} <span className="mx-6 text-[#18c96a] opacity-60 text-xs">//</span>
                    </span>
                ))}
            </motion.div>
            <motion.div
                className="flex min-w-full shrink-0 items-center justify-around gap-8 whitespace-nowrap"
                animate={{
                    x: direction === "left" ? ["0%", "-100%"] : ["-100%", "0%"],
                }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 40,
                }}
            >
                {texts.concat(texts).concat(texts).map((text, idx) => (
                    <span key={`dup-${idx}`} className="font-orbitron text-sm md:text-lg font-bold flex items-center tracking-widest uppercase">
                        {text} <span className="mx-6 text-[#18c96a] opacity-60 text-xs">//</span>
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

interface InfiniteCrossedRibbonsProps {
    words: string[];
}

export const InfiniteRibbon = ({ words }: InfiniteCrossedRibbonsProps) => {
    return (
        <div className="relative w-full overflow-hidden flex items-center justify-center my-6 md:my-10">
            <Ribbon
                texts={words}
                rotation={0}
                direction="left"
                backgroundColor="bg-[#0b1510]/90"
                textColor="text-[#bfc8c3]"
                borderColor="border-y border-[#39ff88]/20"
            />
        </div>
    );
};
