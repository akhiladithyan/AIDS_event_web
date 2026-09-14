"use client";

import React, { useState, useEffect } from "react";
import config from "@/config";

interface AnnouncementBannerProps {
  announcement?: string;
  announcementActive?: boolean;
}

const SESSION_KEY = "aidex_announcement_dismissed";

export default function AnnouncementBanner({ announcement, announcementActive }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(true); // start true to avoid flash
  const [resolvedText, setResolvedText] = useState(announcement || "");
  const [resolvedActive, setResolvedActive] = useState(announcementActive ?? false);

  useEffect(() => {
    // If props not given, fetch from API
    if (announcement === undefined) {
      fetch(`${config.API_URL}/content`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data) {
            setResolvedText(d.data.announcement || "");
            setResolvedActive(!!d.data.announcementActive);
          }
        })
        .catch(() => {});
    } else {
      setResolvedText(announcement);
      setResolvedActive(announcementActive ?? false);
    }
  }, [announcement, announcementActive]);

  useEffect(() => {
    // Check sessionStorage for dismissal
    const wasDismissed = sessionStorage.getItem(SESSION_KEY);
    if (!wasDismissed) setDismissed(false);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
  };

  if (!resolvedActive || !resolvedText || dismissed) return null;

  return (
    <div
      id="announcement-banner"
      className="fixed top-0 left-0 right-0 z-[200] flex items-center gap-0 overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #0a1e0a 0%, #0f2e0f 50%, #0a1e0a 100%)",
        borderBottom: "1px solid rgba(57,255,136,0.25)",
        boxShadow: "0 2px 20px rgba(57,255,136,0.08)",
        height: "36px",
      }}
    >
      {/* Left badge */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 h-full font-mono text-xs font-bold uppercase tracking-widest border-r"
        style={{ backgroundColor: "#39ff8818", borderColor: "rgba(57,255,136,0.2)", color: "#39ff88" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-pulse" />
        NOTICE
      </div>

      {/* Scrolling text */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div
          className="whitespace-nowrap animate-marquee font-mono text-xs text-[#39ff88]/80 inline-block"
          style={{ animationDuration: `${Math.max(8, resolvedText.length * 0.12)}s` }}
        >
          {resolvedText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{resolvedText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{resolvedText}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="shrink-0 px-3 h-full flex items-center text-gray-500 hover:text-[#39ff88] transition-colors border-l font-mono text-xs"
        style={{ borderColor: "rgba(57,255,136,0.15)" }}
      >
        ✕
      </button>

      {/* Marquee animation injected inline so it works without a tailwind config change */}
      <style>{`
        @keyframes aidex-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: aidex-marquee linear infinite;
        }
      `}</style>
    </div>
  );
}
