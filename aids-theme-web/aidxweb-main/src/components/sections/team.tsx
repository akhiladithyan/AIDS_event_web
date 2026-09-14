"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Users, GraduationCap, Calendar, ShieldCheck, Terminal } from "lucide-react";
import config from "@/config";
import { safeJsonResponse } from "@/lib/utils";

interface TeamMember {
    _id?: string;
    name: string;
    role: string;
    category: string;
    image: string;
    isActive: boolean;
}

export default function TeamSection() {
    const [teamData, setTeamData] = useState<{
        faculty: TeamMember[];
        student: TeamMember[];
        event: TeamMember[];
    }>({
        faculty: [],
        student: [],
        event: []
    });

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const res = await fetch(`${config.API_URL}/team`);
                const data = await safeJsonResponse(res);

                if (data && data.success && data.data) {
                    const allMembers = data.data.filter((member: TeamMember) => member.isActive);

                    setTeamData({
                        faculty: allMembers.filter((m: TeamMember) => m.category === 'Faculty Coordinators'),
                        student: allMembers.filter((m: TeamMember) => m.category === 'Student Coordinators'),
                        event: allMembers.filter((m: TeamMember) => m.category === 'Event Coordinators')
                    });
                }
            } catch (error) {
                console.error("Failed to fetch team data", error);
            }
        };

        fetchTeamData();
    }, []);

    const renderMemberCard = (member: TeamMember, accentClass: string, Icon: any) => (
        <motion.div
            key={member._id}
            whileHover={{ scale: 1.05, y: -4 }}
            className="relative bg-[#0b1510]/80 border border-[#39ff88]/20 hover:border-[#39ff88]/60 rounded-xl p-6 flex flex-col items-center text-center backdrop-blur-md group transition-all duration-300 min-w-[220px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(57,255,136,0.15)]"
        >
            <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-mono text-[#39ff88]/60 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-pulse"></span>
                ACTIVE
            </div>
            <div className="p-3.5 rounded-xl bg-[#39ff88]/10 border border-[#39ff88]/20 mb-4 group-hover:bg-[#39ff88]/20 group-hover:border-[#39ff88]/50 transition-all shadow-[0_0_15px_rgba(57,255,136,0.1)]">
                <Icon className="w-6 h-6 text-[#39ff88]" />
            </div>
            <h3 className="font-orbitron font-bold text-lg text-white mb-1 group-hover:text-[#39ff88] transition-colors">{member.name}</h3>
            <p className="text-[#bfc8c3]/60 text-xs font-mono uppercase tracking-wider">{member.role}</p>
        </motion.div>
    );

    return (
        <section id="team" className="relative w-full py-24 px-4 md:px-12 lg:px-24 bg-[#050806] overflow-hidden flex flex-col items-center justify-center">

            {/* Background Tech Grids */}
            <div className="absolute inset-0 z-0 opacity-15"
                style={{
                    backgroundImage: `linear-gradient(rgba(57, 255, 136, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 136, 0.15) 1px, transparent 1px)`,
                    backgroundSize: '35px 35px'
                }}
            ></div>
            <div className="absolute inset-0 bg-radial-vignette opacity-80 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#39ff88]/30 bg-[#39ff88]/10 mb-4 text-[#39ff88] text-xs font-mono uppercase tracking-widest">
                        <Terminal className="w-3.5 h-3.5" /> COMMAND ARCHITECTURE
                    </div>
                    
                    <div className="relative group inline-block mb-3">
                        <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-b from-white via-[#bfc8c3] to-[#39ff88] bg-clip-text text-transparent font-orbitron uppercase relative z-10 drop-shadow-[0_0_30px_rgba(57,255,136,0.3)]">
                            HIGH COMMAND
                        </h2>
                    </div>
                    <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#39ff88] to-transparent mx-auto"></div>
                    <p className="mt-4 text-[#bfc8c3]/70 font-rajdhani font-semibold uppercase tracking-widest text-sm md:text-base">
                        ARCHITECTS OF THE AIDEX&apos;26 DOOMSDAY PROTOCOL
                    </p>
                </motion.div>

                <div className="space-y-14">

                    {/* Faculty Coordinators */}
                    {teamData.faculty.length > 0 && (
                        <div className="relative">
                            <h3 className="text-[#39ff88] font-orbitron text-lg md:text-xl mb-6 text-center uppercase tracking-widest flex items-center justify-center gap-4">
                                <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#39ff88]/50"></span>
                                Faculty Directorate
                                <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#39ff88]/50"></span>
                            </h3>
                            <div className="flex flex-wrap justify-center gap-6">
                                {teamData.faculty.map(member => renderMemberCard(member, "#39ff88", GraduationCap))}
                            </div>
                        </div>
                    )}

                    {/* Student Coordinators */}
                    {teamData.student.length > 0 && (
                        <div className="relative">
                            <h3 className="text-[#18c96a] font-orbitron text-lg md:text-xl mb-6 text-center uppercase tracking-widest flex items-center justify-center gap-4">
                                <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#18c96a]/50"></span>
                                Lead Operatives
                                <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#18c96a]/50"></span>
                            </h3>
                            <div className="flex flex-wrap justify-center gap-6">
                                {teamData.student.map(member => renderMemberCard(member, "#18c96a", Users))}
                            </div>
                        </div>
                    )}

                    {/* Event Coordinators */}
                    {teamData.event.length > 0 && (
                        <div className="relative">
                            <h3 className="text-[#39ff88] font-orbitron text-lg md:text-xl mb-6 text-center uppercase tracking-widest flex items-center justify-center gap-4">
                                <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#39ff88]/50"></span>
                                Tactical Coordinators
                                <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#39ff88]/50"></span>
                            </h3>
                            <div className="flex flex-wrap justify-center gap-6">
                                {teamData.event.map(member => renderMemberCard(member, "#39ff88", Calendar))}
                            </div>
                        </div>
                    )}

                </div>

                <div className="flex justify-center mt-16">
                    <Link href="/team">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-8 py-4 bg-[#08100b] border border-[#39ff88]/40 rounded-xl overflow-hidden flex items-center gap-3 hover:border-[#39ff88] hover:shadow-[0_0_25px_rgba(57,255,136,0.3)] transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#39ff88]/10 via-[#18c96a]/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative z-10 font-orbitron text-white uppercase tracking-wider text-xs md:text-sm group-hover:text-[#39ff88] transition-colors">Access Full Roster</span>
                            <ArrowRight className="relative z-10 w-4 h-4 text-[#39ff88] group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </Link>
                </div>

            </div>
        </section>
    );
}
