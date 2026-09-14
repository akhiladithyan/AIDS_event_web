"use client";

import { ArrowRight, Terminal, ShieldAlert } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";

export interface CardFlipProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  actionLabel?: string;
  onAction?: () => void;
  videoSrc?: string;
  imageSrc?: string;
}

export default function CardFlip({
  title = "Design Systems",
  subtitle = "Explore the fundamentals",
  description = "Dive deep into the world of modern UI/UX design.",
  features = ["UI/UX", "Modern Design", "Tailwind CSS", "Kokonut UI"],
  actionLabel = "Start today",
  onAction,
  videoSrc,
  imageSrc,
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "100px" });

  return (
    <div
      ref={containerRef}
      className="group relative h-[400px] w-full [perspective:2000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(true)}
    >
      <div
        className={cn(
          "relative h-full w-full",
          "[transform-style:preserve-3d]",
          "transition-all duration-700",
          isFlipped
            ? "[transform:rotateY(180deg)]"
            : "[transform:rotateY(0deg)]"
        )}
      >
        {/* Front of Card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]",
            "overflow-hidden rounded-xl",
            "bg-[#0b1510]/90",
            "border border-[#39ff88]/25",
            "shadow-xl",
            "transition-all duration-700",
            "group-hover:border-[#39ff88]/80 group-hover:shadow-[0_0_25px_rgba(57,255,136,0.25)]",
            isFlipped ? "opacity-0" : "opacity-100"
          )}
        >
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#39ff88]/40 group-hover:border-[#39ff88] transition-colors z-20"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#39ff88]/40 group-hover:border-[#39ff88] transition-colors z-20"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#39ff88]/40 group-hover:border-[#39ff88] transition-colors z-20"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#39ff88]/40 group-hover:border-[#39ff88] transition-colors z-20"></div>

          <div className="relative h-full w-full overflow-hidden bg-[#050806]">
            {/* Image/Video Content */}
            <div className="relative h-full overflow-hidden">
              {/* Scanline Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay"></div>
              <div className="absolute inset-0 z-10 bg-[linear-gradient(transparent_0%,rgba(0,0,0,0.4)_50%,transparent_100%)] bg-[length:100%_4px] opacity-15 pointer-events-none"></div>

              {videoSrc && isInView ? (
                <>
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover filter brightness-90 contrast-110 group-hover:brightness-100 transition-all duration-500"
                  >
                    <source src={videoSrc} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-[#050806]/60 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-start justify-center">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-85 contrast-115 group-hover:brightness-100 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="relative flex h-full w-full items-center justify-center bg-[#08100b]">
                      <Terminal className="text-[#39ff88]/30 w-16 h-16" />
                    </div>
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-[#050806]/85 to-transparent" />
            </div>

            <div className="absolute right-0 bottom-0 left-0 p-5 z-20">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#39ff88] tracking-widest uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-pulse"></span>
                    ACTIVE_PROTOCOL
                  </span>
                  <span className="text-[9px] font-mono text-[#bfc8c3]/60 px-1.5 py-0.5 rounded bg-black/50 border border-white/10">
                    HOVER // FLIP
                  </span>
                </div>
                <h3 className={cn(
                  "font-bold text-xl lg:text-2xl leading-snug tracking-tight text-white font-orbitron",
                  "drop-shadow-[0_0_15px_rgba(57,255,136,0.3)]"
                )}>
                  {title}
                </h3>
                <p className={cn(
                  "line-clamp-2 text-xs text-[#bfc8c3]/70 font-mono"
                )}>
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "rounded-xl",
            "bg-[#08100b]",
            "border border-[#39ff88]/40",
            "shadow-xl",
            "flex flex-col",
            "transition-all duration-700",
            "group-hover:border-[#39ff88] group-hover:shadow-[0_0_25px_rgba(57,255,136,0.2)]",
            isFlipped ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#39ff88] via-[#18c96a] to-transparent"></div>

          <div className="relative h-full w-full rounded-xl p-6 flex flex-col">
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#39ff88] tracking-widest uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3 text-[#39ff88]" />
                  MISSION_SPECIFICATIONS
                </div>
                <h3 className="font-bold text-lg lg:text-xl leading-snug tracking-tight text-white font-orbitron">
                  {title}
                </h3>
                <p className="line-clamp-2 text-xs text-[#bfc8c3]/80 font-mono border-l-2 border-[#39ff88]/40 pl-3">
                  {description}
                </p>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[110px] pr-1 scrollbar-thin scrollbar-thumb-[#39ff88]/30" >
                {features.map((feature, index) => (
                  <div
                    className="flex items-start gap-1.5 text-xs text-[#bfc8c3]/90 font-mono"
                    key={feature}
                    style={{
                      transform: isFlipped
                        ? "translateX(0)"
                        : "translateX(-10px)",
                      opacity: isFlipped ? 1 : 0,
                      transitionDelay: `${index * 80 + 150}ms`,
                    }}
                  >
                    <span className="text-[#39ff88] font-bold">&gt;</span>
                    <span className="line-clamp-1">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[#39ff88]/15">
              <MagneticButton strength={0.2}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction?.();
                    setIsFlipped(false);
                  }}
                  className={cn(
                    "group/start relative",
                    "flex items-center justify-between",
                    "rounded-lg p-3",
                    "bg-[#39ff88] border border-[#39ff88]",
                    "hover:bg-[#39ff88]/90 hover:shadow-[0_0_20px_rgba(57,255,136,0.5)]",
                    "transition-all duration-300",
                    "cursor-pointer"
                  )}
                >
                  <span
                    className="relative z-10 font-bold text-xs text-black font-orbitron uppercase tracking-wider"
                  >
                    {actionLabel}
                  </span>
                  <div className="group/icon relative z-10">
                    <ArrowRight className="h-4 w-4 text-black group-hover/start:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
