"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Instagram, Globe, Mail, MapPin, Terminal, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const CHARS = "!@#$%^&*():{};|,.<>/?ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const DecryptLink = ({ href, text, onClick, index }: { href: string; text: string; onClick: () => void; index: number }) => {
    const [displayText, setDisplayText] = useState(text);
    const [isScrambling, setIsScrambling] = useState(false);

    // Scramble effect on mount (appearance)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        let iteration = 0;

        // Delay the start based on index
        const startDelay = setTimeout(() => {
            setIsScrambling(true);
            interval = setInterval(() => {
                setDisplayText(prev =>
                    text
                        .split("")
                        .map((letter, i) => {
                            if (i < iteration) {
                                return text[i];
                            }
                            return CHARS[Math.floor(Math.random() * CHARS.length)];
                        })
                        .join("")
                );

                if (iteration >= text.length) {
                    clearInterval(interval);
                    setIsScrambling(false);
                }

                iteration += 1 / 3;
            }, 30);
        }, 100 + (index * 150)); // Staggered start

        return () => {
            clearInterval(interval);
            clearTimeout(startDelay);
        };
    }, [text, index]);

    return (
        <Link
            href={href}
            onClick={onClick}
            className="group relative flex items-center justify-start w-full py-3 overflow-hidden"
        >
            <span className="absolute left-0 w-[2px] h-full bg-[#39ff88]/0 group-hover:bg-[#39ff88] transition-colors duration-300" />
            <span
                className={`text-2xl sm:text-3xl font-black font-bricolage tracking-tighter uppercase text-left transition-all duration-300 pl-4 ${isScrambling ? 'text-white/50 blur-[1px]' : 'text-white/70 group-hover:text-white group-hover:pl-6 group-hover:scale-105 origin-left'}`}
                style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
            >
                {displayText}
            </span>

            {/* Hover Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#39ff88]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </Link>
    );
};

interface MobileNavProps {
    onRegister?: () => void;
}

const MobileNav = ({ onRegister }: MobileNavProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [time, setTime] = useState("");
    const pathname = usePathname();
    const router = useRouter();

    const getHref = (hash: string) => {
        return pathname === '/' ? hash : `/${hash}`;
    };

    const navLinks = [
        { name: 'HOME', href: '/' },
        { name: 'ABOUT', href: getHref('#about') },
        { name: 'EVENTS', href: '/events' },
        { name: 'STUDENT PASS', href: '/student' },
        { name: 'LOOKUP', href: '/lookup' },
        { name: 'TEAM', href: '/team' },
        { name: 'VENUE', href: getHref('#venue') },
        { name: 'GLIMPSES', href: getHref('#glimpses') },
        { name: 'CONTACT', href: getHref('#contact') },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    // Update time
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { hour12: false }) + " UTC+5:30");
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            {/* Mobile Nav Toggle Bar */}
            <div className={`fixed top-0 left-0 right-0 z-[100] p-4 flex justify-between items-center sm:hidden pointer-events-none transition-all duration-300 ${isOpen ? '' : 'bg-[#050806]/90 backdrop-blur-md border-b border-[#39ff88]/15'}`}>
                {/* Logo - click through permitted */}
                <Link href="/" className="pointer-events-auto group">
                    <span className="text-xl font-black font-audiowide text-white tracking-widest drop-shadow-[0_0_10px_rgba(57,255,136,0.5)] group-hover:text-[#39ff88] transition-colors">
                        AIDEX'26
                    </span>
                </Link>

                {/* Menu Button - DOOM REACTOR CORE */}
                <button
                    onClick={toggleMenu}
                    className="pointer-events-auto relative z-[110] group p-2 rounded-full transition-all active:scale-90"
                    aria-label="Toggle menu"
                >
                    <div className="relative w-12 h-12 flex justify-center items-center">
                        {/* Outer Rotating Ring */}
                        <motion.div
                            animate={{ rotate: isOpen ? 180 : 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className={`absolute inset-0 rounded-full border border-dashed border-[#39ff88]/30 transition-all duration-500 ${isOpen ? 'border-[#ff3030]/60 scale-110' : 'group-hover:border-[#39ff88]'}`}
                        />

                        {/* Inner Pulsing Core */}
                        <div className={`relative w-8 h-8 rounded-full flex flex-col justify-center items-center gap-1 transition-all duration-500 ${isOpen ? 'bg-[#ff3030]/20 shadow-[0_0_20px_rgba(255,48,48,0.6)]' : 'bg-[#0b1510] backdrop-blur-md shadow-[0_0_15px_rgba(57,255,136,0.3)] group-hover:shadow-[0_0_25px_rgba(57,255,136,0.6)]'}`}>

                            {/* Center Dot / Reactor Heart */}
                            <motion.span
                                animate={{ height: isOpen ? 24 : 4 }}
                                className={`w-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-[#ff3030] rotate-45 absolute' : 'bg-[#39ff88]'}`}
                            />
                            <motion.span
                                animate={{ height: isOpen ? 24 : 4 }}
                                className={`w-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-[#ff3030] -rotate-45 absolute' : 'bg-[#39ff88]'}`}
                            />

                            {/* Idle Side Dots */}
                            {!isOpen && (
                                <>
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-1 h-1 bg-[#39ff88] rounded-full absolute top-1.5"
                                    />
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-1 h-1 bg-[#39ff88] rounded-full absolute bottom-1.5"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </button>
            </div>

            {/* Full Screen Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[99] bg-[#050806] sm:hidden flex flex-col overflow-y-auto"
                    >
                        {/* Background Elements */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(57,255,136,0.04)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#0b6b3a]/25 via-transparent to-transparent opacity-60" />

                        {/* Content Container */}
                        <div className="relative flex flex-col min-h-full w-full max-w-sm mx-auto px-6 pt-24 pb-8">

                            {/* Navigation Links */}
                            <nav className="flex flex-col w-full items-start gap-4 mb-10 pl-4 border-l-2 border-[#39ff88]/20">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + (index * 0.05) }}
                                        className="w-full"
                                    >
                                        <DecryptLink
                                            href={link.href}
                                            text={link.name}
                                            index={index}
                                            onClick={() => setIsOpen(false)}
                                        />
                                    </motion.div>
                                ))}
                            </nav>

                            {/* Register Button */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col gap-6 w-full items-center mb-8"
                            >
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        if (onRegister) {
                                            onRegister();
                                        } else {
                                            router.push('/events');
                                        }
                                    }}
                                    className="relative w-full group overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b6b3a] via-[#18c96a] to-[#39ff88] opacity-25 group-hover:opacity-50 transition-opacity duration-300 blur-xl" />
                                    <div className="relative w-full py-4 bg-[#0b1510] border border-[#39ff88]/50 rounded-xl backdrop-blur-sm flex items-center justify-center gap-2 group-hover:border-[#39ff88] group-hover:shadow-[0_0_25px_rgba(57,255,136,0.3)] transition-all">
                                        <span className="font-black font-audiowide text-white tracking-widest uppercase text-lg group-hover:tracking-[0.2em] transition-all duration-300">
                                            Initiate Protocol
                                        </span>
                                        <span className="text-[#39ff88] animate-pulse">_</span>
                                    </div>
                                    {/* Corner Accents */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#39ff88]" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#39ff88]" />
                                </button>

                                <div className="flex flex-col items-center">
                                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-1 font-audiowide">System Target Date</span>
                                    <span className="text-xl font-black font-audiowide bg-gradient-to-r from-white via-[#39ff88] to-[#18c96a] bg-clip-text text-transparent">OCTOBER 7, 2026</span>
                                </div>
                            </motion.div>

                            {/* Footer Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="border-t border-[#39ff88]/15 pt-6 space-y-6 font-mono text-xs"
                            >
                                {/* Location */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[#39ff88] opacity-90">
                                        <Terminal size={14} />
                                        <span className="tracking-widest uppercase text-[10px] font-audiowide">System Location</span>
                                    </div>
                                    <div className="space-y-1 text-slate-400 pl-5 border-l border-white/10 text-[11px]">
                                        <p className="flex items-center gap-2"><MapPin size={12} className="text-[#18c96a]" /> Vel Tech Multi Tech</p>
                                        <p>#42, Avadi - Vel Tech Road,</p>
                                        <p>Avadi, Chennai - 600062</p>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[#39ff88] opacity-90">
                                        <ShieldAlert size={14} />
                                        <span className="tracking-widest uppercase text-[10px] font-audiowide">Digital Uplink</span>
                                    </div>
                                    <div className="flex gap-3 pl-5">
                                        <a href="https://www.youtube.com/@VELTECHMULTITECHENGINEERINGCOL" target="_blank" rel="noreferrer"
                                            className="w-10 h-10 flex items-center justify-center border border-[#39ff88]/20 bg-white/5 rounded-lg hover:bg-red-500/20 hover:border-red-500 hover:text-white text-slate-400 transition-all">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                        </a>
                                        <a href="https://www.instagram.com/veltech_multitech1999/" target="_blank" rel="noreferrer"
                                            className="w-10 h-10 flex items-center justify-center border border-[#39ff88]/20 bg-white/5 rounded-lg hover:bg-[#39ff88]/20 hover:border-[#39ff88] hover:text-white text-slate-400 transition-all">
                                            <Instagram size={18} />
                                        </a>
                                        <a href="https://www.instagram.com/aidsevents_club?igsh=MWVtYmgxNTRvY2tmMg==" target="_blank" rel="noreferrer"
                                            className="w-10 h-10 flex items-center justify-center border border-[#39ff88]/20 bg-white/5 rounded-lg hover:bg-[#18c96a]/20 hover:border-[#18c96a] hover:text-white text-slate-400 transition-all">
                                            <Instagram size={18} />
                                        </a>
                                        <a href="https://www.veltechmultitech.org/" target="_blank" rel="noreferrer"
                                            className="w-10 h-10 flex items-center justify-center border border-[#39ff88]/20 bg-white/5 rounded-lg hover:bg-green-500/20 hover:border-green-500 hover:text-white text-slate-400 transition-all">
                                            <Globe size={18} />
                                        </a>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[#39ff88] opacity-90">
                                        <Mail size={14} />
                                        <span className="tracking-widest uppercase text-[10px] font-audiowide">Contact Protocol</span>
                                    </div>
                                    <a href="mailto:nexathon.vtmt@gmail.com"
                                        className="block pl-5 text-slate-300 hover:text-[#39ff88] transition-colors text-[11px] break-all">
                                        aidex26.vtmt@gmail.com
                                    </a>
                                </div>

                                {/* System Time */}
                                <div className="text-[10px] text-slate-500 text-center pt-4 border-t border-white/5">
                                    SERVER_TIME: <span className="text-[#39ff88] font-audiowide">{time}</span>
                                </div>

                                {/* Copyright */}
                                <div className="text-[9px] text-slate-500 text-center uppercase tracking-widest pt-2">
                                    <p>© 2026 AIDEX'26 // DOOMSDAY PROTOCOL</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MobileNav;
