"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/sections/header";
import MobileNav from "@/components/sections/MobileNav";
import Footer from "@/components/sections/footer";
import config from "@/config";

interface Winner {
  place: number;
  name: string;
  teamName: string;
}

interface EventWithWinners {
  id: string;
  title: string;
  category: string;
  date?: string;
  winners?: Winner[];
}

const PODIUM_CONFIG = [
  { place: 1, label: "🥇 1st Place", bgColor: "#ffd700", textColor: "#1a1000", glow: "#ffd70080", height: "h-32" },
  { place: 2, label: "🥈 2nd Place", bgColor: "#c0c0c0", textColor: "#111", glow: "#c0c0c060", height: "h-24" },
  { place: 3, label: "🥉 3rd Place", bgColor: "#cd7f32", textColor: "#1a0a00", glow: "#cd7f3260", height: "h-16" },
];

function PodiumCard({ winner, config: pc }: { winner?: Winner; config: typeof PODIUM_CONFIG[0] }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
      <div
        className="w-full rounded-xl border p-3 text-center"
        style={{
          borderColor: `${pc.bgColor}40`,
          background: `linear-gradient(135deg, ${pc.bgColor}12, ${pc.bgColor}05)`,
          boxShadow: `0 0 20px ${pc.glow}`,
        }}
      >
        <span className="text-xl block mb-1">{pc.label.split(" ")[0]}</span>
        {winner ? (
          <>
            <p className="font-bold text-white text-sm leading-tight">{winner.name}</p>
            {winner.teamName && <p className="text-xs mt-0.5" style={{ color: pc.bgColor }}>{winner.teamName}</p>}
          </>
        ) : (
          <p className="text-xs text-gray-600 font-mono">TBA</p>
        )}
      </div>
      <div
        className={`w-full rounded-b-sm ${pc.height}`}
        style={{ background: `linear-gradient(180deg, ${pc.bgColor}30, ${pc.bgColor}08)`, borderTop: `2px solid ${pc.bgColor}50` }}
      />
      <p className="text-[10px] font-mono text-gray-500">{pc.label.split(" ").slice(1).join(" ")}</p>
    </div>
  );
}

function EventResultCard({ event }: { event: EventWithWinners }) {
  const hasWinners = event.winners && event.winners.length > 0;
  const winnerMap: Record<number, Winner> = {};
  if (event.winners) {
    event.winners.forEach((w) => { winnerMap[w.place] = w; });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0a120a] border border-white/8 rounded-2xl p-6 mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-1 rounded-full bg-[#39ff88]" />
        <div>
          <h2 className="font-bold text-white font-audiowide text-base">{event.title}</h2>
          <span className="text-[10px] font-mono text-[#39ff88]/70 uppercase tracking-wider">{event.category}</span>
        </div>
      </div>

      {hasWinners ? (
        <div className="flex items-end justify-center gap-4">
          {/* 2nd Place first (left) */}
          <PodiumCard winner={winnerMap[2]} config={PODIUM_CONFIG[1]} />
          {/* 1st Place center (tallest) */}
          <PodiumCard winner={winnerMap[1]} config={PODIUM_CONFIG[0]} />
          {/* 3rd Place (right) */}
          <PodiumCard winner={winnerMap[3]} config={PODIUM_CONFIG[2]} />
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
          <p className="text-gray-600 font-mono text-sm">⏳ Results not yet announced</p>
        </div>
      )}
    </motion.div>
  );
}

export default function ResultsPage() {
  const [events, setEvents] = useState<EventWithWinners[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [glitch, setGlitch] = useState("LOADING...");
  const full = "RESULTS_BOARD";

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setGlitch(full.substring(0, i) + (i % 2 === 0 ? "_" : ""));
      i++;
      if (i > full.length) clearInterval(iv);
    }, 80);
    fetch(`${config.API_URL}/events`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setEvents(d.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
    return () => clearInterval(iv);
  }, []);

  const categories = ["all", ...Array.from(new Set(events.map((e) => e.category).filter(Boolean)))];
  const filtered = filter === "all" ? events : events.filter((e) => e.category === filter);
  const withWinners = filtered.filter((e) => e.winners && e.winners.length > 0);
  const withoutWinners = filtered.filter((e) => !e.winners || e.winners.length === 0);
  const sorted = [...withWinners, ...withoutWinners];

  return (
    <>
      <MobileNav />
      <Header />
      <main className="min-h-screen bg-[#050806] text-white pt-28 pb-20">
        {/* Hero */}
        <div className="text-center px-4 mb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-[#39ff88] font-mono text-xs uppercase tracking-[6px] mb-3">&gt; AIDEX 2026 // PODIUM</p>
            <h1 className="text-4xl md:text-6xl font-black font-audiowide text-white mb-4 tracking-tighter">{glitch}</h1>
            <p className="text-gray-400 font-mono text-sm max-w-lg mx-auto">
              Official event results and winners. Podium announcements are published here as they are finalized.
            </p>
          </motion.div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition-all ${
                filter === cat
                  ? "bg-[#39ff88] text-[#050806] border-[#39ff88] font-bold"
                  : "border-white/15 text-gray-400 hover:border-[#39ff88]/40 hover:text-[#39ff88]/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <div className="w-8 h-8 border-2 border-[#39ff88]/20 border-t-[#39ff88] rounded-full animate-spin" />
              <p className="text-gray-500 font-mono text-xs">Fetching results...</p>
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-center text-gray-500 font-mono text-sm py-20">No events found for this filter.</p>
          ) : (
            sorted.map((event) => <EventResultCard key={event.id} event={event} />)
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/events" className="text-[#39ff88] font-mono text-xs hover:underline">
            ← Back to Events
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
