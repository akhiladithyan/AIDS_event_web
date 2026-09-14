"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TeamHero() {
  const [text, setText] = useState("LOADING_ROSTER...");
  const fullText = "AIDEX26_OPERATIVES_DOSSIER";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.substring(0, i) + (i % 2 === 0 ? "_" : ""));
      i++;
      if (i > fullText.length) {
        setText(fullText);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-[40vh] md:h-[50vh] flex flex-col items-center justify-center overflow-hidden mb-8 md:mb-12 py-10 md:py-0 bg-[#050806] border-b border-[#39ff88]/20">

      {/* Grid Background */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(57, 255, 136, 0.15) 1px, transparent 1px),
             linear-gradient(90deg, rgba(57, 255, 136, 0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

      {/* Central Text */}
      <div className="relative z-20 text-center px-4">
        <div className="inline-block border border-[#39ff88]/30 bg-[#39ff88]/10 px-4 py-1 rounded-full mb-4 backdrop-blur-sm">
          <span className="text-[#39ff88] text-xs md:text-sm font-mono tracking-widest uppercase">
            :: HIGH_COMMAND // PERSONNEL_MATRIX ::
          </span>
        </div>

        <div className="relative group inline-block">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-wider leading-tight font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-white via-[#bfc8c3] to-[#39ff88] drop-shadow-[0_0_25px_rgba(57,255,136,0.4)] relative z-10 uppercase">
            {text}
            <span className="animate-blink text-[#39ff88]">_</span>
          </h1>
        </div>

        <p className="mt-4 text-[#bfc8c3]/70 font-mono text-xs md:text-sm max-w-2xl mx-auto uppercase tracking-widest">
          [ ARCHITECTS & OPERATIVES OF THE AIDEX&apos;26 DOOMSDAY PROTOCOL ]
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 hidden md:block">
        <div className="flex flex-col gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-[#39ff88]/30 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 right-10 hidden md:block font-mono text-[10px] text-[#39ff88]/60 text-right">
        <div>COORDINATES: 13.1167° N, 80.0970° E</div>
        <div>PROVING GROUNDS: VEL_TECH_MULTITECH</div>
        <div>PROTOCOL STATUS: ACTIVE</div>
      </div>

    </div>
  );
}
