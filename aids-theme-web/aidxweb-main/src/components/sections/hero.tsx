"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import MagneticButton from "../ui/MagneticButton";

/**
 * Z-INDEX LAYER MAP (no overlaps):
 * z-0  → Doom image bg
 * z-1  → Color tint overlays
 * z-2  → Vignette + scanlines
 * z-3  → Animated glows / atmosphere
 * z-10 → HUD corners (small, top-24)
 * z-20 → Center text content
 * z-30 → CTA button
 *
 * Logos removed from hero — they live in the Header already.
 */

const HeroSection: React.FC = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    setMouse({ x, y });
  }, []);

  return (
    <section
      className="relative h-dvh w-full overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      aria-label="Hero"
    >
      {/* ═══════════════════════════════════════════════
          LAYER z-0: DOOM BACKGROUND IMAGE (parallax)
          Full-bleed, slightly over-scaled so parallax
          movement doesn't show edges
      ═══════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-[-4%] z-0"
        animate={{ x: mouse.x * 0.6, y: mouse.y * 0.4 }}
        transition={{ type: "spring", stiffness: 35, damping: 18 }}
      >
        {/* Subtle continuous slow zoom animation */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/doom-hero.jpg"
            alt="Doctor Doom — AIDEX'26 Doomsday"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════
          LAYER z-1: COLOR TINT OVERLAYS
          Darken the image so text is readable, push it
          toward the obsidian/emerald palette
      ═══════════════════════════════════════════════ */}
      {/* Base dark tint */}
      <div className="absolute inset-0 z-[1] bg-[#050806]/55" />
      {/* Green tint to match Doom palette */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#0b6b3a]/20 via-transparent to-[#050806]/40 mix-blend-multiply" />
      {/* Strong vignette from edges */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 60% 50%, transparent 30%, #050806 100%)",
        }}
      />
      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 right-0 z-[1] h-40 bg-gradient-to-t from-[#050806] to-transparent" />
      {/* Top fade (covers behind nav) */}
      <div className="absolute top-0 left-0 right-0 z-[1] h-24 bg-gradient-to-b from-[#050806]/80 to-transparent" />

      {/* ═══════════════════════════════════════════════
          LAYER z-2: SCANLINES + NOISE TEXTURE
      ═══════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,136,0.15) 2px, rgba(57,255,136,0.15) 3px)",
          backgroundSize: "100% 3px",
        }}
      />
      {/* Cyber grid overlay */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57,255,136,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,136,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ═══════════════════════════════════════════════
          LAYER z-3: ATMOSPHERIC ANIMATED GLOWS
          Parallax opposite direction to image for depth
      ═══════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 z-[3] pointer-events-none"
        animate={{ x: mouse.x * -0.8, y: mouse.y * -0.6 }}
        transition={{ type: "spring", stiffness: 30, damping: 20 }}
      >
        {/* Top-left energy burst (from Doom's gauntlet in image) */}
        <motion.div
          className="absolute top-[-5%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-[#39ff88]/12 blur-[100px]"
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Right side cosmic bg glow */}
        <motion.div
          className="absolute top-[10%] right-[-10%] w-[40vw] h-[50vw] rounded-full bg-[#18c96a]/08 blur-[120px]"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════
          LAYER z-10: HUD CORNERS
          top-24 = below 64px header, no overlap
          Small text, pointer-events-none
      ═══════════════════════════════════════════════ */}

      {/* Top-Left HUD */}
      <motion.div
        className="absolute top-[72px] left-5 z-[10] hidden lg:flex flex-col gap-[2px] pointer-events-none"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <div className="flex items-center gap-1.5">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-[#39ff88]"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="font-mono text-[9px] text-[#39ff88] font-bold tracking-widest uppercase leading-none">
            LATVERIAN_AI_CORE: ONLINE
          </span>
        </div>
        <span className="font-mono text-[8px] text-[#39ff88]/50 tracking-wider leading-none pl-3">
          THREAT_LEVEL: OMEGA
        </span>
        <span className="font-mono text-[8px] text-[#39ff88]/35 tracking-wider leading-none pl-3">
          SYSTEM: 100% ARMED
        </span>
      </motion.div>

      {/* Top-Right HUD */}
      <motion.div
        className="absolute top-[72px] right-5 z-[10] hidden lg:flex flex-col items-end gap-[2px] pointer-events-none"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <span className="font-mono text-[8px] text-[#bfc8c3]/50 tracking-wider leading-none">
          LAT: 13.1167° N
        </span>
        <span className="font-mono text-[8px] text-[#bfc8c3]/40 tracking-wider leading-none">
          LON: 80.0970° E
        </span>
        <motion.span
          className="font-mono text-[8px] text-[#ff3030]/60 tracking-wider leading-none"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          SECTOR: DOOMSDAY_ACTIVE
        </motion.span>
      </motion.div>

      {/* ═══════════════════════════════════════════════
          LAYER z-20: MAIN HERO TEXT CONTENT
          Centered, vertically centered in viewport
          Doom image is right-center so text lives left-center
      ═══════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[20] flex items-center pointer-events-none">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 flex flex-col items-start md:items-start justify-center pt-16">

          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 border border-[#39ff88]/50 bg-[#050806]/70 px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm"
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-[#39ff88]"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[#39ff88] text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase font-bold">
              // DOOMSDAY PROTOCOL ACTIVE
            </span>
          </motion.div>

          {/* Giant Title — Rajdhani */}
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-black uppercase text-white leading-[0.88]"
              style={{
                fontFamily: "'Rajdhani', 'Audiowide', sans-serif",
                fontSize: "clamp(4.5rem, 14vw, 11rem)",
                letterSpacing: "-0.02em",
                textShadow:
                  "0 0 80px rgba(57,255,136,0.35), 0 0 160px rgba(57,255,136,0.12)",
              }}
            >
              AIDEX&apos;26
            </motion.h1>

            {/* Glitch layer 1 — red offset */}
            <motion.h1
              aria-hidden
              className="absolute top-0 left-0 w-full font-black uppercase text-[#ff3030] leading-[0.88] pointer-events-none mix-blend-screen"
              style={{
                fontFamily: "'Rajdhani', 'Audiowide', sans-serif",
                fontSize: "clamp(4.5rem, 14vw, 11rem)",
                letterSpacing: "-0.02em",
                clipPath: "polygon(0 0, 100% 0, 100% 30%, 0 30%)",
              }}
              animate={{
                x: [0, -4, 3, 0],
                opacity: [0, 0.7, 0, 0],
              }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "linear",
              }}
            >
              AIDEX&apos;26
            </motion.h1>

            {/* Glitch layer 2 — green offset */}
            <motion.h1
              aria-hidden
              className="absolute top-0 left-0 w-full font-black uppercase text-[#39ff88] leading-[0.88] pointer-events-none mix-blend-screen"
              style={{
                fontFamily: "'Rajdhani', 'Audiowide', sans-serif",
                fontSize: "clamp(4.5rem, 14vw, 11rem)",
                letterSpacing: "-0.02em",
                clipPath: "polygon(0 70%, 100% 70%, 100% 100%, 0 100%)",
              }}
              animate={{
                x: [0, 5, -3, 0],
                opacity: [0, 0.6, 0, 0],
              }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                repeatDelay: 4,
                delay: 0.05,
                ease: "linear",
              }}
            >
              AIDEX&apos;26
            </motion.h1>
          </div>

          {/* DOOMSDAY subtitle */}
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="font-bold tracking-[0.35em] bg-gradient-to-r from-[#39ff88] via-[#18c96a] to-[#5ef3a5] bg-clip-text text-transparent -mt-1 sm:-mt-3"
            style={{
              fontFamily: "'Audiowide', sans-serif",
              fontSize: "clamp(1rem, 3.5vw, 2.8rem)",
              filter: "drop-shadow(0 0 18px rgba(57,255,136,0.55))",
            }}
          >
            DOOMSDAY
          </motion.p>

          {/* Animated divider */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-56 h-[1px] bg-gradient-to-r from-[#39ff88]/80 via-[#39ff88]/40 to-transparent my-5"
          />

          {/* Meta info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex flex-col gap-1.5"
          >
            <p
              className="text-white/80 text-xs sm:text-sm font-semibold tracking-widest uppercase"
              style={{ fontFamily: "var(--font-inter)", letterSpacing: "0.15em" }}
            >
              Presented by{" "}
              <span
                className="text-[#39ff88]"
                style={{ filter: "drop-shadow(0 0 6px #39ff88)" }}
              >
                Dept. of AI &amp; Data Science
              </span>
            </p>
            <div className="flex items-center gap-3 text-[#bfc8c3]/60 text-[11px] font-mono tracking-widest uppercase">
              <span className="text-[#39ff88] font-bold">OCT 7, 2026</span>
              <span className="w-px h-3 bg-[#39ff88]/30" />
              <span>National Technical Symposium</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          LAYER z-30: CTA BUTTON
          Bottom-center, well clear of all other layers
      ═══════════════════════════════════════════════ */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[30]">
        <Link href="/events">
          <MagneticButton strength={0.3}>
            <motion.button
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-3.5 bg-[#050806]/80 border border-[#39ff88]/50 rounded-full overflow-hidden flex items-center gap-3 hover:border-[#39ff88] hover:shadow-[0_0_40px_rgba(57,255,136,0.5)] transition-all duration-300 backdrop-blur-md"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#0b6b3a]/40 to-[#39ff88]/25"
                initial={{ y: "100%" }}
                whileHover={{ y: "0%" }}
                transition={{ duration: 0.3 }}
              />
              <span
                className="relative z-10 text-sm font-bold uppercase tracking-[0.2em] text-white group-hover:text-[#39ff88] transition-colors"
                style={{ fontFamily: "'Audiowide', sans-serif" }}
              >
                DOOMSDAY PROTOCOL
              </span>
              <ArrowRight className="relative z-10 w-4 h-4 text-[#39ff88] group-hover:translate-x-1.5 transition-transform" />
            </motion.button>
          </MagneticButton>
        </Link>
      </div>

      {/* Animated corner brackets (decorative, no overlap) */}
      <div className="absolute bottom-0 left-0 z-[10] pointer-events-none p-4 hidden md:block">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M0 40 L0 0 L40 0" stroke="#39ff88" strokeWidth="1.5" opacity="0.4" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 z-[10] pointer-events-none p-4 hidden md:block">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M40 40 L40 0 L0 0" stroke="#39ff88" strokeWidth="1.5" opacity="0.4" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
