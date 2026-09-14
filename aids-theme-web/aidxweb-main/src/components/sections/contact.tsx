"use client";

import React from "react";
import { Mail, Phone, MapPin, Globe, Radio, Terminal } from "lucide-react";

const ContactSection = () => {
    return (
        <section id="contact" className="relative w-full py-24 px-4 md:px-12 lg:px-24 bg-[#050806] overflow-hidden border-t border-[#39ff88]/10">

            <div className="relative z-10 w-full max-w-6xl mx-auto">
                <div className="text-center mb-16 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#39ff88]/30 bg-[#39ff88]/10 mb-4 text-[#39ff88] text-xs font-mono uppercase tracking-widest">
                        <Radio className="w-3.5 h-3.5 animate-pulse" /> SECURE UPLINK CHANNELS
                    </div>
                    <div className="relative group inline-block mb-3">
                        <h2 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-wider relative z-10 drop-shadow-[0_0_25px_rgba(57,255,136,0.3)]">
                            COMMUNICATION MATRIX
                        </h2>
                    </div>
                    <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#39ff88] to-transparent mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Faculty Directorate */}
                    <div className="bg-[#0b1510]/80 border border-[#39ff88]/20 p-6 rounded-xl group hover:border-[#39ff88]/60 hover:shadow-[0_0_25px_rgba(57,255,136,0.15)] transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-[#39ff88]/10 rounded-lg border border-[#39ff88]/20 group-hover:bg-[#39ff88]/20 transition-all">
                                <Globe className="w-6 h-6 text-[#39ff88]" />
                            </div>
                            <h3 className="text-lg font-orbitron font-bold text-white uppercase">Directorate</h3>
                        </div>
                        <div className="space-y-4 font-mono text-xs md:text-sm text-[#bfc8c3]/80">
                            <div className="border-l-2 border-[#39ff88]/40 pl-3">
                                <p className="text-white font-bold">Dr. Immanuvel Arokia James</p>
                                <p className="text-xs text-[#39ff88]/70">Head of the Department</p>
                            </div>
                            <div className="border-l-2 border-[#39ff88]/40 pl-3">
                                <p className="text-white font-bold">Daisy Marina</p>
                                <p className="text-xs text-[#39ff88]/70">Assistant Professor</p>
                            </div>
                        </div>
                    </div>

                    {/* Operative Comms */}
                    <div className="bg-[#0b1510]/80 border border-[#39ff88]/20 p-6 rounded-xl group hover:border-[#39ff88]/60 hover:shadow-[0_0_25px_rgba(57,255,136,0.15)] transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-[#39ff88]/10 rounded-lg border border-[#39ff88]/20 group-hover:bg-[#39ff88]/20 transition-all">
                                <Phone className="w-6 h-6 text-[#39ff88]" />
                            </div>
                            <h3 className="text-lg font-orbitron font-bold text-white uppercase">Lead Operatives</h3>
                        </div>
                        <div className="space-y-3 font-mono text-xs md:text-sm text-[#bfc8c3]/80">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-white font-semibold">Akash</span>
                                <span className="text-xs text-[#39ff88]">+91 9042275478</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-white font-semibold">Mohan</span>
                                <span className="text-xs text-[#39ff88]">+91 8838528151</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-white font-semibold">Rohit</span>
                                <span className="text-xs text-[#39ff88]">+91 7200516950</span>
                            </div>
                            <div className="mt-3 text-[10px] text-center text-[#39ff88]/60 uppercase tracking-widest font-bold">
                                [ ENCRYPTED_FREQUENCY_OPEN ]
                            </div>
                        </div>
                    </div>

                    {/* Base Coordinates */}
                    <div className="bg-[#0b1510]/80 border border-[#39ff88]/20 p-6 rounded-xl group hover:border-[#39ff88]/60 hover:shadow-[0_0_25px_rgba(57,255,136,0.15)] transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-[#39ff88]/10 rounded-lg border border-[#39ff88]/20 group-hover:bg-[#39ff88]/20 transition-all">
                                <MapPin className="w-6 h-6 text-[#39ff88]" />
                            </div>
                            <h3 className="text-lg font-orbitron font-bold text-white uppercase">HQ Coordinates</h3>
                        </div>
                        <div className="space-y-4 font-mono text-xs md:text-sm text-[#bfc8c3]/80">
                            <p className="leading-relaxed">
                                Vel Tech Multi Tech Dr.Rangarajan Dr.Sakunthala Engineering College,<br />
                                Avadi, Chennai - 62.
                            </p>
                            <div className="flex items-center gap-2 text-[#39ff88] pt-1">
                                <Mail className="w-4 h-4 text-[#39ff88]" />
                                <a href="mailto:nexathon2k26@veltech.edu" className="hover:underline font-mono text-xs">aidex26@veltech.edu</a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ContactSection;
