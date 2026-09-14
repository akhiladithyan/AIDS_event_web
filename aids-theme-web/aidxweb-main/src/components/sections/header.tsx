"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MagneticButton from "../ui/MagneticButton";
import RollingPillButton from "../ui/RollingPillButton";

interface HeaderProps {
  isOpaque?: boolean;
  onRegister?: () => void;
}

const Header = ({ isOpaque = false, onRegister }: HeaderProps) => {

  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleRegister = () => {
    if (onRegister) {
      onRegister();
    } else {
      router.push("/events");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getHref = (hash: string) => {
    return pathname === '/' ? hash : `/${hash}`;
  };

  const navLinks = [
    { name: "Home", href: "/", weight: "font-bold" },
    { name: "About", href: getHref("#about"), weight: "font-medium" },
    { name: "Events", href: "/events", weight: "font-bold", extraClasses: "text-[#39ff88]" },
    { name: "Student Pass", href: "/student", weight: "font-bold", extraClasses: "text-[#39ff88]" },
  ];

  const navLinksRight = [
    { name: "Schedule", href: "/schedule", weight: "font-medium", extraClasses: "" },
    { name: "Results", href: "/results", weight: "font-medium", extraClasses: "" },
    { name: "Lookup", href: "/lookup", weight: "font-medium", extraClasses: "text-[#39ff88]/70" },
    { name: "Contact", href: getHref("#contact"), weight: "font-medium", extraClasses: "" },
  ];

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 font-display uppercase tracking-widest ${scrolled ? "sm:block" : "hidden sm:block"} ${scrolled || isOpaque ? "bg-[#050806]/85 backdrop-blur-md border-b border-[#39ff88]/15 shadow-[0_4px_30px_rgba(0,0,0,0.8)]" : "bg-gradient-to-b from-[#050806] via-[#050806]/60 to-transparent"
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">

        {/* Desktop Navigation */}
        <nav className="hidden w-full items-center justify-center md:flex lg:flex">
          <div className="flex flex-1 justify-end items-center gap-1.5 lg:gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-2 py-2 text-[13px] lg:text-[15px] whitespace-nowrap transition duration-300 ease-in-out hover:text-[#39ff88] hover:drop-shadow-[0_0_8px_#39ff88] lg:px-2.5 text-white/80 ${link.weight} ${link.extraClasses || ""} font-mono`}
              >
                <span className="hover:before:content-['>'] hover:before:mr-1 hover:before:text-[#39ff88] transition-all">
                  {link.name}
                </span>
              </Link>
            ))}
          </div>

          <Link className="flex-shrink-0 mx-4 lg:mx-8 group" href="/">
            <div className="relative flex items-center gap-2">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-[#39ff88]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-8 h-8 border border-[#39ff88]/40 bg-[#39ff88]/10 flex items-center justify-center rounded group-hover:bg-[#39ff88]/25 transition-all shadow-[0_0_10px_rgba(57,255,136,0.2)]">
                <span className="text-[#39ff88] font-mono font-bold text-xs">A</span>
              </div>
              <div className="relative group inline-block">
                <span className="relative z-10 text-2xl lg:text-3xl font-black font-audiowide text-white tracking-tighter group-hover:text-shadow-glow transition-all">
                  AIDEX'26
                </span>
                <span className="absolute top-0 left-0 text-2xl lg:text-3xl font-black font-audiowide text-[#ff3030] tracking-tighter opacity-0 group-hover:opacity-70 animate-glitch-1 mix-blend-screen pointer-events-none">
                  AIDEX'26
                </span>
                <span className="absolute top-0 left-0 text-2xl lg:text-3xl font-black font-audiowide text-[#39ff88] tracking-tighter opacity-0 group-hover:opacity-70 animate-glitch-2 mix-blend-screen pointer-events-none">
                  AIDEX'26
                </span>
              </div>
            </div>
          </Link>

          <div className="flex flex-1 justify-start items-center gap-1.5 lg:gap-5">
            {navLinksRight.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-2 py-2 text-[13px] lg:text-[15px] whitespace-nowrap transition duration-300 ease-in-out hover:text-[#39ff88] hover:drop-shadow-[0_0_8px_#39ff88] lg:px-2.5 text-white/80 ${link.weight} font-mono`}
              >
                <span className="hover:before:content-['>'] hover:before:mr-1 hover:before:text-[#39ff88] transition-all">
                  {link.name}
                </span>
              </Link>
            ))}

            <MagneticButton strength={0.2}>
              <RollingPillButton
                label="Initialize_Reg"
                onClick={handleRegister}
                circleColor="bg-[#39ff88]"
                hoverTextColor="text-[#050806]"
                className="ml-6 px-5 py-2.5 bg-[#39ff88]/10 border border-[#39ff88]/50 text-[#39ff88] rounded-full font-bold font-mono text-xs uppercase tracking-widest hover:shadow-[0_0_20px_#39ff88] transition-all duration-300 flex items-center gap-2"
                icon={<span className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-pulse"></span>}
              />
            </MagneticButton>
          </div>
        </nav>

      </div>

    </header>
  );
};

export default Header;