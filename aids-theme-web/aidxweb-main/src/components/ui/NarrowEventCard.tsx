"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Clock, Trophy, Info, ArrowRight, UserCheck } from "lucide-react";

import RollingPillButton from "@/components/ui/RollingPillButton";

interface NarrowEventCardProps {
  title: string;
  category: string;
  description: string;
  imageSrc?: string;
  videoSrc?: string;
  regCount: number;
  maxSlots: number;
  entryFee?: number;
  participationType?: string;
  time?: string;
  venue?: string;
  onOpenDetails: () => void;
  onOpenRegister: () => void;
}

export default function NarrowEventCard({
  title,
  category,
  description,
  imageSrc,
  videoSrc,
  regCount = 0,
  maxSlots = 20,
  entryFee = 0,
  participationType = "Individual",
  time = "09:30 AM - 03:00 PM",
  venue = "Main Auditorium",
  onOpenDetails,
  onOpenRegister,
}: NarrowEventCardProps) {
  const [isTouched, setIsTouched] = useState(false);

  const slotsLeft = Math.max(0, maxSlots - regCount);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onTouchStart={() => setIsTouched(true)}
      onTouchEnd={() => setIsTouched(false)}
      className={`group relative w-full max-w-[380px] rounded-2xl overflow-hidden bg-[#071d12] border transition-all duration-300 flex flex-col justify-between ${
        isTouched
          ? "border-[#39ff88] shadow-[0_0_35px_rgba(57,255,136,0.5)]"
          : "border-[#18c96a]/30 hover:border-[#39ff88] hover:shadow-[0_0_35px_rgba(57,255,136,0.4)]"
      }`}
    >
      {/* Outer Glow Halo on Hover / Touch */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#39ff88]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* TOP MEDIA SECTION */}
      <div className="relative h-52 w-full overflow-hidden bg-[#050806]">
        {videoSrc ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <img
            src={imageSrc || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071d12] via-[#071d12]/30 to-transparent" />

        {/* TOP LEFT BADGE: CATEGORY */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-900/60 border border-red-500/50 backdrop-blur-md">
          <span className="text-[11px] font-mono font-bold text-red-300 uppercase tracking-widest">
            {category || "CODING"}
          </span>
        </div>

        {/* TOP RIGHT BADGE: PRIZE / FEE */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/50 backdrop-blur-md flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-purple-300" />
          <span className="text-xs font-mono font-bold text-purple-200">
            {entryFee ? `₹${entryFee}` : "₹8,000"}
          </span>
        </div>

        {/* BOTTOM LEFT BADGE: SLOTS FILLED */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-[#18c96a]/25 border border-[#39ff88]/40 backdrop-blur-md flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#39ff88]" />
          <span className="text-[11px] font-mono font-bold text-[#39ff88]">
            {regCount}/{maxSlots} Slots Filled ({slotsLeft} Left)
          </span>
        </div>
      </div>

      {/* BODY CONTENT SECTION */}
      <div className="p-6 flex-1 flex flex-col justify-between font-sans space-y-4">
        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="font-bold text-xl md:text-2xl text-white font-orbitron tracking-wide leading-snug group-hover:text-[#39ff88] transition-colors">
            {title}
          </h3>
          <p className="text-xs text-[#bfc8c3]/80 font-mono leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Info Rows */}
        <div className="space-y-2 pt-2 border-t border-[#39ff88]/15 font-mono text-xs text-gray-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#39ff88]" /> {participationType}
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-[#39ff88]" /> {venue}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-3.5 h-3.5 text-[#39ff88]" /> {time}
          </div>
        </div>

        {/* ACTION BUTTONS ROW WITH ROLLING PILL ANIMATION */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Left Button: Event Details */}
          <RollingPillButton
            label="Event Details"
            icon={<Info className="w-3.5 h-3.5" />}
            iconPosition="left"
            circleColor="bg-[#39ff88]/20"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="w-full py-3 px-3 rounded-full bg-[#0d2a1c] border border-[#39ff88]/30 hover:border-[#39ff88] hover:bg-[#143c29] text-[#39ff88] text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-1.5"
          />

          {/* Right Button: Register Team */}
          <RollingPillButton
            label="Register Team"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            circleColor="bg-[#39ff88]"
            hoverTextColor="text-black"
            onClick={(e) => {
              e.stopPropagation();
              onOpenRegister();
            }}
            className="w-full py-3 px-3 rounded-full bg-[#18c96a] hover:bg-[#39ff88] text-black text-xs font-orbitron font-black tracking-wider uppercase shadow-[0_0_15px_rgba(57,255,136,0.3)] hover:shadow-[0_0_25px_rgba(57,255,136,0.6)] transition-all flex items-center justify-center gap-1.5"
          />
        </div>
      </div>
    </motion.div>
  );
}
