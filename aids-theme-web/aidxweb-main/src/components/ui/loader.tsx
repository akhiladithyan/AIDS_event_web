"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [statusText, setStatusText] = useState("INITIALIZING SYSTEM...");
  const [displayedStatus, setDisplayedStatus] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [randomCodes, setRandomCodes] = useState<string[]>([]);
  const [randomSeqs, setRandomSeqs] = useState<string[]>([]);

  // Generate random values only on client
  useEffect(() => {
    setRandomCodes(Array.from({ length: 10 }).map(() => `0x${Math.random().toString(16).substr(2, 8).toUpperCase()}`));
    setRandomSeqs(Array.from({ length: 10 }).map(() => `::INIT_SEQ_${Math.floor(Math.random() * 999)}`));
  }, []);

  // Typewriter effect for status text
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= statusText.length) {
        setDisplayedStatus(statusText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [statusText]);

  // Progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Randomize increment for "hacker" feel
        const increment = Math.random() * 2.5;
        // Faster loading for demo purposes
        return Math.min(prev + increment, 100);
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Status text updates based on progress
  useEffect(() => {
    if (progress < 20) setStatusText("INITIALIZING DOOMSDAY PROTOCOL...");
    else if (progress < 40) setStatusText("LOADING AI CORE MATRIX...");
    else if (progress < 60) setStatusText("DECRYPTING DOOM INTEL...");
    else if (progress < 80) setStatusText("ARMING LATVERIAN PROTOCOLS...");
    else if (progress < 98) setStatusText("THREAT LEVEL: CRITICAL...");
    else {
      setStatusText("ACCESS GRANTED // AIDEX'26");
      // Delay before unmounting
      setTimeout(() => {
        setIsVisible(false);
        if (onLoadingComplete) onLoadingComplete();
      }, 900);
    }

    // Trigger glitch effect randomly
    if (Math.random() > 0.8) {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }

  }, [progress, onLoadingComplete]);

  // Lock body scroll when visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto'; // or ''
    }
    return () => {
      document.body.style.overflow = 'auto'; // or ''
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050806] overflow-hidden text-white w-full h-full px-4">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(57, 255, 136, 0.08) 1px, transparent 1px),
             linear-gradient(90deg, rgba(57, 255, 136, 0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Atmospheric green glows */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-40 h-40 md:w-80 md:h-80 bg-[#0b6b3a] rounded-full mix-blend-screen filter blur-[90px] md:blur-[140px] opacity-25 pointer-events-none"
      ></motion.div>
      <motion.div
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-1/4 right-1/4 w-40 h-40 md:w-80 md:h-80 bg-[#18c96a] rounded-full mix-blend-screen filter blur-[90px] md:blur-[140px] opacity-20 pointer-events-none"
      ></motion.div>

      <div className="z-10 flex flex-col items-center w-full max-w-3xl relative">

        {/* Tactical Status Pill */}
        <div className="inline-flex items-center gap-2 border border-[#39ff88]/30 bg-[#39ff88]/10 px-4 py-1 rounded-sm mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse" />
          <span className="text-[#39ff88] text-xs font-mono tracking-[0.25em] uppercase">
            DOOMSDAY_BOOT_SEQUENCE_v.26
          </span>
        </div>

        {/* Main Logo Text with Glitch Effect */}
        <div className="relative mb-8 text-center">
          {/* Shadow layer for depth */}
          <motion.h1
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter absolute top-2 left-2 text-[#39ff88] blur-sm font-audiowide"
          >
            AIDEX'26
          </motion.h1>

          {/* Main Text with Continuous Glitch/Shake */}
          <div className="relative group inline-block">
            <h1 className={`text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#39ff88] via-[#18c96a] to-[#bfc8c3] font-audiowide relative z-10 animate-shake drop-shadow-[0_0_35px_rgba(57,255,136,0.6)]`}>
              AIDEX'26
            </h1>

            {/* Glitch Layers */}
            <h1 className="absolute top-0 left-0 text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-[#ff3030] opacity-70 font-audiowide animate-glitch-1 mix-blend-screen pointer-events-none" aria-hidden="true">
              AIDEX'26
            </h1>
            <h1 className="absolute top-0 left-0 text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-[#39ff88] opacity-70 font-audiowide animate-glitch-2 mix-blend-screen pointer-events-none" aria-hidden="true">
              AIDEX'26
            </h1>
          </div>

          {/* Subtext */}
          <div className="flex justify-between items-center mt-3 w-full">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs sm:text-sm md:text-base text-[#39ff88] tracking-[0.4em] ml-1 font-mono font-bold uppercase"
            >
              DOOMSDAY PROTOCOL
            </motion.span>
            <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-[#39ff88]/50 to-transparent mx-4"></div>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-[#39ff88] shadow-[0_0_8px_#39ff88]"
            ></motion.div>
          </div>
        </div>

        {/* Progress Bar Container with Doom green neon effect */}
        <div className="w-full h-7 bg-[#0b1510] border border-[#39ff88]/30 rounded-sm relative overflow-hidden backdrop-blur-sm shadow-[0_0_20px_rgba(57,255,136,0.15)]">
          {/* Grid overlay on bar */}
          <div className="absolute inset-0 z-20 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.6) 50%)',
            backgroundSize: '8px 100%'
          }}></div>

          {/* The Filler with Doom green gradient */}
          <motion.div
            className="h-full bg-gradient-to-r from-[#0b6b3a] via-[#18c96a] to-[#39ff88] relative transition-all duration-75 ease-out flex items-center justify-end"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full w-[3px] bg-white shadow-[0_0_12px_#39ff88]"></div>
          </motion.div>
        </div>

        {/* Status Text & Percentage */}
        <div className="w-full flex justify-between items-end mt-4 text-[#39ff88] font-mono text-xs md:text-sm">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 mb-0.5 tracking-widest uppercase">:: SYSTEM_TELEMETRY ::</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={statusText}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-[#39ff88]"
              >
                {displayedStatus}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  _
                </motion.span>
              </motion.span>
            </AnimatePresence>
          </div>
          <motion.div
            className="text-3xl md:text-4xl font-bold text-white tabular-nums font-audiowide"
            key={Math.floor(progress)}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {Math.floor(progress)}<span className="text-[#39ff88] text-base">%</span>
          </motion.div>
        </div>

        {/* Decorative Code Bits with staggered animation */}
        <div className="absolute -left-12 top-0 hidden md:flex flex-col text-[10px] text-[#18c96a]/30 font-mono select-none">
          {randomCodes.map((code, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.4, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              {code}
            </motion.div>
          ))}
        </div>
        <div className="absolute -right-12 bottom-0 hidden md:flex flex-col text-[10px] text-[#39ff88]/30 font-mono select-none text-right">
          {randomSeqs.map((seq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 0.4, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              {seq}
            </motion.div>
          ))}
        </div>

      </div>

      {/* Footer / Copyright */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 text-[#66716c] text-[10px] tracking-[0.3em] uppercase font-mono"
      >
        AIDEX'26 // LATVERIAN_AI_NETWORK // VEL TECH MULTI TECH
      </motion.div>
    </div>
  );
};

export default LoadingScreen;