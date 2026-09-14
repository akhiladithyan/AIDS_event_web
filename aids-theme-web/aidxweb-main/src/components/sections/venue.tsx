"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
import AnimatedTitle from "../ui/AnimatedTitle";

const VenueSection = () => {
    return (
        <section id="venue" className="relative w-full py-24 bg-[#050806] overflow-hidden border-t border-[#39ff88]/15">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0b6b3a]/15 via-[#050806] to-[#050806]" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#39ff88]/50 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-block border border-[#39ff88]/30 bg-[#39ff88]/5 px-4 py-1 rounded-sm mb-4 backdrop-blur-sm">
                        <span className="text-[#39ff88] text-xs md:text-sm font-mono tracking-widest uppercase font-bold animate-pulse">
                            :: TARGET_COORDINATES_LOCKED ::
                        </span>
                    </div>
                    <AnimatedTitle>THE VENUE</AnimatedTitle>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#18c96a] to-[#39ff88] mx-auto rounded-full mt-4 shadow-[0_0_10px_#39ff88]" />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="bg-[#0e1b14]/80 backdrop-blur-md border border-[#39ff88]/20 p-8 rounded-sm hover:border-[#39ff88]/60 hover:shadow-[0_0_25px_rgba(57,255,136,0.15)] transition-all duration-300 group">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#39ff88]/10 rounded-sm text-[#39ff88] group-hover:bg-[#39ff88]/20 transition-colors shadow-[0_0_10px_rgba(57,255,136,0.2)]">
                                    <MapPin size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold font-audiowide text-white mb-2">Location</h3>
                                    <p className="text-slate-300 text-lg leading-relaxed font-mono text-sm">
                                        Vel Tech Multi Tech,<br />
                                        #42, Avadi - Vel Tech Road,<br />
                                        Avadi, Chennai, Tamil Nadu - 600062
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0e1b14]/80 backdrop-blur-md border border-[#39ff88]/20 p-8 rounded-sm hover:border-[#39ff88]/60 hover:shadow-[0_0_25px_rgba(57,255,136,0.15)] transition-all duration-300 group">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#18c96a]/15 rounded-sm text-[#18c96a] group-hover:bg-[#18c96a]/25 transition-colors shadow-[0_0_10px_rgba(24,201,106,0.2)]">
                                    <Calendar size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold font-audiowide text-white mb-2">Date & Time</h3>
                                    <p className="text-slate-300 text-lg leading-relaxed font-mono text-sm">
                                        October 7, 2026<br />
                                        09:00 AM - 03:00 PM
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <motion.a
                                href="https://maps.google.com/?q=Vel+Tech+Multi+Tech+Dr.Rangarajan+Dr.Sakunthala+Engineering+College"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-8 py-4 bg-[#0e1b14] border border-[#39ff88]/40 rounded-full overflow-hidden flex items-center gap-3 hover:border-[#39ff88] hover:shadow-[0_0_25px_rgba(57,255,136,0.3)] transition-all cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0b6b3a]/30 to-[#39ff88]/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="relative z-10 font-bold font-mono uppercase tracking-widest text-xs text-white group-hover:text-[#39ff88] transition-colors">
                                    Initiate_Navigation &rarr;
                                </span>
                            </motion.a>
                        </div>
                    </motion.div>

                    {/* Map / Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="relative h-[400px] w-full rounded-sm overflow-hidden border border-[#39ff88]/30 shadow-[0_0_30px_rgba(57,255,136,0.1)] group bg-black/50"
                    >
                        {/* Focusing Reticle Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-20 border-[1px] border-[#39ff88]/10">
                            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[#39ff88]"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[#39ff88]"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[#39ff88]"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[#39ff88]"></div>

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-[#39ff88]/40 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 bg-[#ff3030] rounded-full animate-ping"></div>
                                <div className="absolute top-0 w-[1px] h-full bg-[#39ff88]/30"></div>
                                <div className="absolute left-0 h-[1px] w-full bg-[#39ff88]/30"></div>
                            </div>
                        </div>

                        {/* Map iframe */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.6874837494747!2d80.0969643!3d13.1166667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a528f8f0b0b0b0b%3A0x0!2sVel%20Tech%20Multi%20Tech!5e0!3m2!1sen!2sin!4v1645423645786"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'invert(90%) hue-rotate(100deg) contrast(1.3) grayscale(0.6)' }}
                            allowFullScreen={true}
                            loading="lazy"
                            title="Vel Tech Multi Tech Map"
                            className="opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                        ></iframe>

                        {/* Tech Overlay */}
                        <div className="absolute top-4 right-4 bg-[#050806]/90 backdrop-blur-md px-4 py-2 rounded-sm text-[#39ff88] font-mono text-xs border border-[#39ff88]/50 z-30 shadow-[0_0_10px_rgba(57,255,136,0.2)]">
                            LATVERIAN_SYS: <span className="animate-pulse font-bold">ONLINE</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default VenueSection;
