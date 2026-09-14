"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function Magnetic({
    children,
    className,
    href,
}: {
    children: React.ReactNode;
    className?: string;
    href?: string;
    scrambleParams?: any;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current?.getBoundingClientRect() || {
            height: 0,
            width: 0,
            left: 0,
            top: 0,
        };
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.1, y: middleY * 0.1 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    const Content = (
        <motion.div
            style={{ position: "relative", x: position.x, y: position.y }}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );

    return (
        <div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            className="relative flex justify-center items-center cursor-pointer"
        >
            {href ? <a href={href}>{Content}</a> : Content}
        </div>
    );
}
