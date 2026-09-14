"use client";

import { FaStar, FaMusic, FaFilm, FaCamera, FaMicrophone, FaMicrophoneAlt, FaArrowRight, FaDownload, FaPhone, FaTimes, FaCheckCircle, FaCopy, FaIdCard, FaQrcode, FaExternalLinkAlt, FaCheck } from "react-icons/fa";
import { toast } from "sonner";
import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/sections/header";
import MobileNav from "@/components/sections/MobileNav";
import Footer from "@/components/sections/footer";
import NarrowEventCard from "@/components/ui/NarrowEventCard";
import { RegistrationForm } from "@/components/admin/RegistrationForm";
import { TicketPortal } from "@/components/admin/TicketPortal";
import config from "@/config";
import { safeJsonResponse } from "@/lib/utils";
import { Content, Event as AdminEvent } from "@/types/admin";
import MagneticButton from "@/components/ui/MagneticButton";

interface Event {
  id: string; // Changed to string to match backend
  title: string;
  category: string;
  img: string;
  desc: string;
  rules: string[];
  contact: string;
  videoSrc?: string;
  importantNote?: string; // New field
}

interface RegisteredPassData {
  teamId: string;
  userId: string;
  password: string;
  qrToken: string;
  name: string;
  role: string;
  teamName: string;
  event: { id: string; title: string };
  college?: string;
  department?: string;
  allMembers?: any[];
}

