"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import Header from '@/components/sections/header';
import MobileNav from '@/components/sections/MobileNav';
import Footer from '@/components/sections/footer';

const proshows = [
  {
    day: "NIGHT 01",
    date: "7 OCT",
    title: "Opening Protocol",
    artists: [
      { name: "Armaan Malik", role: "Live Headliner", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/RahulChahar_ac750ab2-opt-1080-15.webp" },
      { name: "Shakthisree Gopalan", role: "Vocalist & Composer", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/NagaChai_e032696b-opt-750-22.webp" },
    ],
    color: "#39ff88"
  },
  {
    day: "NIGHT 02",
    date: "8 OCT",
    title: "Cyber Synth & EDM",
    artists: [
      { name: "Progressive Brothers", role: "Electronic Duo", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/loststories-23.webp" },
      { name: "Julia Bliss", role: "Global Electronic Artist", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/danika-24.webp" },
    ],
    color: "#18c96a"
  },
  {
    day: "NIGHT 03",
    date: "9 OCT",
    title: "Sonic Fusion",
    artists: [
      { name: "Devi Sri Prasad", role: "Music Director", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/andrea-25.webp" },
      { name: "Aastha Gill", role: "Vocal Powerhouse", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/jonita-26.webp" },
    ],
    color: "#39ff88"
  },
  {
    day: "NIGHT 04",
    date: "10 OCT",
    title: "Grand Doomsday Finale",
    artists: [
      { name: "Shreya Ghoshal", role: "Legendary Vocalist", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/shreya-27.webp" },
      { name: "Lost Stories", role: "DJ Duo", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/images/loststories-23.webp" },
    ],
    color: "#18c96a"
  },
];

function ShowCard({ show, showIndex }: { show: typeof proshows[0]; showIndex: number }) {
  const showRef = useRef(null);
  const isShowInView = useInView(showRef, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={showRef}
      initial={{ opacity: 0, y: 80 }}
      animate={isShowInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isShowInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:w-1/4"
        >
          <div
            className="inline-block px-4 py-1.5 rounded bg-[#39ff88] font-orbitron text-xs font-bold text-black uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(57,255,136,0.3)]"
          >
            {show.day}
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-orbitron font-black tracking-tighter text-white mb-2">
            {show.date}
          </h2>
          <p className="text-xl md:text-2xl font-orbitron font-bold text-[#39ff88] tracking-wider">
            {show.title}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-pulse" />
            <span className="font-mono text-[11px] text-[#66716c] uppercase tracking-widest">TRANSMISSION ACTIVE</span>
          </div>
        </motion.div>

        <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {show.artists.map((artist, artistIndex) => (
            <motion.div
              key={artistIndex}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isShowInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + artistIndex * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-[#0e1b14] rounded-2xl overflow-hidden border border-[#39ff88]/20 hover:border-[#39ff88]/60 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-[#08100b]">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-[#050806]/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050806] to-transparent">
                <span className="font-mono text-[10px] text-[#39ff88] uppercase tracking-widest">ACT // 0{artistIndex + 1}</span>
                <h3 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-1 group-hover:text-[#39ff88] transition-colors">{artist.name}</h3>
                <p className="text-[#bfc8c3]/80 font-mono text-xs">{artist.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showIndex < proshows.length - 1 && (
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#39ff88]/20 to-transparent mt-20" />
      )}
    </motion.div>
  );
}

export default function ProShowsPage() {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });

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
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0e1b14] border border-[#39ff88]/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse" />
              <span className="font-mono text-xs text-[#39ff88] tracking-widest uppercase">AUDITORY CORE // STAGE TRANSMISSIONS</span>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              <h1 className="font-orbitron text-[12vw] md:text-[10vw] lg:text-[130px] font-black tracking-tighter leading-none bg-gradient-to-r from-white via-[#39ff88] to-[#18c96a] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(57,255,136,0.3)]">
                PRO SHOWS
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-[#bfc8c3]/80 font-light max-w-3xl mx-auto"
            >
              Four nights of high-voltage sonic transmissions powered by the biggest names in the global music matrix.
            </motion.p>
          </motion.div>

          <div className="space-y-20">
            {proshows.map((show, showIndex) => (
              <ShowCard key={showIndex} show={show} showIndex={showIndex} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-24 text-center"
          >
            <motion.a
              href="https://drive.google.com/file/d/178-_OyFP-BL9VQ1h_wkBRa3GsV0BvXma/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-[#39ff88] text-black font-orbitron font-bold text-sm uppercase tracking-widest hover:bg-[#18c96a] transition-all shadow-[0_0_30px_rgba(57,255,136,0.3)]"
            >
              <span>ACCESS FULL TIMELINE MATRIX</span>
            </motion.a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}