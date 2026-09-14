"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const IntroTextSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const textItems = [
    { text: "SYSTEM_OVERRIDE", color: "text-[#39ff88]" },
    { text: "THREAT_ANALYSIS", color: "text-[#ff3030]" },
    { text: "CODE_BUILD_CONQUER", color: "text-[#18c96a]" },
    { text: "DOOMSDAY_PROTOCOL", color: "text-white" },
    { text: "AIDEX'26", color: "text-[#39ff88]", isGlitch: true },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % textItems.length);
    }, 2500); // Change every 2.5 seconds
    return () => clearInterval(interval);
  }, [textItems.length]);

  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center bg-[#050806] overflow-hidden border-t border-[#39ff88]/10">

      {/* Background Grid & Noise */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(57, 255, 136, 0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(57, 255, 136, 0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

      {/* Central Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center w-full"
          >
            {/* Optional Glitch Wrapper for specific items */}
            <div className={`relative w-full overflow-hidden ${textItems[currentIndex].isGlitch ? "animate-pulse" : ""}`}>
              <h2 className={`text-2xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black font-audiowide tracking-tight uppercase whitespace-nowrap ${textItems[currentIndex].color} drop-shadow-[0_0_35px_rgba(57,255,136,0.4)]`}>
                {textItems[currentIndex].text}
              </h2>

              {/* Reflection / Duplicate for Glitch visual */}
              {textItems[currentIndex].isGlitch && (
                <div className="absolute inset-0 opacity-50 animate-ping">
                  <h2 className={`text-2xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black font-audiowide tracking-tight uppercase whitespace-nowrap ${textItems[currentIndex].color}`}>
                    {textItems[currentIndex].text}
                  </h2>
                </div>
              )}
            </div>

            {/* Decoration Lines */}
            <div className="mt-8 flex items-center justify-center gap-2 md:gap-4 opacity-70 w-full max-w-lg mx-auto">
              <div className="h-px w-8 sm:w-12 md:w-24 bg-gradient-to-r from-transparent to-[#39ff88]" />
              <span className="text-[10px] sm:text-xs font-mono text-[#39ff88] tracking-[0.2em] sm:tracking-[0.4em] uppercase whitespace-nowrap">
                DOOM_SEQUENCE_0{currentIndex + 1}
              </span>
              <div className="h-px w-8 sm:w-12 md:w-24 bg-gradient-to-l from-transparent to-[#39ff88]" />
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default IntroTextSection;