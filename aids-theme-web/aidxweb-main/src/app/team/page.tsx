"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform, useSpring, useScroll, useVelocity } from "framer-motion";
import Image from "next/image";
import { Instagram, Linkedin, Terminal, Shield, Code, Cpu } from "lucide-react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import MobileNav from "@/components/sections/MobileNav";
import TeamHero from "@/components/sections/TeamHero";
import config from "@/config";
import { safeJsonResponse } from "@/lib/utils";

// --- Types ---
interface TeamMember {
  _id: string;
  name: string;
  role: string;
  category: string;
  image?: { url: string };
  instagram?: string;
  linkedin?: string;
}

interface SectionGroup {
  category: string;
  members: TeamMember[];
}

// --- Components ---

// Individual Profile Card - DOSSIER STYLE
const ProfileCard = ({ member, priority = false }: { member: TeamMember, priority?: boolean }) => {
  return (
    <div className="relative group w-[260px] h-[350px] md:w-[300px] md:h-[400px] flex-shrink-0 mx-4 md:mx-6 bg-[#0b1510]/80 rounded-xl overflow-hidden border border-[#39ff88]/20 hover:border-[#39ff88] hover:shadow-[0_0_25px_rgba(57,255,136,0.25)] transition-all duration-300 backdrop-blur-sm">

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[#39ff88]/40 group-hover:border-[#39ff88] transition-colors z-20"></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-[#39ff88]/40 group-hover:border-[#39ff88] transition-colors z-20"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-[#39ff88]/40 group-hover:border-[#39ff88] transition-colors z-20"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[#39ff88]/40 group-hover:border-[#39ff88] transition-colors z-20"></div>

      {/* Image Container */}
      <div className="absolute inset-0 z-0 bg-[#050806]">
        {member.image?.url ? (
          <>
            <Image
              src={member.image.url}
              alt={member.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-hover:contrast-100"
            />
            {/* Holographic Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none group-hover:opacity-10 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-transparent to-transparent opacity-90"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#050806] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #39ff88 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <span className="text-[#39ff88]/30 text-6xl font-orbitron relative z-10">{member.name.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-10 font-mono">
        <div className="flex items-center gap-2 mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-[#39ff88] rounded-full animate-pulse"></div>
          <span className="text-[10px] text-[#39ff88] tracking-widest uppercase">SYS.ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
        </div>

        <h3 className="text-2xl font-bold text-white font-orbitron mb-1 truncate group-hover:text-[#39ff88] transition-colors">{member.name}</h3>
        <p className="text-[#39ff88]/80 text-xs font-bold tracking-widest uppercase mb-6 pl-1 border-l-2 border-[#39ff88]/50">{member.role}</p>

        {/* Socials - Reveal on Hover */}
        <div className="flex gap-4 transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {member.linkedin ? (
            <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-[#39ff88]/10 border border-[#39ff88]/40 rounded-lg hover:bg-[#39ff88]/20 text-[#39ff88] hover:text-white transition-all text-xs uppercase tracking-wider">
              <Linkedin size={14} /> <span>Connect</span>
            </a>
          ) : null}
          {member.instagram ? (
            <a href={member.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-[#18c96a]/10 border border-[#18c96a]/40 rounded-lg hover:bg-[#18c96a]/20 text-[#18c96a] hover:text-white transition-all text-xs uppercase tracking-wider">
              <Instagram size={14} /> <span>Follow</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Horizontal Marquee Row
interface MarqueeProps {
  children: React.ReactNode;
  baseVelocity: number;
}

const Marquee = ({ children, baseVelocity = 100 }: MarqueeProps) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
      onClick={() => setIsPaused(!isPaused)}
    >
      <ul className={`flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-infinite-scroll hover:[animation-play-state:paused] ${isPaused ? '[animation-play-state:paused]' : ''} ${baseVelocity > 0 ? 'direction-reverse' : ''}`}>
        {children}
        {children}
        {children}
      </ul>
      <ul className={`flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-infinite-scroll hover:[animation-play-state:paused] ${isPaused ? '[animation-play-state:paused]' : ''} ${baseVelocity > 0 ? 'direction-reverse' : ''}`} aria-hidden="true">
        {children}
        {children}
        {children}
      </ul>
    </div>
  );
};

// Category Section with Auto-Scrolling Loop
const CategorySection = ({ title, members, direction = 1, priority = false }: { title: string, members: TeamMember[], direction?: number, priority?: boolean }) => {
  if (!members || members.length === 0) return null;

  const animationDuration = Math.max(20, members.length * 3);

  return (
    <div className="py-10 md:py-16 border-t border-[#39ff88]/15 relative">
      <div className="container mx-auto px-4 md:px-12 mb-8 flex items-end gap-4">

        {/* Decorative Identifier */}
        <div className="hidden md:flex flex-col gap-1 mb-2">
          <div className="w-16 h-1 bg-[#39ff88]/50"></div>
          <div className="w-8 h-1 bg-[#39ff88]/30"></div>
        </div>

        <div>
          <div className="text-[#39ff88] text-xs font-mono mb-1 tracking-widest opacity-80 uppercase">
                // COMMAND_DIVISION :: {title.replace(/\s+/g, '_').toUpperCase()}
          </div>
          <div className="relative group inline-block">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase font-orbitron tracking-wide drop-shadow-[0_0_20px_rgba(57,255,136,0.3)] relative z-10">
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* Auto-Scrolling Container */}
      <div className="relative overflow-hidden">
        <div
          className="flex gap-4 md:gap-8"
          style={{
            animation: `scroll-${direction > 0 ? 'left' : 'right'} ${animationDuration}s linear infinite`,
          }}
        >
          {(members.length < 6 ? [...members, ...members, ...members, ...members] : [...members, ...members]).map((member, index) => (
            <div key={`${member._id}-${index}`} className="flex-shrink-0">
              <ProfileCard member={member} priority={priority && index < members.length} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function TeamPage() {
  const [teamData, setTeamData] = useState<Record<string, TeamMember[]>>({});
  const [loading, setLoading] = useState(true);

  // Suggested Categories Order
  const categoryOrder = [
    'Faculty Coordinators',
    'Student Coordinators',
    'Event Coordinators',
    'AIDEX Club',
    'Technical Team',
    'Cultural Team',
    'Design & Media Team',
    'Club Members',
    'Volunteers / Core Committee'
  ];

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${config.API_URL}/team`);
        const data = await safeJsonResponse(res);

        if (data && data.success && Array.isArray(data.data)) {
          const grouped: Record<string, TeamMember[]> = {};

          data.data.forEach((member: TeamMember) => {
            let category = member.category;
            if (category === "Vistara Club Members") {
              category = "Club Members";
            }
            if (category === "NEXATHON Club") {
              category = "AIDEX'26 Club";
            }

            if (!grouped[category]) {
              grouped[category] = [];
            }
            grouped[category].push(member);
          });

          setTeamData(grouped);
        }
      } catch (err) {
        console.error("Failed to fetch team:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="min-h-screen bg-[#050806] text-white selection:bg-[#39ff88]/30 overflow-x-hidden">

      {/* Background Grid Effect */}
      <div className="fixed inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(57, 255, 136, 0.15) 1px, transparent 1px),
             linear-gradient(90deg, rgba(57, 255, 136, 0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      <MobileNav />
      <Header />

      <main className="pt-16 md:pt-20 relative z-10">
        <TeamHero />

        {loading ? (
          <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-t-[#39ff88] border-r-transparent border-b-[#18c96a] border-l-transparent rounded-full animate-spin"></div>
            <p className="text-[#39ff88] font-mono text-sm animate-pulse tracking-widest">
              [ ACCESSING_CLASSIFIED_ROSTER... ]
            </p>
          </div>
        ) : (
          <div className="pb-24 space-y-8">
            {categoryOrder.map((cat, index) => {
              const members = teamData[cat];
              if (!members) return null;
              const direction = index % 2 === 0 ? 1 : -1;
              return <CategorySection key={cat} title={cat} members={members} direction={direction} priority={index === 0} />;
            })}

            {/* Render any categories not in the predefined list */}
            {Object.keys(teamData).filter(c => !categoryOrder.includes(c)).map((cat, index) => (
              <CategorySection key={cat} title={cat} members={teamData[cat]} direction={1} />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Background Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
    </div>
  );
}

