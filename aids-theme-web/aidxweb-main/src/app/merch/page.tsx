"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import Header from '@/components/sections/header';
import MobileNav from '@/components/sections/MobileNav';
import Footer from '@/components/sections/footer';

const merchItems = [
  {
    name: "AIDEX'26 Tactical Oversized Tee",
    price: "₹599",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/logo_low_fe195da3-opt-640-1.webp",
    color: "#39ff88"
  },
  {
    name: "Doomsday Heavy Cyber Hoodie",
    price: "₹999",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/logo_low_fe195da3-opt-640-1.webp",
    color: "#18c96a"
  },
  {
    name: "Command Operative Cap",
    price: "₹349",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/logo_low_fe195da3-opt-640-1.webp",
    color: "#bfc8c3"
  },
  {
    name: "Doomsday Access Wristband Set",
    price: "₹199",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/logo_low_fe195da3-opt-640-1.webp",
    color: "#39ff88"
  },
  {
    name: "Tactical Operative Tote Bag",
    price: "₹299",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/logo_low_fe195da3-opt-640-1.webp",
    color: "#18c96a"
  },
  {
    name: "Classified Schematic Poster Pack",
    price: "₹249",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/logo_low_fe195da3-opt-640-1.webp",
    color: "#39ff88"
  },
];

export default function MerchPage() {
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const isGridInView = useInView(gridRef, { once: true, amount: 0.1 });

  return (
    <main className="relative min-h-screen bg-[#050806] text-[#bfc8c3] overflow-hidden">
      <div className="grainy-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(57,255,136,0.06),transparent_60%)] pointer-events-none" />
      <MobileNav />
      <Header />

      <section className="pt-32 pb-24 px-4 md:px-10 lg:px-20 relative z-10">
        <div ref={heroRef} className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0e1b14] border border-[#39ff88]/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse" />
              <span className="font-mono text-xs text-[#39ff88] tracking-widest uppercase">TACTICAL REQUISITION // GEAR</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-orbitron text-[15vw] md:text-[12vw] lg:text-[140px] font-black tracking-tighter leading-none bg-gradient-to-r from-white via-[#39ff88] to-[#18c96a] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(57,255,136,0.3)]"
            >
              DOOM GEAR
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-lg md:text-xl text-[#bfc8c3]/80 font-light max-w-2xl mx-auto"
            >
              Exclusive AIDEX&apos;26 Doomsday Protocol apparel & tactical equipment. Equip your operative unit.
            </motion.p>
          </motion.div>

          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {merchItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={isGridInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-[#0e1b14] rounded-2xl overflow-hidden border border-[#39ff88]/20 hover:border-[#39ff88]/60 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.6)] cursor-pointer"
              >
                <div
                  className="aspect-square relative overflow-hidden bg-[#08100b] border-b border-[#39ff88]/10"
                >
                  <div className="absolute inset-0 flex items-center justify-center p-12">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-contain opacity-80 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(57,255,136,0.2)]"
                    />
                  </div>
                  <div
                    className="absolute top-4 right-4 px-3 py-1 rounded bg-[#39ff88] font-orbitron font-bold text-black text-sm tracking-wider shadow-[0_0_15px_rgba(57,255,136,0.4)]"
                  >
                    {item.price}
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-b from-[#0e1b14] to-[#050806]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-[#39ff88] tracking-widest">SPEC // 0{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-orbitron font-bold text-white mb-4 group-hover:text-[#39ff88] transition-colors">{item.name}</h3>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-lg border border-[#39ff88]/40 bg-[#39ff88]/10 text-[#39ff88] font-orbitron text-xs font-bold uppercase tracking-widest hover:bg-[#39ff88] hover:text-black transition-all duration-300"
                  >
                    DEPLOYING SOON
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isGridInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-20 text-center max-w-xl mx-auto p-8 rounded-2xl bg-[#0e1b14] border border-[#39ff88]/30 shadow-[0_0_30px_rgba(57,255,136,0.08)]"
          >
            <div className="w-10 h-10 rounded-full bg-[#39ff88]/10 border border-[#39ff88]/40 flex items-center justify-center mx-auto mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#39ff88] animate-ping" />
            </div>
            <h3 className="font-orbitron text-lg font-bold text-white mb-2">TACTICAL DROP ALERTS</h3>
            <p className="text-[#bfc8c3]/70 text-sm mb-6 font-mono">Register frequency to receive prioritized requisition notice upon deployment.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                placeholder="OPERATIVE_EMAIL@DOMAIN"
                className="flex-1 px-5 py-3 rounded-lg bg-[#08100b] border border-[#39ff88]/30 text-white font-mono text-sm placeholder:text-[#66716c] focus:outline-none focus:border-[#39ff88] focus:ring-1 focus:ring-[#39ff88]"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-lg bg-[#39ff88] text-black font-orbitron font-bold text-xs uppercase tracking-widest hover:bg-[#18c96a] transition-colors shadow-[0_0_20px_rgba(57,255,136,0.3)]"
              >
                AUTHORIZE
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}