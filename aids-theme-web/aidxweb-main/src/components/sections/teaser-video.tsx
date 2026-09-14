"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const TeaserVideo = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section ref={sectionRef} className="bg-[#050806] w-full overflow-hidden border-y border-[#39ff88]/20 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,136,0.04),transparent_70%)] pointer-events-none" />
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20 relative z-10">
        <div className="mb-6 sm:mb-8 md:mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-ping" />
            <span className="font-mono text-xs text-[#39ff88] tracking-widest uppercase">TRANSMISSION BROADCAST // ARCHIVE_26</span>
          </div>
          <motion.h3
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.8, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-orbitron font-bold text-lg sm:text-2xl md:text-3xl lg:text-4xl text-[#bfc8c3] tracking-widest uppercase mb-1 sm:mb-2"
          >
            WITNESS THE INITIATION AT
          </motion.h3>
          <motion.h2
            initial={{ opacity: 0, y: 40, scale: 0.95, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative font-orbitron font-black tracking-tighter leading-[0.85] text-[12vw] sm:text-[10vw] md:text-[12vw] lg:text-[110px] xl:text-[130px] uppercase text-left"
          >
            <span
              className="block font-black tracking-tight leading-none text-left select-none bg-gradient-to-r from-[#ffffff] via-[#39ff88] to-[#18c96a] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(57,255,136,0.3)] uppercase"
            >
              AIDEX&apos;26
            </span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full aspect-video overflow-hidden rounded-xl border border-[#39ff88]/30 shadow-[0_0_40px_rgba(57,255,136,0.15)] bg-[#08100b]"
        >
          <video
            className="video h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src="/videos/Esperanza%20Loading%20Video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#050806] via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-[#050806]/80 backdrop-blur-md px-3 py-1.5 rounded border border-[#39ff88]/30">
            <div className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse" />
            <span className="font-mono text-[11px] text-[#39ff88] tracking-widest uppercase">DECRYPTED FEED: DOOMSDAY SIGNAL</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeaserVideo;