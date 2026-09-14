"use client";

import React from "react";
import { motion } from "framer-motion";

const AboutSection = () => {
    return (
        <section id="about" className="relative w-full py-24 px-4 md:px-12 lg:px-24 bg-[#050806] overflow-hidden flex flex-col items-center justify-center border-t border-[#39ff88]/15">

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#39ff88]/50 to-transparent"></div>

            <div className="relative z-10 w-full max-w-5xl">
                <div className="flex flex-col md:flex-row gap-12 items-center">

                    {/* Left Column: Title & Tech Elements */}
                    <div className="w-full md:w-1/2 flex flex-col items-center text-center">
                        <div className="inline-block border border-[#39ff88]/30 bg-[#39ff88]/5 px-3 py-1 rounded-sm mb-4">
                            <span className="text-[#39ff88] text-xs font-mono tracking-widest uppercase font-bold">
                                :: DOOMSDAY_MISSION_BRIEFING ::
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-audiowide uppercase leading-tight relative group inline-block">
                            <span className="relative z-10 group-hover:text-shadow-glow transition-all">About</span> <br />
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#39ff88] via-[#18c96a] to-[#bfc8c3] group-hover:animate-pulse">AIDEX'26</span>

                            {/* Glitch Layers */}
                            <span className="absolute top-0 left-0 text-[#ff3030] opacity-0 group-hover:opacity-70 animate-glitch-1 mix-blend-screen pointer-events-none" aria-hidden="true">About <br /> AIDEX'26</span>
                            <span className="absolute top-0 left-0 text-[#39ff88] opacity-0 group-hover:opacity-70 animate-glitch-2 mix-blend-screen pointer-events-none" aria-hidden="true">About <br /> AIDEX'26</span>
                        </h2>

                        <div className="w-20 h-1 bg-[#39ff88] shadow-[0_0_10px_#39ff88] mb-8"></div>

                        {/* Tech Stats / Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                            <div className="p-4 border border-[#39ff88]/20 bg-[#0e1b14] rounded-sm hover:border-[#39ff88]/50 transition-colors">
                                <h4 className="text-[#39ff88] font-mono text-2xl font-bold">OCT 7</h4>
                                <p className="text-[#bfc8c3]/70 text-xs uppercase tracking-wider font-mono">Day Event (9am - 3pm)</p>
                            </div>
                            <div className="p-4 border border-[#39ff88]/20 bg-[#0e1b14] rounded-sm hover:border-[#39ff88]/50 transition-colors">
                                <h4 className="text-[#18c96a] font-mono text-xl font-bold">AI & DS</h4>
                                <p className="text-[#bfc8c3]/70 text-xs uppercase tracking-wider font-mono">Host Department</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="w-full md:w-1/2">
                        <div className="relative p-7 border border-[#39ff88]/20 bg-[#0b1510]/80 rounded-sm backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                            {/* Corner Accents */}
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#39ff88]"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#39ff88]"></div>

                            <p className="text-slate-300 font-mono text-sm leading-relaxed mb-4">
                                <span className="text-[#39ff88] mr-2">{">"}</span>
                                Welcome to <span className="text-white font-bold">AIDEX'26</span>, the National Level Technical Symposium proudly presented by the Department of <span className="text-[#39ff88]">Artificial Intelligence & Data Science</span> at Vel Tech Multi Tech.
                            </p>
                            <p className="text-slate-300 font-mono text-sm leading-relaxed mb-4">
                                <span className="text-[#39ff88] mr-2">{">"}</span>
                                Inspired by the collapse of boundaries in <span className="text-white font-bold">Avengers: Doomsday</span>, we are executing a classified suite of <span className="text-white">High-Stakes Technical Events</span>, AI Hackathons, and intelligence challenges designed to push participants to absolute mastery.
                            </p>
                            <p className="text-slate-300 font-mono text-sm leading-relaxed">
                                <span className="text-[#39ff88] mr-2">{">"}</span>
                                Enter the Doomsday Protocol, conquer the algorithms, and claim victory before the system resets.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AboutSection;
