"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const FloatingRegisterButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let scrollTimer: NodeJS.Timeout;

        // Initial appearance delay
        const initialTimer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        const handleScroll = () => {
            // Hide on scroll
            setIsVisible(false);

            // Clear previous timer
            clearTimeout(scrollTimer);

            // Show after 3 seconds of inactivity
            scrollTimer = setTimeout(() => {
                setIsVisible(true);
            }, 3000);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            clearTimeout(initialTimer);
            clearTimeout(scrollTimer);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleClick = () => {
        router.push("/events");
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:bottom-10"
                >
                    <button
                        onClick={handleClick}
                        className="group relative flex items-center gap-3 px-8 py-3 bg-[#08100b]/90 backdrop-blur-xl border border-[#39ff88]/30 rounded-full shadow-[0_0_20px_rgba(57,255,136,0.25)] hover:shadow-[0_0_35px_rgba(57,255,136,0.5)] hover:bg-[#0e1b14] hover:border-[#39ff88] transition-all duration-300 overflow-hidden"
                    >
                        {/* Animated Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#39ff88]/10 to-transparent -translate-x-full group-hover:animate-shimmer" />

                        {/* Icon */}
                        <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#39ff88] text-[#050806] font-bold group-hover:scale-110 transition-transform shadow-[0_0_10px_#39ff88]">
                            <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                        </span>

                        {/* Text */}
                        <div className="relative z-10 flex flex-col items-start">
                            <span className="text-[10px] text-[#39ff88] font-mono tracking-widest uppercase mb-0.5 opacity-90">
                                DOOMSDAY_PROTOCOL
                            </span>
                            <span className="text-sm font-black font-audiowide text-white tracking-wide uppercase group-hover:text-shadow-glow transition-all">
                                INITIATE REGISTRATION
                            </span>
                        </div>

                        {/* Pulse Effect */}
                        <div className="absolute -inset-1 rounded-full border border-[#39ff88]/40 opacity-0 group-hover:opacity-100 animate-ping" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
