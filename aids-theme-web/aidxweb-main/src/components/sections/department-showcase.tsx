"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Cpu, Database, Network, BrainCircuit, Bot, Code2 } from "lucide-react";

const DepartmentShowcase = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    // Node positions (percentages for responsiveness)
    const nodes = [
        { icon: <BrainCircuit size={28} />, label: "Machine Learning", x: "-35%", y: "-35%", color: "text-[#39ff88]", delay: 0.2 },
        { icon: <Database size={28} />, label: "Neural Archives", x: "35%", y: "-35%", color: "text-[#18c96a]", delay: 0.4 },
        { icon: <Network size={28} />, label: "Deep Learning", x: "-35%", y: "35%", color: "text-[#39ff88]", delay: 0.6 },
        { icon: <Bot size={28} />, label: "Autonomous AI", x: "35%", y: "35%", color: "text-[#bfc8c3]", delay: 0.8 },
    ];

    return (
        <section ref={ref} className="relative w-full py-32 bg-[#050806] overflow-hidden flex flex-col items-center justify-center min-h-[90vh] border-t border-[#39ff88]/15">

            {/* Background Grid & Beams */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,136,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,136,0.08)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#050806_80%)]"></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl px-4 flex flex-col items-center text-center">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-16"
                >
                    <div className="inline-flex items-center gap-2 border border-[#39ff88]/30 bg-[#39ff88]/5 px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse" />
                        <span className="text-[#39ff88] text-xs font-mono tracking-[0.25em] uppercase font-bold">
                            DOOM_AI_CORE_ARCHITECTURE_v.2.6
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-black text-white font-audiowide uppercase drop-shadow-[0_0_40px_rgba(57,255,136,0.4)] leading-tight">
                        Department of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39ff88] via-[#18c96a] to-[#bfc8c3] animate-gradient-x">
                            AI & Data Science
                        </span>
                    </h2>
                </motion.div>

                {/* Central Visual - Neural Core */}
                <div className="relative w-full max-w-[800px] h-[480px] flex items-center justify-center mb-20">

                    {/* Orbiting Rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* Ring 1 */}
                        <div className="absolute w-[60%] h-[60%] md:w-[400px] md:h-[400px] rounded-full border border-[#39ff88]/15 animate-[spin_10s_linear_infinite]" />
                        <div className="absolute w-[60%] h-[60%] md:w-[400px] md:h-[400px] rounded-full border-t border-b border-[#39ff88]/40 animate-[spin_15s_linear_infinite]" />

                        {/* Ring 2 */}
                        <div className="absolute w-[80%] h-[80%] md:w-[550px] md:h-[550px] rounded-full border border-[#18c96a]/15 animate-[spin_20s_linear_infinite_reverse]" />
                        <div className="absolute w-[80%] h-[80%] md:w-[550px] md:h-[550px] rounded-full border-l border-r border-[#18c96a]/30 animate-[spin_25s_linear_infinite_reverse]" />
                    </div>

                    {/* Connector Lines (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        {nodes.map((node, i) => (
                            <motion.line
                                key={i}
                                x1="50%" y1="50%"
                                x2={`calc(50% + ${node.x})`}
                                y2={`calc(50% + ${node.y})`}
                                stroke="url(#lineGradient)"
                                strokeWidth="1.5"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={isInView ? { pathLength: 1, opacity: 0.5 } : {}}
                                transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                            />
                        ))}
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#39ff88" stopOpacity="0" />
                                <stop offset="50%" stopColor="#39ff88" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#18c96a" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Central Brain Core */}
                    <motion.div
                        className="relative z-20 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                    >
                        <div className="absolute inset-0 bg-[#39ff88]/25 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative w-full h-full bg-[#08100b] rounded-full border-2 border-[#39ff88]/60 flex items-center justify-center shadow-[0_0_50px_rgba(57,255,136,0.5)]">
                            <BrainCircuit className="w-16 h-16 text-[#39ff88]" />
                        </div>
                    </motion.div>

                    {/* Nodes */}
                    {nodes.map((node, i) => (
                        <motion.div
                            key={i}
                            className="absolute z-20 flex flex-col items-center gap-3 cursor-pointer group"
                            style={{
                                left: `calc(50% + ${node.x})`,
                                top: `calc(50% + ${node.y})`,
                                x: "-50%",
                                y: "-50%"
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ type: "spring", duration: 0.8, delay: node.delay }}
                            whileHover={{ scale: 1.1 }}
                        >
                            {/* Icon Circle */}
                            <div className={`relative p-4 rounded-xl bg-[#0e1b14] border border-[#39ff88]/30 group-hover:border-[#39ff88] transition-all duration-300 shadow-lg group-hover:shadow-[0_0_25px_rgba(57,255,136,0.4)]`}>
                                <div className={`${node.color} group-hover:text-white transition-colors duration-300`}>
                                    {node.icon}
                                </div>
                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#39ff88]" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#39ff88]" />
                            </div>

                            {/* Label */}
                            <div className="px-3 py-1 rounded-full bg-[#050806]/90 border border-[#39ff88]/20 backdrop-blur-sm">
                                <span className={`text-xs font-mono font-bold tracking-widest uppercase text-slate-300 group-hover:text-[#39ff88] transition-colors whitespace-nowrap`}>
                                    {node.label}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Description Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="max-w-3xl mx-auto text-center space-y-6"
                >
                    <p className="text-xl md:text-2xl text-slate-200 font-light tracking-wide leading-relaxed">
                        "Unleashing the power of algorithms to conquer technical frontiers."
                    </p>
                    <p className="text-sm md:text-base text-slate-400 font-mono leading-relaxed max-w-2xl mx-auto">
                        <span className="text-[#39ff88] font-bold">:: DOOM_SYSTEM_LOG :: </span>
                        Merging high-performance machine learning, deep neural modeling, and classified algorithmic frameworks to engineer victory.
                    </p>
                </motion.div>

            </div>
        </section>
    );
};

export default DepartmentShowcase;
