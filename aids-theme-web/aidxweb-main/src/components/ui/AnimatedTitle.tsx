"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTitleProps {
    children: React.ReactNode;
    className?: string;
    subtitle?: string;
    align?: 'left' | 'center' | 'right';
}

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
    children,
    className = '',
    subtitle,
    align = 'center'
}) => {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`${alignClass} ${className}`}
        >
            <h2 className="relative inline-block group">
                {/* Main gradient text with shine animation */}
                <span className="relative z-10 text-4xl md:text-5xl lg:text-6xl font-black font-audiowide uppercase tracking-tight bg-gradient-to-r from-[#39ff88] via-[#18c96a] to-[#bfc8c3] bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto] drop-shadow-[0_0_20px_rgba(57,255,136,0.3)]">
                    {children}
                </span>

                {/* Glow effect on hover */}
                <span className="absolute -inset-1 bg-gradient-to-r from-[#39ff88] via-[#18c96a] to-[#bfc8c3] opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 -z-10" />

                {/* Glitch layers on hover */}
                <span className="absolute inset-0 text-4xl md:text-5xl lg:text-6xl font-black font-audiowide uppercase tracking-tight text-[#ff3030] opacity-0 group-hover:opacity-70 group-hover:animate-glitch-1 mix-blend-screen pointer-events-none" aria-hidden="true">
                    {children}
                </span>
                <span className="absolute inset-0 text-4xl md:text-5xl lg:text-6xl font-black font-audiowide uppercase tracking-tight text-[#39ff88] opacity-0 group-hover:opacity-70 group-hover:animate-glitch-2 mix-blend-screen pointer-events-none" aria-hidden="true">
                    {children}
                </span>
            </h2>

            {subtitle && (
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-4 text-gray-400 text-sm md:text-base lg:text-lg font-inter max-w-2xl mx-auto"
                >
                    {subtitle}
                </motion.p>
            )}
        </motion.div>
    );
};

export default AnimatedTitle;
