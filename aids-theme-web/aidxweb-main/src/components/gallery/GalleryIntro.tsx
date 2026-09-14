"use client";

import { motion } from "framer-motion";

export default function GalleryIntro() {
  return (
    <section className="relative h-[70vh] flex flex-col items-center justify-center overflow-hidden w-full">
      <div className="flex flex-col items-center justify-center z-10 px-4 w-full">
        <div className="inline-block border border-[#39ff88]/30 bg-[#39ff88]/10 px-4 py-1 rounded-full mb-3 text-[#39ff88] text-xs font-mono uppercase tracking-widest">
          :: SURVEILLANCE_ARCHIVES ::
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-[18vw] md:text-[14vw] lg:text-[160px] font-black tracking-wider leading-none text-center select-none uppercase font-orbitron bg-gradient-to-b from-white via-[#bfc8c3] to-[#39ff88] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(57,255,136,0.35)] px-2"
        >
          ARCHIVES
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="mt-4 md:mt-6 text-xs sm:text-sm md:text-base tracking-[0.2em] font-mono uppercase text-[#bfc8c3]/80 text-center max-w-[90%] md:max-w-none"
        >
          AIDEX&apos;26 // VISUAL INTELLIGENCE & TELEMETRY STREAM
        </motion.p>
      </div>
    </section>
  );
}