// Map backend 'Event' to frontend 'Event'
const mapBackendEventToFrontend = (beEvent: any): Event => {
  return {
    id: beEvent.id || beEvent._id,
    title: beEvent.title,
    category: beEvent.category,
    img: (beEvent.image?.type === 'image' ? beEvent.image.url : null) || "/images/events/default.jpg", // Fallback image
    desc: beEvent.description,
    rules: beEvent.rules || [],
    contact: beEvent.coordinatorPhone || "Events Team", // Use coordinator phone if available
    videoSrc: beEvent.image?.type === 'video' ? beEvent.image.url : undefined,
    importantNote: beEvent.importantNote // Map important note
  };
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [backendEvents, setBackendEvents] = useState<AdminEvent[]>([]); // Store full backend events
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Important Note State
  const [pendingEvent, setPendingEvent] = useState<Event | null>(null);
  const [showImportantNote, setShowImportantNote] = useState(false);

  const [showRegistration, setShowRegistration] = useState(false);
  const [showTicketPortal, setShowTicketPortal] = useState(false);
  const [content, setContent] = useState<Content | null>(null);
  // --- NEW: Slot counters (eventId -> registeredCount) ---
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});

  // Instant Digital QR Pass on Successful Registration
  const [registeredPass, setRegisteredPass] = useState<RegisteredPassData | null>(null);
  const [selectedPassIdx, setSelectedPassIdx] = useState<number>(0);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const router = useRouter();

  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });

  // Glitch Text State
  const [titleText, setTitleText] = useState("LOADING_MODULE...");
  const fullTitle = "EVENTS_DATABASE";

  useEffect(() => {
    // Title Animation
    let i = 0;
    const interval = setInterval(() => {
      setTitleText(fullTitle.substring(0, i) + (i % 2 === 0 ? "_" : ""));
      i++;
      if (i > fullTitle.length) clearInterval(interval);
    }, 100);

    // Fetch Events
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${config.API_URL}/events`);
        const data = await safeJsonResponse(res);
        if (data && data.success) {
          setBackendEvents(data.data);
          const frontendEvents = data.data.map(mapBackendEventToFrontend);
          setEvents(frontendEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Periodic slot count refresh
    const fetchSlots = async () => {
      try {
        const [soloRes, teamRes] = await Promise.all([
          fetch(`${config.API_URL}/admin/registrations/solo`),
          fetch(`${config.API_URL}/admin/registrations/team`),
        ]);
        const [soloData, teamData] = await Promise.all([safeJsonResponse(soloRes), safeJsonResponse(teamRes)]);
        const counts: Record<string, number> = {};
        const allRegs = [
          ...(soloData?.data || []),
          ...(teamData?.data || []),
        ];
        allRegs.forEach((r: any) => {
          const eid = r.event?.id || r.eventId || '';
          if (eid) counts[eid] = (counts[eid] || 0) + 1;
        });
        setSlotCounts(counts);
      } catch (e) { /* silent fail */ }
    };
    fetchSlots();
    const slotInterval = setInterval(fetchSlots, 30000);

    return () => { clearInterval(interval); clearInterval(slotInterval); };
  }, []);

  const handleEventClick = (event: Event) => {
    if (event.importantNote) {
      setPendingEvent(event);
      setShowImportantNote(true);
    } else {
      setSelectedEvent(event);
    }
  };

  const handleAcknowledgeNote = () => {
    if (pendingEvent) {
      setSelectedEvent(pendingEvent);
      setPendingEvent(null);
      setShowImportantNote(false);
    }
  };

  const handleRegisterForEvent = () => {
    setShowRegistration(true);
  };

  const handleGeneralRegister = () => {
    setShowTicketPortal(true);
  };

  const handleRegistrationSubmit = async (formData: any) => {
    const toastId = toast.loading("Processing registration & synthesizing individual passes...");

    const endpoint = formData.participationType === 'Team'
      ? `${config.API_URL}/register/team`
      : `${config.API_URL}/register/solo`;

    try {
      let payload;

      if (formData.participationType === 'Team') {
        const { eventId, eventName, teamName, teamMembers, teamLeaderIdCardUrl, paymentScreenshotUrl, paymentStatus } = formData;
        const leaderMember = teamMembers[0] || {};
        const leaderEmail = (formData.email || leaderMember.email || '').toLowerCase().trim();
        const leaderPassword = formData.password || leaderMember.password || '123456';

        const teamLeader = {
          name: leaderMember.name || "Squad Leader",
          phone: leaderMember.phone || "",
          email: leaderEmail,
          password: leaderPassword,
          college: formData.college,
          department: formData.department,
          year: formData.year,
          idCardUrl: formData.teamLeaderIdCardUrl
        };

        const members = teamMembers.length > 1
          ? teamMembers.slice(1).map((m: any, idx: number) => ({
            name: m.name || `Operative ${idx + 2}`,
            phone: m.phone || "",
            email: (m.email || `member${idx + 2}.${leaderEmail}`).toLowerCase().trim(),
            password: m.password || leaderPassword,
            college: formData.college,
            department: formData.department,
            year: formData.year,
            idCardUrl: ""
          }))
          : [];

        payload = {
          teamName: formData.teamName,
          teamLeader: teamLeader,
          members: members,
          event: {
            id: eventId,
            title: eventName,
            image: ''
          },
          paymentStatus: paymentStatus || 'Pending',
          paymentScreenshot: paymentScreenshotUrl,
          transactionId: "TXN_" + Date.now()
        };
      } else {
        const soloEmail = (formData.email || '').toLowerCase().trim();
        payload = {
          name: formData.name,
          email: soloEmail,
          password: formData.password,
          phone: formData.phone,
          college: formData.college,
          department: formData.department,
          year: formData.year,
          event: {
            id: formData.eventId,
            title: formData.eventName,
            image: ''
          },
          paymentScreenshot: formData.paymentScreenshotUrl,
          transactionId: "TXN_" + Date.now()
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await safeJsonResponse(res);
      if (data && data.success) {
        toast.dismiss(toastId);
        toast.success("Registration Confirmed! Individual pass badges synthesized.");
        setShowRegistration(false);

        const passData: RegisteredPassData = data.data;
        if (passData && passData.qrToken) {
          try {
            const qrUrl = await QRCode.toDataURL(passData.qrToken, {
              width: 320,
              margin: 1,
              color: { dark: "#000000", light: "#ffffff" }
            });
            setQrDataUrl(qrUrl);
          } catch (e) {}
          setRegisteredPass(passData);
        }
      } else {
        toast.dismiss(toastId);
        toast.error(data?.error || data?.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.dismiss(toastId);
      toast.error("Error submitting registration.");
    }
  };

  // Update QR whenever selected pass or active member changes
  useEffect(() => {
    if (registeredPass) {
      const activeMember = registeredPass.allMembers?.[selectedPassIdx] || registeredPass;
      const tokenToRender = activeMember.qrToken || registeredPass.qrToken;
      if (tokenToRender) {
        QRCode.toDataURL(tokenToRender, {
          width: 320,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" }
        }).then(url => setQrDataUrl(url)).catch(() => {});
      }
    }
  }, [registeredPass, selectedPassIdx]);

  // HD Canvas Pass Card Downloader (600x740px)
  const downloadRegisteredPass = async () => {
    if (!registeredPass) return;
    const activeMember = registeredPass.allMembers?.[selectedPassIdx] || registeredPass;

    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 740;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 740);
    bgGrad.addColorStop(0, "#130a2a");
    bgGrad.addColorStop(0.6, "#08100b");
    bgGrad.addColorStop(1, "#090514");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 740);

    // Accent Top Banner
    const bannerGrad = ctx.createLinearGradient(0, 0, 600, 0);
    bannerGrad.addColorStop(0, "#ef4a40");
    bannerGrad.addColorStop(0.5, "#6654b5");
    bannerGrad.addColorStop(1, "#39ff88");
    ctx.fillStyle = bannerGrad;
    ctx.fillRect(0, 0, 600, 14);

    // Outer Glass Border
    ctx.strokeStyle = "rgba(57, 255, 136, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 26, 568, 696);

    // Title Header
    ctx.textAlign = "center";
    ctx.fillStyle = "#a395f3";
    ctx.font = "bold 16px monospace";
    ctx.fillText("NEURA 2026 // SYMPOSIUM ACCESS PASS", 300, 60);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText((registeredPass.event?.title || "NATIONAL TECHNICAL SYMPOSIUM").toUpperCase(), 300, 92);

    // Pass Badge Pill
    ctx.fillStyle = "rgba(239, 74, 64, 0.2)";
    ctx.strokeStyle = "#ef4a40";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(190, 110, 220, 30, 15);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ef4a40";
    ctx.font = "bold 12px monospace";
    ctx.fillText("OFFICIAL EVENT PASS", 300, 130);

    // White QR Container Frame
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(170, 155, 260, 260, 16);
    ctx.fill();

    // Render QR Code inside frame
    try {
      const activeQrToken = activeMember.qrToken || registeredPass.qrToken;
      const qrUrl = await QRCode.toDataURL(activeQrToken, {
        width: 240,
        margin: 0,
        color: { dark: "#000000", light: "#ffffff" }
      });
      const img = new Image();
      img.src = qrUrl;
      await new Promise((res) => { img.onload = res; });
      ctx.drawImage(img, 180, 165, 240, 240);
    } catch (e) {
      ctx.fillStyle = "#000000";
      ctx.font = "14px monospace";
      ctx.fillText("QR RENDER ERROR", 300, 285);
    }

    // Participant Details
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText((activeMember.name || registeredPass.name).toUpperCase(), 300, 455);

    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 16px monospace";
    ctx.fillText(`${activeMember.userId || registeredPass.userId} • [${activeMember.role || "Member"}]`, 300, 485);

    ctx.fillStyle = "#a395f3";
    ctx.font = "bold 15px monospace";
    ctx.fillText(`Team: ${registeredPass.teamName} (${registeredPass.teamId})`, 300, 515);

    ctx.fillStyle = "#8e82cf";
    ctx.font = "13px sans-serif";
    ctx.fillText(`${registeredPass.college || "College"} — ${registeredPass.department || "General"}`, 300, 542);

    // Barcode Graphic Simulation on HD Card
    const barcodeY = 565;
    ctx.fillStyle = "#39ff88";
    const barToken = activeMember.userId || registeredPass.userId;
    for (let bx = 120; bx < 480; bx += 6) {
      const barW = (bx % 12 === 0 || bx % 18 === 0) ? 3 : 1.5;
      ctx.fillRect(bx, barcodeY, barW, 28);
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "10px monospace";
    ctx.fillText(`* ${barToken} *`, 300, 605);

    // Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 620);
    ctx.lineTo(540, 620);
    ctx.stroke();

    // Instructions
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "11px monospace";
    ctx.fillText("Present this individual digital pass at entrance & meal check-in desks.", 300, 645);
    ctx.fillText("Valid for Symposium Entry, Attendance & Authorized Meal Passes.", 300, 665);

    // Token Hash
    ctx.fillStyle = "rgba(57, 255, 136, 0.8)";
    ctx.font = "10px monospace";
    ctx.fillText(`TOKEN: ${activeMember.qrToken || registeredPass.qrToken}`, 300, 695);

    // Download trigger
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `PASS_${(activeMember.userId || registeredPass.userId).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.click();
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const navigateToStudentPortal = () => {
    if (registeredPass) {
      const activeMember = registeredPass.allMembers?.[selectedPassIdx] || registeredPass;
      const studentSession = {
        user: {
          userId: activeMember.userId || registeredPass.userId,
          name: activeMember.name || registeredPass.name,
          college: registeredPass.college,
          department: registeredPass.department,
          role: activeMember.role || registeredPass.role,
          qrToken: activeMember.qrToken || registeredPass.qrToken
        },
        team: {
          teamId: registeredPass.teamId,
          teamName: registeredPass.teamName,
          college: registeredPass.college || "",
          department: registeredPass.department || "",
          allMembers: registeredPass.allMembers || [{ userId: registeredPass.userId, name: registeredPass.name, role: registeredPass.role }]
        },
        event: registeredPass.event,
        attendance: {
          present: false,
          lunch: false,
          snacks: false
        },
        qrToken: activeMember.qrToken || registeredPass.qrToken
      };
      sessionStorage.setItem("neura_student_session", JSON.stringify(studentSession));
      router.push("/student");
    }
  };

  // Helper to convert local event to AdminEvent type for the form
  const getAdminEvent = (evt: Event): AdminEvent => {
    const backendEvent = backendEvents.find(be => be.id === evt.id);

    if (backendEvent) {
      return backendEvent;
    }

    return {
      id: evt.id,
      title: evt.title,
      category: evt.category,
      date: '',
      time: '',
      description: evt.desc,
      image: { url: evt.img, type: 'image' },
      participationType: 'Solo',
      ticketTiers: [],
      rules: evt.rules,
      maxSlots: 100,
      registeredCount: 0,
      isPassEvent: true
    };
  };

  useEffect(() => {
    if (selectedEvent || showRegistration || showTicketPortal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEvent, showRegistration, showTicketPortal]);

  return (
    <main className="relative min-h-screen bg-[#050806] text-foreground overflow-x-hidden">
      {/* Global Grid Background for this page */}
      <div className="fixed inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(57, 255, 136, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(57, 255, 136, 0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
      {/* Scanline Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

      <MobileNav />
      <Header />

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="pt-36 pb-12 px-4 md:px-8 relative z-10">
        <div ref={heroRef} className="mx-auto max-w-7xl text-center">
          <div className="inline-block border border-[#39ff88]/30 bg-[#39ff88]/10 px-4 py-1 rounded-full mb-6 backdrop-blur-sm">
            <span className="text-[#39ff88] text-xs md:text-sm font-mono tracking-widest uppercase">
              :: DOOMSDAY_PROTOCOL // CHALLENGE_MATRIX ::
            </span>
          </div>
          <div className="relative group inline-block">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-wider leading-none text-center select-none text-white uppercase font-orbitron drop-shadow-[0_0_30px_rgba(57,255,136,0.4)] relative z-10 break-all md:break-normal"
            >
              CHALLENGE_MODULES<span className="animate-blink text-[#39ff88]">_</span>
            </motion.h1>
          </div>

          <p className="mt-6 text-sm md:text-lg text-[#bfc8c3]/70 font-mono font-light tracking-widest max-w-3xl mx-auto uppercase">
            [ AIDEX&apos;26 // HIGH-STAKES TECHNICAL SECTORS // HACKATHONS // WORKSHOPS ]
          </p>
        </div>
      </section>

      {/* ---------------- EVENT CARDS ---------------- */}
      <section
        className="px-4 md:px-8 pb-16 relative z-10 font-rajdhani"
      >
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#39ff88] mb-4"></div>
              <div className="text-[#39ff88] font-mono text-sm animate-pulse">DECRYPTING_CHALLENGE_MODULES...</div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center text-[#bfc8c3]/50 py-20 font-mono border border-[#39ff88]/20 bg-[#0b1510] rounded-xl p-8">
              [!] NO_ACTIVE_MODULES_DETECTED. RECALIBRATING_FREQUENCY.
            </div>
          ) : (
            <div className="space-y-14 md:space-y-20">
              {/* Technical Events */}
              {events.filter(e => e.category?.toLowerCase().includes("technical") && !e.category?.toLowerCase().includes("non")).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#39ff88]/50 to-transparent flex-1" />
                    <h2 className="text-xl md:text-3xl font-black text-white font-orbitron uppercase tracking-widest text-center whitespace-nowrap flex items-center gap-2">
                      <span className="text-[#39ff88]">Technical</span> Warfare
                    </h2>
                    <div className="h-px bg-gradient-to-r from-transparent via-[#39ff88]/50 to-transparent flex-1" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
                    {events
                      .filter(e => e.category?.toLowerCase().includes("technical") && !e.category?.toLowerCase().includes("non"))
                      .map((event) => {
                        const beEvent = backendEvents.find(b => (b.id || (b as any)._id) === event.id);
                        const regCount = slotCounts[event.id] ?? (beEvent?.registeredCount ?? 0);
                        const maxSlots = beEvent?.maxSlots ?? 20;
                        return (
                          <NarrowEventCard
                            key={event.id}
                            title={event.title}
                            category={event.category}
                            description={event.desc}
                            imageSrc={event.img}
                            videoSrc={event.videoSrc}
                            regCount={regCount}
                            maxSlots={maxSlots}
                            entryFee={beEvent?.entryFee || 0}
                            participationType={beEvent?.participationType || "Individual"}
                            time={beEvent?.time || "09:30 AM - 03:00 PM"}
                            venue="Computer Center A"
                            onOpenDetails={() => handleEventClick(event)}
                            onOpenRegister={() => {
                              if (event.importantNote) {
                                setPendingEvent(event);
                                setShowImportantNote(true);
                              } else {
                                setSelectedEvent(event);
                                setShowRegistration(true);
                              }
                            }}
                          />
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Non-Technical Events */}
              {events.filter(e => e.category?.toLowerCase().includes("non-technical") || e.category?.toLowerCase() === "non technical").length > 0 && (
                <div>
                  <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#18c96a]/50 to-transparent flex-1" />
                    <h2 className="text-xl md:text-3xl font-black text-white font-orbitron uppercase tracking-widest text-center whitespace-nowrap flex items-center gap-2">
                      <span className="text-[#18c96a]">Auxiliary</span> Protocols
                    </h2>
                    <div className="h-px bg-gradient-to-r from-transparent via-[#18c96a]/50 to-transparent flex-1" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
                    {events
                      .filter(e => e.category?.toLowerCase().includes("non-technical") || e.category?.toLowerCase() === "non technical")
                      .map((event) => {
                        const beEvent = backendEvents.find(b => (b.id || (b as any)._id) === event.id);
                        const regCount = slotCounts[event.id] ?? (beEvent?.registeredCount ?? 0);
                        const maxSlots = beEvent?.maxSlots ?? 20;
                        return (
                          <NarrowEventCard
                            key={event.id}
                            title={event.title}
                            category={event.category}
                            description={event.desc}
                            imageSrc={event.img}
                            videoSrc={event.videoSrc}
                            regCount={regCount}
                            maxSlots={maxSlots}
                            entryFee={beEvent?.entryFee || 0}
                            participationType={beEvent?.participationType || "Individual"}
                            time={beEvent?.time || "09:30 AM - 03:00 PM"}
                            venue="Main Campus"
                            onOpenDetails={() => handleEventClick(event)}
                            onOpenRegister={() => {
                              if (event.importantNote) {
                                setPendingEvent(event);
                                setShowImportantNote(true);
                              } else {
                                setSelectedEvent(event);
                                setShowRegistration(true);
                              }
                            }}
                          />
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- IMPORTANT NOTE MODAL ---------------- */}
      <AnimatePresence>
        {
          showImportantNote && pendingEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4"
            >
              <div className="fixed inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `linear-gradient(rgba(234, 179, 8, 0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(234, 179, 8, 0.1) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              ></div>

              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#0a0a00] border border-yellow-500/50 rounded-lg w-[95%] max-w-md p-6 relative shadow-[0_0_50px_rgba(234,179,8,0.2)]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                    <FaTimes className="text-yellow-500 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-yellow-500 text-xs font-mono uppercase tracking-widest mb-1">:: CRITICAL_ADVISORY ::</div>
                    <h3 className="text-xl font-bold text-white font-audiowide uppercase">Important Notice</h3>
                  </div>
                </div>

                <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-4 mb-6">
                  <p className="text-yellow-100 font-mono text-sm leading-relaxed">
                    {pendingEvent.importantNote}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowImportantNote(false)}
                    className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-slate-400 font-mono text-xs uppercase tracking-wider rounded-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAcknowledgeNote}
                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold font-audiowide text-sm uppercase tracking-widest rounded-sm transition-colors shadow-lg shadow-yellow-500/20"
                  >
                    Acknowledge
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >

      {/* ---------------- DOWNLOAD BROCHURE BUTTON ---------------- */}
      <div className="text-center pb-20 pt-6 relative z-10">
        <div className="relative inline-block group">
          <a
            href="/image.png"
            download="AIDEX26_Protocol_Intel.png"
            target="_blank"
            rel="noopener noreferrer"
            className="relative px-8 py-4 md:px-12 md:py-5 rounded-xl block overflow-hidden transform hover:scale-[1.02] transition-transform duration-300"
          >
            {/* Border */}
            <div className="absolute inset-0 border border-[#39ff88]/50 bg-[#08100b] group-hover:border-[#39ff88] group-hover:shadow-[0_0_30px_rgba(57,255,136,0.3)] transition-all"></div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#39ff88]"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#39ff88]"></div>

            {/* Content Wrapper */}
            <div className="relative flex items-center justify-center gap-3 md:gap-4 z-10">
              <div className="p-2 bg-[#39ff88]/20 rounded-lg border border-[#39ff88]/40">
                <FaDownload className="w-4 h-4 md:w-5 md:h-5 text-[#39ff88] group-hover:text-white transition-colors duration-300" />
              </div>

              <span
                className="font-bold text-sm md:text-lg tracking-widest text-white group-hover:text-[#39ff88] transition-all font-orbitron uppercase"
              >
                DOWNLOAD_MISSION_INTEL
              </span>

              <FaArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[#39ff88] group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </a>
        </div>
      </div>

      {/* ---------------- MODAL POPUP ---------------- */}
      <AnimatePresence>
        {
          selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              {/* Modal Background Grid */}
              <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `linear-gradient(rgba(57, 255, 136, 0.15) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(57, 255, 136, 0.15) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              ></div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.5 }}
                className="bg-[#0b1510] rounded-xl w-[95%] max-w-lg relative border border-[#39ff88]/40 shadow-[0_0_50px_rgba(57,255,136,0.25)] flex flex-col font-mono overflow-hidden"
              >
                {/* Tech Header */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#39ff88] via-[#18c96a] to-transparent"></div>
                <div className="absolute top-2 right-12 bg-[#39ff88]/10 border border-[#39ff88]/30 px-2 py-0.5 rounded text-[10px] text-[#39ff88] font-mono">
                  SYS.ID: {selectedEvent.id.substring(0, 6)}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-colors border border-white/10"
                >
                  <FaTimes />
                </button>

                {/* Header Content */}
                <div className="pt-8 px-6 sm:px-8 pb-4 text-left border-b border-[#39ff88]/15">
                  <h2
                    className="text-2xl lg:text-3xl font-black text-white mb-2 leading-snug font-orbitron uppercase tracking-wide"
                  >
                    {selectedEvent.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#39ff88] rounded-full animate-pulse"></span>
                    <p className="text-[#39ff88] text-xs font-mono tracking-widest uppercase">
                    // MISSION_BRIEFING_DECRYPTED
                    </p>
                  </div>
                </div>

                {/* Scrollable Rules */}
                <div className="px-6 sm:px-8 py-6 overflow-y-auto max-h-[50vh] scrollbar-thin scrollbar-thumb-[#39ff88]/30">
                  <ul className="space-y-3.5 text-[#bfc8c3]/90 text-xs md:text-sm font-mono">
                    {selectedEvent.rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#39ff88] mt-0.5 shrink-0 font-bold">{">"}</span>
                        <span className="leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center gap-3 text-[#bfc8c3]/70 text-xs p-3.5 bg-[#08100b] rounded-lg border border-[#39ff88]/20 font-mono">
                    <FaPhone className="h-3.5 w-3.5 text-[#39ff88]" />
                    <span className="uppercase tracking-wider">COMMS_LINK: <span className="text-white font-bold">{selectedEvent.contact}</span></span>
                  </div>
                </div>

                {/* Footer / Action */}
                <div className="p-5 sm:px-8 border-t border-[#39ff88]/15 bg-[#08100b]">
                  <MagneticButton strength={0.2}>
                    <button
                      onClick={handleRegisterForEvent}
                      className="w-full group relative flex items-center justify-between rounded-lg p-4 bg-[#39ff88] border border-[#39ff88] hover:bg-[#39ff88]/90 hover:shadow-[0_0_25px_rgba(57,255,136,0.4)] transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                      <span
                        className="font-bold text-black relative z-10 font-orbitron uppercase tracking-wider text-xs md:text-sm"
                      >
                        INITIATE ENROLLMENT SEQUENCE
                      </span>
                      <FaArrowRight className="h-4 w-4 text-black group-hover:translate-x-1 transition-transform relative z-10" />
                    </button>
                  </MagneticButton>
                </div>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Registration Form Modal */}
      <AnimatePresence>
        {showRegistration && selectedEvent && (
          <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/95 backdrop-blur-md">
            {/* Modal Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `linear-gradient(rgba(57, 255, 136, 0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(57, 255, 136, 0.15) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}
            ></div>
            <div className="min-h-screen px-4 text-center">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
                onClick={() => setShowRegistration(false)}
              ></div>

              <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

              <div className="inline-block w-[95%] max-w-2xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-[#0b1510] border border-[#39ff88]/30 rounded-xl shadow-[0_0_50px_rgba(57,255,136,0.2)] relative z-10">
                {/* Top Tech Bar */}
                <div className="h-1 w-full bg-gradient-to-r from-[#39ff88] via-[#18c96a] to-transparent"></div>

                <div className="flex justify-between items-center p-6 border-b border-[#39ff88]/15 bg-[#08100b]">
                  <div>
                    <div className="text-[10px] font-mono text-[#39ff88] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-pulse"></span>
                      :: SECURE_OPERATIVE_ENROLLMENT ::
                    </div>
                    <h3 className="text-xl font-bold text-white font-orbitron uppercase tracking-wide">
                      Target Module: <span className="text-[#39ff88]">{selectedEvent.title}</span>
                    </h3>
                  </div>
                  <button onClick={() => setShowRegistration(false)} className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                    <FaTimes />
                  </button>
                </div>

                <div className="p-6">
                  <RegistrationForm
                    selectedEvent={getAdminEvent(selectedEvent)}
                    onClose={() => setShowRegistration(false)}
                    onSubmit={handleRegistrationSubmit}
                    upiId={content?.upiId}
                    qrCodeUrl={content?.qrCodeUrl}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS DIGITAL QR PASS MODAL */}
      <AnimatePresence>
        {registeredPass && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0b1510] border border-[#39ff88]/40 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-[0_0_60px_rgba(57,255,136,0.3)] relative font-mono text-left"
            >
              <button
                onClick={() => setRegisteredPass(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
              >
                <FaTimes size={18} />
              </button>

              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39ff88]/10 border border-[#39ff88]/30 mb-2">
                  <FaCheckCircle className="text-[#39ff88]" size={14} />
                  <span className="text-[10px] text-[#39ff88] uppercase tracking-widest font-bold">
                    REGISTRATION CONFIRMED
                  </span>
                </div>
                <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-white">
                  OFFICIAL DIGITAL PASS
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  Individual credentials & separate barcode/QR pass generated per member.
                </p>
              </div>

              {/* Multi-member Pass Selector Tabs */}
              {registeredPass.allMembers && registeredPass.allMembers.length > 1 && (
                <div className="mb-4">
                  <div className="text-[10px] font-mono text-[#39ff88] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-pulse"></span>
                    SELECT SQUAD MEMBER PASS ({selectedPassIdx + 1}/{registeredPass.allMembers.length}):
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#39ff88]/20">
                    {registeredPass.allMembers.map((mem, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPassIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          selectedPassIdx === idx
                            ? "bg-[#39ff88] text-black shadow-[0_0_15px_rgba(57,255,136,0.3)]"
                            : "bg-[#08100b] border border-[#39ff88]/30 text-[#bfc8c3]/80 hover:text-white hover:border-[#39ff88]"
                        }`}
                      >
                        <span className="text-[10px] opacity-75">{idx === 0 ? "★" : `#${idx + 1}`}</span>
                        <span>{mem.name || `Member ${idx + 1}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Centered QR & Barcode Container */}
              {(() => {
                const activeMem = registeredPass.allMembers?.[selectedPassIdx] || registeredPass;
                const activeUserId = activeMem.userId || registeredPass.userId;
                const activeQrToken = activeMem.qrToken || registeredPass.qrToken;
                const activePass = activeMem.password || registeredPass.password;
                const activeName = activeMem.name || registeredPass.name;
                const activeRole = activeMem.role || "Member";

                return (
                  <>
                    <div className="bg-[#050806] border border-[#39ff88]/30 rounded-xl p-4 sm:p-5 mb-4 flex flex-col items-center justify-center">
                      {qrDataUrl ? (
                        <div className="bg-white p-3 rounded-xl shadow-lg mb-3">
                          <img src={qrDataUrl} alt="Student QR Code" className="w-44 h-44 sm:w-52 sm:h-52 mx-auto object-contain" />
                        </div>
                      ) : (
                        <div className="w-44 h-44 bg-black/40 rounded-xl flex items-center justify-center text-xs text-[#39ff88]">
                          Rendering Vector QR...
                        </div>
                      )}

                      {/* Barcode Graphic Visualization */}
                      <div className="w-full bg-[#08100b] border border-[#39ff88]/20 rounded-lg p-2.5 my-2 flex flex-col items-center">
                        <div className="flex justify-center items-center gap-[3px] h-9 w-full max-w-xs px-2">
                          {Array.from({ length: 48 }).map((_, i) => (
                            <span
                              key={i}
                              className="h-full bg-[#39ff88] transition-opacity"
                              style={{
                                width: i % 5 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
                                opacity: i % 7 === 0 ? 0.4 : 0.95
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] text-[#39ff88]/80 font-mono tracking-widest uppercase mt-1">
                          |||| BARCODE CLEARANCE ID: {activeUserId} ||||
                        </span>
                      </div>

                      <div className="text-center mt-1">
                        <span className="text-[10px] text-gray-400 block font-mono">UNIQUE CRYPTOGRAPHIC TOKEN:</span>
                        <code className="text-xs text-[#39ff88] font-bold font-mono tracking-wider break-all">{activeQrToken}</code>
                      </div>
                    </div>

                    {/* Student Credentials Box */}
                    <div className="bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-4 mb-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">OPERATIVE NAME:</span>
                        <span className="text-white font-bold">{activeName} ({activeRole})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">EVENT / TRACK:</span>
                        <span className="text-[#39ff88] font-bold">{registeredPass.event?.title}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">TEAM ID / NAME:</span>
                        <span className="text-white font-bold">{registeredPass.teamId} ({registeredPass.teamName})</span>
                      </div>
                      <div className="h-px bg-white/10 my-2" />
                      <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-[#39ff88]/20">
                        <span className="text-gray-400">USER ID (EMAIL):</span>
                        <div className="flex items-center gap-2">
                          <code className="text-[#39ff88] font-bold text-xs sm:text-sm">{activeUserId}</code>
                          <button
                            onClick={() => copyToClipboard(activeUserId, "userId")}
                            className="text-gray-400 hover:text-white p-1"
                            title="Copy User ID"
                          >
                            {copiedField === "userId" ? <FaCheck className="text-[#39ff88]" size={12} /> : <FaCopy size={12} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-[#39ff88]/20">
                        <span className="text-gray-400">PASSWORD:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-amber-300 font-bold text-xs sm:text-sm">{activePass}</code>
                          <button
                            onClick={() => copyToClipboard(activePass, "password")}
                            className="text-gray-400 hover:text-white p-1"
                            title="Copy Password"
                          >
                            {copiedField === "password" ? <FaCheck className="text-[#39ff88]" size={12} /> : <FaCopy size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5">
                      <button
                        onClick={downloadRegisteredPass}
                        className="w-full bg-[#39ff88] hover:bg-[#18c96a] text-black font-orbitron font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-[0_0_20px_rgba(57,255,136,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <FaDownload size={14} /> DOWNLOAD {activeName.toUpperCase()}&apos;S PASS (PNG)
                      </button>

                      <button
                        onClick={navigateToStudentPortal}
                        className="w-full bg-[#08100b] border border-[#39ff88]/40 hover:bg-[#39ff88]/10 text-[#39ff88] font-mono font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <FaExternalLinkAlt size={12} /> LOG IN TO STUDENT PORTAL AS {activeName.toUpperCase()}
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* General Ticket Portal */}
      {
        showTicketPortal && content && (
          <TicketPortal
            prices={content.ticketPrices}
            upiId={content.upiId}
            qrCodeUrl={content.qrCodeUrl}
            onClose={() => setShowTicketPortal(false)}
          />
        )
      }

      <Footer />
    </main>
  );
}