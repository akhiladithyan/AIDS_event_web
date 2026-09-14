"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { User } from 'lucide-react';
import Image from 'next/image';

const juryEvents = [
    { id: 1, title: "AnyBody Can Dance" },
    { id: 2, title: "Voice Guest" },
    { id: 3, title: "Lens Legeacy" },
    { id: 4, title: "Walk Of Fame" },
    { id: 5, title: "Frame By Frame" },
];

const JuryReveal = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

    return (
        <section
            ref={sectionRef}
            className="relative w-full py-24 md:py-32 bg-black overflow-hidden flex flex-col items-center justify-center"
        >
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-7xl">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-4xl md:text-6xl lg:text-7xl font-black font-bricolage tracking-widest uppercase mb-16 bg-gradient-to-b from-white via-[#C0C0C0] to-[#505050] bg-clip-text text-transparent mix-blend-screen drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                    Event Jury
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 w-full px-4">
                    {juryEvents.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                            className="flex flex-col items-center gap-4 group"
                        >
                            <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden backdrop-blur-sm group-hover:border-purple-500/50 transition-colors duration-300">
                                <div className="absolute inset-0 bg-black/40 z-10" />
                                <Image
                                    src="/soon.svg"
                                    alt="Revealing Soon"
                                    fill
                                    sizes="(max-width: 768px) 192px, 240px"
                                    className="object-cover rounded-2xl z-20 opacity-100 group-hover:opacity-80 transition-opacity duration-300 animate-glow"
                                />
                            </div>

                            <div className="text-center">
                                <h3 className="text-lg md:text-xl font-bold font-bricolage text-white uppercase tracking-wide mb-1">
                                    {event.title}
                                </h3>
                                <span className="text-sm md:text-base font-medium font-bricolage text-transparent bg-clip-text bg-gradient-to-r from-[#29B463] to-[#DAF7A5] uppercase tracking-wider">
                                    Revealing Soon
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default JuryReveal;
