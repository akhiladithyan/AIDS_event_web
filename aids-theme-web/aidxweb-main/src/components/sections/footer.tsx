"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Globe, Mail, MapPin, ExternalLink, Terminal, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

const Footer = ({ onBackToTop }: { onBackToTop?: () => void }) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }) + " UTC+5:30");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative bg-[#050806] pt-16 pb-10 px-4 md:px-12 lg:px-24 overflow-hidden border-t border-[#39ff88]/20 font-mono text-sm">

      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#39ff88]/60 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-[#39ff88] shadow-[0_0_15px_rgba(57,255,136,0.8)]"></div>

      <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">

        {/* Column 1: Location / System Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#39ff88] mb-4">
            <Terminal size={16} />
            <span className="tracking-widest uppercase text-xs font-bold font-orbitron">HQ Coordinates</span>
          </div>

          <div className="space-y-2 text-[#bfc8c3]/70 pl-6 border-l-2 border-[#39ff88]/30">
            <p className="flex items-center gap-2 font-semibold text-white"><MapPin size={14} className="text-[#39ff88]" /> Vel Tech Multi Tech</p>
            <p>#42, Avadi - Vel Tech Road,</p>
            <p>Avadi, Chennai - 600062</p>
            <p className="text-xs text-[#39ff88]/60 mt-2 uppercase tracking-wider">[ SECTOR: TAMIL_NADU // PROVING_GROUNDS ]</p>
          </div>
        </div>

        {/* Column 2: Digital Uplink */}
        <div className="space-y-6 flex flex-col md:items-center">
          <div className="flex items-center gap-2 text-[#39ff88] mb-4">
            <ShieldCheck size={16} />
            <span className="tracking-widest uppercase text-xs font-bold font-orbitron">Digital Uplink</span>
          </div>

          <div className="flex gap-4">
            <a href="https://www.youtube.com/@VELTECHMULTITECHENGINEERINGCOL" target="_blank" rel="noreferrer"
              className="w-12 h-12 flex items-center justify-center border border-[#39ff88]/20 bg-[#0b1510] rounded-lg hover:bg-red-500/20 hover:border-red-500 hover:text-white text-[#bfc8c3] transition-all group relative overflow-hidden">
              <svg className="relative z-10" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              <div className="absolute inset-0 bg-red-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </a>
            <a href="https://www.instagram.com/veltech_multitech1999/" target="_blank" rel="noreferrer"
              className="w-12 h-12 flex items-center justify-center border border-[#39ff88]/20 bg-[#0b1510] rounded-lg hover:bg-[#39ff88]/20 hover:border-[#39ff88] hover:text-white text-[#bfc8c3] transition-all group relative overflow-hidden">
              <Instagram size={20} className="relative z-10" />
              <div className="absolute inset-0 bg-[#39ff88]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </a>
            <a href="https://www.instagram.com/aidsevents_club?igsh=MWVtYmgxNTRvY2tmMg==" target="_blank" rel="noreferrer"
              className="w-12 h-12 flex items-center justify-center border border-[#39ff88]/20 bg-[#0b1510] rounded-lg hover:bg-[#18c96a]/20 hover:border-[#18c96a] hover:text-white text-[#bfc8c3] transition-all group relative overflow-hidden">
              <Instagram size={20} className="relative z-10" />
              <div className="absolute inset-0 bg-[#18c96a]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </a>
            <a href="https://www.veltechmultitech.org/" target="_blank" rel="noreferrer"
              className="w-12 h-12 flex items-center justify-center border border-[#39ff88]/20 bg-[#0b1510] rounded-lg hover:bg-[#39ff88]/20 hover:border-[#39ff88] hover:text-white text-[#bfc8c3] transition-all group relative overflow-hidden">
              <Globe size={20} className="relative z-10" />
              <div className="absolute inset-0 bg-[#39ff88]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </a>
          </div>

          <div className="mt-4 px-4 py-2 bg-[#0b1510] border border-[#39ff88]/30 rounded-full text-xs text-center font-mono">
            <span className="text-[#39ff88] animate-pulse">●</span> DOOMSDAY STATUS: <span className="text-[#39ff88] font-bold">ONLINE</span>
          </div>
        </div>

        {/* Column 3: Contact Protocol */}
        <div className="space-y-6 flex flex-col md:items-end text-left md:text-right">
          <div className="flex items-center gap-2 text-[#39ff88] mb-4 md:flex-row-reverse">
            <Mail size={16} />
            <span className="tracking-widest uppercase text-xs font-bold font-orbitron">Classified Dispatch</span>
          </div>

          <a href="mailto:nexathon.vtmt@gmail.com"
            className="group flex items-center gap-2 text-[#bfc8c3] hover:text-[#39ff88] transition-colors md:flex-row-reverse">
            <span className="text-sm md:text-base tracking-wider break-all font-mono">aidex26.vtmt@gmail.com</span>
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <div className="text-[11px] text-[#bfc8c3]/50 font-mono">
            DOOMSDAY_CLOCK: <span className="text-[#39ff88] font-semibold">{time}</span>
          </div>
        </div>

      </div>

      {/* Footer Bottom / Copyright */}
      <div className="mt-16 pt-6 border-t border-[#39ff88]/15 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-[#bfc8c3]/60 uppercase tracking-widest font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#39ff88] rounded-full animate-pulse"></span>
          <p>&copy; 2026 AIDEX&apos;26. THE DOOMSDAY PROTOCOL // VEL TECH MULTI TECH.</p>
        </div>
        <p className="flex items-center gap-2 text-[#39ff88]/80">
          POWERED BY <span className="text-[#39ff88] font-bold">AIDEX TECHNICAL INTELLIGENCE CORE</span>
        </p>
      </div>

    </footer>
  );
};

export default Footer;