"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Header from "@/components/sections/header";
import MobileNav from "@/components/sections/MobileNav";
import Footer from "@/components/sections/footer";
import config from "@/config";

interface ScheduleEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  description: string;
  coordinatorPhone?: string;
  participationType: string;
  teamSize?: string;
  isFree?: boolean;
  entryFee?: number;
  maxSlots?: number;
  registeredCount?: number;
}

const CAT_COLORS: Record<string, string> = {
  Technical: "#39ff88",
  Cultural: "#ff6b6b",
  Workshop: "#ffd93d",
  Gaming: "#a855f7",
  Sports: "#fb923c",
  Literary: "#60a5fa",
};

function getCatColor(cat: string): string {
  return CAT_COLORS[cat] || "#a0aec0";
}

function TimelineCard({ event, index }: { event: ScheduleEvent; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const isLeft = index % 2 === 0;
  const color = getCatColor(event.category);

  return (
    <div
      ref={ref}
      className={`relative flex items-start w-full mb-10 ${
        isLeft ? "justify-end pr-[52%]" : "justify-start pl-[52%]"
      }`}
    >
      {/* Dot */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10 top-5"
        style={{ borderColor: color, background: "#050806", boxShadow: `0 0 12px ${color}90` }}
      />
      {/* Connector line to dot */}
      <div
        className={`absolute top-[26px] h-px w-[8%] z-[5] ${isLeft ? "right-1/2" : "left-1/2"}`}
        style={{ backgroundColor: `${color}50` }}
      />

      <motion.div
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="w-[90%] max-w-xs"
      >
        <div
          className="rounded-xl border p-4 text-sm"
          style={{
            borderColor: `${color}25`,
            background: "rgba(10,20,10,0.85)",
            boxShadow: `0 2px 20px ${color}0f`,
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {event.category}
            </span>
            {event.time && (
              <span className="text-[10px] text-gray-500 font-mono">{event.time}</span>
            )}
          </div>
          <h3 className="font-bold text-white font-audiowide text-sm mb-1">{event.title}</h3>
          <p className="text-gray-500 text-[11px] mb-3 line-clamp-2 font-mono">{event.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-3 text-[10px] text-gray-500 font-mono">
              <span>{event.participationType === "Solo" ? "Solo" : `Team (${event.teamSize || "2+"})`}</span>
              {event.maxSlots ? (
                <span style={{ color }}>
                  {event.registeredCount ?? 0}/{event.maxSlots}
                </span>
              ) : null}
            </div>
            <Link
              href="/events"
              className="text-[10px] px-2 py-0.5 rounded border font-mono transition-colors hover:opacity-75"
              style={{ borderColor: `${color}40`, color }}
            >
              Register
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [glitch, setGlitch] = useState("LOADING...");
  const fullTitle = "EVENT_SCHEDULE";

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setGlitch(fullTitle.substring(0, i) + (i % 2 === 0 ? "_" : ""));
      i++;
      if (i > fullTitle.length) clearInterval(iv);
    }, 75);

    fetch(`${config.API_URL}/events`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setEvents(d.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => clearInterval(iv);
  }, []);

  const grouped = events.reduce<Record<string, ScheduleEvent[]>>((acc, ev) => {
    const key = ev.date || "TBA";
    acc[key] = acc[key] || [];
    acc[key].push(ev);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => {
    if (a === "TBA") return 1;
    if (b === "TBA") return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <>
      <MobileNav />
      <Header />
      <main className="min-h-screen bg-[#050806] text-white pt-28 pb-20">
        {/* Hero */}
        <div className="text-center px-4 mb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-[#39ff88] font-mono text-xs uppercase tracking-[6px] mb-3">&gt; AIDEX 2026 // TIMELINE</p>
            <h1 className="text-4xl md:text-6xl font-black font-audiowide text-white mb-4 tracking-tighter">{glitch}</h1>
            <p className="text-gray-400 font-mono text-sm max-w-lg mx-auto">
              Full timeline of every AIDEX&apos;26 event. Scroll through, plan your day &amp; register on the spot.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[#39ff88]/20 border-t-[#39ff88] rounded-full animate-spin" />
            <p className="text-gray-500 font-mono text-xs">Fetching schedule...</p>
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500 font-mono text-sm py-20">No events published yet.</p>
        ) : (
          <div className="max-w-4xl mx-auto px-4">
            {sortedDates.map((dateKey) => (
              <div key={dateKey} className="mb-16">
                <div className="text-center mb-10">
                  <span className="font-audiowide text-base font-bold text-[#39ff88] border border-[#39ff88]/30 px-6 py-2 rounded-full bg-[#39ff88]/5">
                    {dateKey === "TBA"
                      ? "⏳ Date To Be Announced"
                      : new Date(dateKey).toLocaleDateString("en-IN", {
                          weekday: "long", year: "numeric", month: "long", day: "numeric",
                        })}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#39ff88]/60 via-[#39ff88]/15 to-transparent pointer-events-none" />
                  {grouped[dateKey].map((ev, i) => (
                    <TimelineCard key={ev.id || i} event={ev} index={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="text-center mt-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#39ff88]/10 border border-[#39ff88]/50 text-[#39ff88] font-bold font-mono text-sm uppercase tracking-widest hover:bg-[#39ff88] hover:text-[#050806] hover:shadow-[0_0_20px_#39ff88] transition-all duration-300 rounded-sm"
            >
              <span className="w-1.5 h-1.5 bg-[#39ff88] rounded-full animate-pulse" />
              Browse &amp; Register
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
