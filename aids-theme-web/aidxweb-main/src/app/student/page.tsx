"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import Link from "next/link";
import Header from "@/components/sections/header";
import MobileNav from "@/components/sections/MobileNav";
import Footer from "@/components/sections/footer";
import config from "@/config";
import { safeJsonResponse } from "@/lib/utils";
import { io } from "socket.io-client";
import {
  FaQrcode,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCoffee,
  FaHamburger,
  FaUserCheck,
  FaMapPin,
  FaCalendarAlt,
  FaUsers,
  FaLock,
  FaSignOutAlt,
  FaSyncAlt,
  FaCopy,
  FaCheck,
  FaShieldAlt,
  FaInfoCircle,
  FaCamera,
  FaUpload,
  FaSearch,
  FaSpinner
} from "react-icons/fa";
import { Html5Qrcode } from "html5-qrcode";

interface StudentSession {
  user: {
    userId: string;
    name: string;
    email?: string;
    phone?: string;
    college?: string;
    department?: string;
    role?: string;
    qrToken?: string;
  };
  team: {
    teamId: string;
    teamName: string;
    college: string;
    department: string;
    allMembers: { userId: string; name: string; role: string }[];
  };
  event: {
    id: string;
    title: string;
    venue?: string;
    time?: string;
  };
  attendance: {
    present: boolean;
    presentTime?: string;
    lunch: boolean;
    lunchTime?: string;
    snacks: boolean;
    snacksTime?: string;
  };
  qrToken: string;
  barcode?: string;
}

export default function StudentPortalPage() {
  const [loginMode, setLoginMode] = useState<"credentials" | "qr_scan" | "qr_upload" | "signup">("credentials");
  const [userIdInput, setUserIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Student Profile Signup State
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    college: "",
    department: "",
    year: "3"
  });

  const [session, setSession] = useState<StudentSession | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Student QR Camera Scanner State
  const [isQrScanning, setIsQrScanning] = useState(false);
  const [qrCamError, setQrCamError] = useState<string | null>(null);
  const [scanRetryTrigger, setScanRetryTrigger] = useState(0);

  useEffect(() => {
    // Session storage persistence check (isolated to tab)
    const savedSession = sessionStorage.getItem("neura_student_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSession(parsed);
        if (parsed.qrToken) {
          generateQrDataUrl(parsed.qrToken || `QR-${parsed.user.userId}-${parsed.team.teamId}`);
        }
        refreshLiveStatus(parsed.user.userId);
      } catch (e) {
        sessionStorage.removeItem("neura_student_session");
      }
    }
  }, []);

  const generateQrDataUrl = async (token: string) => {
    try {
      const url = await QRCode.toDataURL(token, {
        width: 320,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" }
      });
      setQrDataUrl(url);
    } catch (e) {
      console.error("QR Code error:", e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch(`${config.API_URL}/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userIdInput.trim(), password: passwordInput.trim() })
      });

      const data = await safeJsonResponse(res);
      if (data && data.success && data.data) {
        const studentSession: StudentSession = data.data;
        setSession(studentSession);
        sessionStorage.setItem("neura_student_session", JSON.stringify(studentSession));
        localStorage.setItem("neura_student_profile", JSON.stringify(studentSession.user));
        if (studentSession.qrToken) {
          generateQrDataUrl(studentSession.qrToken);
        }
      } else {
        setLoginError(data?.message || data?.error || "Invalid Student User ID or Password");
      }
    } catch (err) {
      setLoginError("Server authentication error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setLoginError("Name, Email (User ID), and Password are required");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${config.API_URL}/student/profile/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm)
      });

      const data = await safeJsonResponse(res);
      if (data && data.success) {
        localStorage.setItem("neura_student_profile", JSON.stringify(data.data.user));
        // Auto-login into student portal
        setUserIdInput(signupForm.email);
        setPasswordInput(signupForm.password);
        setLoginMode("credentials");
        setLoginError("");
        // Attempt immediate login
        const loginRes = await fetch(`${config.API_URL}/student/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: signupForm.email, password: signupForm.password })
        });
        const loginData = await safeJsonResponse(loginRes);
        if (loginData && loginData.success && loginData.data) {
          setSession(loginData.data);
          sessionStorage.setItem("neura_student_session", JSON.stringify(loginData.data));
          if (loginData.data.qrToken) {
            generateQrDataUrl(loginData.data.qrToken);
          }
        }
      } else {
        setLoginError(data?.error || data?.message || "Profile registration failed");
      }
    } catch (err) {
      setLoginError("Error connecting to registration server");
    } finally {
      setLoading(false);
    }
  };

  // Instant QR Token Authentication
  const handleTokenLogin = async (tokenStr: string) => {
    if (!tokenStr) return;
    setLoading(true);
    setLoginError("");
    setQrCamError(null);

    try {
      const res = await fetch(`${config.API_URL}/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenStr.trim() })
      });

      const data = await safeJsonResponse(res);
      if (data && data.success && data.data) {
        const studentSession: StudentSession = data.data;
        setSession(studentSession);
        sessionStorage.setItem("neura_student_session", JSON.stringify(studentSession));
        generateQrDataUrl(studentSession.qrToken);
      } else {
        setLoginError(data?.message || "Invalid or unrecognized QR token from scanned pass.");
      }
    } catch (err) {
      setLoginError("QR Authentication failed. Please try credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Student Camera Scanner Effect
  useEffect(() => {
    let isMounted = true;
    let localScanner: Html5Qrcode | null = null;

    if (session || loginMode !== "qr_scan") return;

    const startStudentScanner = async () => {
      setQrCamError(null);
      setIsQrScanning(false);

      await new Promise((r) => setTimeout(r, 250));
      if (!isMounted) return;

      const readerElem = document.getElementById("student-qr-reader");
      if (!readerElem) return;
      readerElem.innerHTML = "";

      try {
        localScanner = new Html5Qrcode("student-qr-reader", { verbose: false });

        const cameras = await Html5Qrcode.getCameras().catch(() => []);
        const cameraIdOrConfig = cameras && cameras.length > 0
          ? cameras[cameras.length - 1].id // Prefer environment/back camera if available
          : { facingMode: "environment" };

        await localScanner.start(
          cameraIdOrConfig,
          { fps: 15, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
          (decodedText) => {
            if (isMounted) {
              if (localScanner?.isScanning) localScanner.stop().catch(() => {});
              handleTokenLogin(decodedText);
            }
          },
          () => {}
        );

        if (isMounted) setIsQrScanning(true);
      } catch (err: any) {
        console.warn("Camera start fallback attempt:", err);
        // Secondary fallback to generic user camera
        try {
          if (localScanner && isMounted) {
            await localScanner.start(
              { facingMode: "user" },
              { fps: 15, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
              (decodedText) => {
                if (isMounted) {
                  if (localScanner?.isScanning) localScanner.stop().catch(() => {});
                  handleTokenLogin(decodedText);
                }
              },
              () => {}
            );
            if (isMounted) setIsQrScanning(true);
            return;
          }
        } catch (fallbackErr) {
          console.error("Camera fallback failed:", fallbackErr);
        }

        if (isMounted) {
          setQrCamError(
            "Camera permission blocked or unavailable. Click the lock icon 🔒 in your browser address bar to allow camera, or use Upload QR / Email Login below."
          );
        }
      }
    };

    startStudentScanner();

    return () => {
      isMounted = false;
      if (localScanner?.isScanning) {
        localScanner.stop().then(() => localScanner?.clear()).catch(() => {});
      }
    };
  }, [session, loginMode, scanRetryTrigger]);

  // Upload QR badge file handler
  const handleStudentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let temp = document.getElementById("student-temp-reader");
      if (!temp) {
        temp = document.createElement("div");
        temp.id = "student-temp-reader";
        temp.style.display = "none";
        document.body.appendChild(temp);
      }
      const scanner = new Html5Qrcode("student-temp-reader");
      const decoded = await scanner.scanFile(file, true);
      scanner.clear();
      handleTokenLogin(decoded);
    } catch (e) {
      setLoginError("Could not decode QR code from the uploaded image. Please ensure image is clear.");
    } finally {
      e.target.value = "";
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("neura_student_session");
    setSession(null);
    setUserIdInput("");
    setPasswordInput("");
  };

  const refreshLiveStatus = async (userId: string) => {
    setRefreshingStatus(true);
    try {
      const res = await fetch(`${config.API_URL}/student/profile/${encodeURIComponent(userId)}`);
      const data = await safeJsonResponse(res);
      if (data && data.success && data.data) {
        setSession((prev) => (prev ? { ...prev, attendance: data.data.attendance } : data.data));
      }
    } catch (e) {
      /* Silent update */
    } finally {
      setRefreshingStatus(false);
    }
  };

  // Real-time WebSocket Push Sync with Fallback Polling
  useEffect(() => {
    if (!session?.user?.userId) return;

    const socketUrl = config.API_URL.replace(/\/api$/, "");
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });

    socket.emit("join_student_room", session.user.userId);
    if (session.team?.teamId) {
      socket.emit("join_team_room", session.team.teamId);
    }

    socket.on("scan_verified", (data: any) => {
      console.log("⚡ Real-time Scan Verified Push Received:", data);
      refreshLiveStatus(session.user.userId);
    });

    // 15s Fallback Polling interval
    const interval = setInterval(() => {
      refreshLiveStatus(session.user.userId);
    }, 15000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [session?.user?.userId, session?.team?.teamId]);

  const copyQrToken = () => {
    if (!session?.qrToken) return;
    navigator.clipboard.writeText(session.qrToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  // HD Canvas Pass Generator (600x740px)
  const handleDownloadQR = async () => {
    if (!session) return;

    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 740;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Dark Neon Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 740);
    bgGrad.addColorStop(0, "#130a2a");
    bgGrad.addColorStop(0.6, "#08100b");
    bgGrad.addColorStop(1, "#090514");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 740);

    // 2. Top Header Accent Banner
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

    // 3. Event Title Header
    ctx.textAlign = "center";
    ctx.fillStyle = "#a395f3";
    ctx.font = "bold 16px monospace";
    ctx.fillText("NEURA 2026 // SYMPOSIUM ACCESS PASS", 300, 60);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText((session.event?.title || "NATIONAL TECHNICAL SYMPOSIUM").toUpperCase(), 300, 92);

    // 4. Pass Badge Pill
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

    // 5. QR Frame (Centered 360x360 white container)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(170, 160, 260, 260, 16);
    ctx.fill();

    // Render QR Code inside frame
    try {
      const qrUrl = await QRCode.toDataURL(session.qrToken, {
        width: 240,
        margin: 0,
        color: { dark: "#000000", light: "#ffffff" }
      });
      const img = new Image();
      img.src = qrUrl;
      await new Promise((res) => { img.onload = res; });
      ctx.drawImage(img, 180, 170, 240, 240);
    } catch (e) {
      ctx.fillStyle = "#000000";
      ctx.font = "14px monospace";
      ctx.fillText("QR RENDER ERROR", 300, 290);
    }

    // 6. Participant Details
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(session.user.name.toUpperCase(), 300, 465);

    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 18px monospace";
    ctx.fillText(`${session.user.userId} • [${session.user.role || "Member"}]`, 300, 498);

    ctx.fillStyle = "#a395f3";
    ctx.font = "bold 16px monospace";
    ctx.fillText(`Team: ${session.team.teamName} (${session.team.teamId})`, 300, 530);

    ctx.fillStyle = "#8e82cf";
    ctx.font = "14px sans-serif";
    ctx.fillText(`${session.team.college} — ${session.team.department}`, 300, 560);

    // Barcode Graphic Lines on Downloaded HD Card
    const barcodeY = 580;
    ctx.fillStyle = "#39ff88";
    const barToken = session.user.userId;
    for (let bx = 120; bx < 480; bx += 6) {
      const barW = (bx % 12 === 0 || bx % 18 === 0) ? 3 : 1.5;
      ctx.fillRect(bx, barcodeY, barW, 26);
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "10px monospace";
    ctx.fillText(`* ${barToken} *`, 300, 618);

    // Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 630);
    ctx.lineTo(540, 630);
    ctx.stroke();

    // Security Gate Instructions
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "11px monospace";
    ctx.fillText("Present this individual digital pass at the entrance & meal desks.", 300, 652);
    ctx.fillText("Valid for Symposium Entry, Attendance & Authorized Meal Passes.", 300, 672);

    // Token Hash
    ctx.fillStyle = "rgba(57, 255, 136, 0.8)";
    ctx.font = "10px monospace";
    ctx.fillText(`TOKEN: ${session.qrToken}`, 300, 700);

    // 7. Auto-Download Trigger
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `PASS_${session.user.userId.replace(/[^a-zA-Z0-9]/g, '_')}_${session.user.name.replace(/\s+/g, "_")}.png`;
    link.click();
  };

  return (
    <>
      <MobileNav />
      <Header />
      <main className="min-h-screen bg-[#050806] text-white pt-28 pb-20 font-sans selection:bg-[#39ff88] selection:text-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header Title Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#08100b] border border-[#39ff88]/30 mb-3 shadow-[0_0_15px_rgba(57,255,136,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse" />
              <span className="font-mono text-xs text-[#39ff88] tracking-widest uppercase">
                NEURA 2026 // STUDENT CREDENTIAL SUITE
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-orbitron tracking-wider text-white mb-2">
              STUDENT PROFILE & DIGITAL PASS
            </h1>
            <p className="text-gray-400 font-mono text-xs sm:text-sm max-w-xl mx-auto">
              Your official symposium passport with dynamic QR verification, real-time attendance, and meal token tracker.
            </p>
          </div>

          {/* STUDENT LOGIN CARD */}
          {!session ? (
            <div className="max-w-md mx-auto bg-[#08100b]/90 border border-[#39ff88]/30 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(57,255,136,0.15)] relative overflow-hidden font-mono">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ef4a40] via-[#a395f3] to-[#39ff88]" />
              
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#39ff88]/10 border border-[#39ff88]/30 flex items-center justify-center text-[#39ff88] text-2xl mb-3 shadow-[0_0_20px_rgba(57,255,136,0.2)]">
                  {loginMode === "credentials" ? <FaLock /> : <FaQrcode />}
                </div>
                <h2 className="font-orbitron font-bold text-xl text-white">STUDENT AUTHENTICATION</h2>
                <p className="text-gray-400 text-xs mt-1">
                  {loginMode === "credentials"
                    ? "Enter your registered Email (User ID) & chosen Password"
                    : loginMode === "signup"
                    ? "Register your Student Profile & set your custom password"
                    : "Scan or upload your individual QR badge for instant login"}
                </p>
              </div>

              {/* Login Method Toggle */}
              <div className="grid grid-cols-4 gap-1 bg-[#050806] border border-white/10 rounded-xl p-1 mb-5 text-[10px]">
                <button
                  type="button"
                  onClick={() => { setLoginMode("credentials"); setLoginError(""); }}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    loginMode === "credentials" ? "bg-[#39ff88] text-black shadow-[0_0_10px_rgba(57,255,136,0.3)]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaLock size={10} /> Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMode("signup"); setLoginError(""); }}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    loginMode === "signup" ? "bg-[#39ff88] text-black shadow-[0_0_10px_rgba(57,255,136,0.3)]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaUserCheck size={10} /> Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMode("qr_scan"); setLoginError(""); }}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    loginMode === "qr_scan" ? "bg-[#39ff88] text-black shadow-[0_0_10px_rgba(57,255,136,0.3)]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaCamera size={10} /> Live QR
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMode("qr_upload"); setLoginError(""); }}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    loginMode === "qr_upload" ? "bg-[#39ff88] text-black shadow-[0_0_10px_rgba(57,255,136,0.3)]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaUpload size={10} /> Upload
                </button>
              </div>

              {/* MODE 1: CREDENTIALS LOGIN FORM */}
              {loginMode === "credentials" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">
                      Student Email Address (User ID)
                    </label>
                    <input
                      type="text"
                      value={userIdInput}
                      onChange={(e) => setUserIdInput(e.target.value)}
                      placeholder="student@example.com (or User ID)"
                      className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#39ff88] transition-all font-mono"
                      required
                    />
                    <span className="text-[10px] text-gray-500 font-mono">Use the email you provided during registration.</span>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">
                      Password (Set by You)
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter the password you created during registration..."
                      className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#39ff88] transition-all font-mono"
                      required
                    />
                  </div>

                  {loginError && (
                    <p className="text-red-400 text-xs text-center bg-red-950/40 py-2.5 px-3 border border-red-500/30 rounded-xl">
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#39ff88] text-black font-orbitron font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#18c96a] shadow-[0_0_20px_rgba(57,255,136,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> AUTHENTICATING...</>
                    ) : (
                      <>UNLOCK INDIVIDUAL EVENT PASS</>
                    )}
                  </button>
                </form>
              )}

              {/* MODE 1B: SIGNUP / PROFILE CREATION FORM */}
              {loginMode === "signup" && (
                <form onSubmit={handleSignup} className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm(s => ({ ...s, name: e.target.value }))}
                      placeholder="Your Full Name"
                      className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl py-2.5 px-3.5 text-white text-xs focus:outline-none focus:border-[#39ff88] font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1 uppercase tracking-wider">Email Address (User ID) *</label>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(s => ({ ...s, email: e.target.value }))}
                      placeholder="student@domain.com"
                      className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl py-2.5 px-3.5 text-white text-xs focus:outline-none focus:border-[#39ff88] font-mono"
                      required
                    />
                    <span className="text-[10px] text-[#39ff88]/80 font-mono">This email will be your permanent User ID.</span>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1 uppercase tracking-wider">Password (Set by You) *</label>
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(s => ({ ...s, password: e.target.value }))}
                      placeholder="Create a password (min 4 chars)"
                      className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl py-2.5 px-3.5 text-white text-xs focus:outline-none focus:border-[#39ff88] font-mono"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-400 text-[10px] mb-1 uppercase tracking-wider">Mobile No. *</label>
                      <input
                        type="tel"
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm(s => ({ ...s, phone: e.target.value }))}
                        placeholder="Mobile"
                        className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#39ff88] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[10px] mb-1 uppercase tracking-wider">College *</label>
                      <input
                        type="text"
                        value={signupForm.college}
                        onChange={(e) => setSignupForm(s => ({ ...s, college: e.target.value }))}
                        placeholder="College"
                        className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#39ff88] font-mono"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <p className="text-red-400 text-xs text-center bg-red-950/40 py-2 px-3 border border-red-500/30 rounded-xl">
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#39ff88] text-black font-orbitron font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#18c96a] shadow-[0_0_20px_rgba(57,255,136,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaUserCheck />} CREATE PROFILE
                  </button>
                </form>
              )}

              {/* MODE 2: LIVE QR SCANNER AUTO-LOGIN */}
              {loginMode === "qr_scan" && (
                <div className="space-y-3 text-center">
                  <div className="bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 min-h-[240px] flex flex-col items-center justify-center relative overflow-hidden">
                    {qrCamError ? (
                      <div className="p-5 bg-[#150a0a] border border-red-500/40 rounded-xl space-y-3.5 text-center max-w-sm">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                          <FaCamera size={18} />
                        </div>
                        <p className="text-red-300 text-xs font-mono leading-relaxed">
                          Camera permission is blocked or unavailable in this browser.
                        </p>
                        <div className="text-[10px] text-gray-400 font-mono bg-black/50 p-2.5 rounded-lg border border-white/5 text-left">
                          💡 <strong>How to enable:</strong> Click the <strong>lock icon 🔒</strong> in your browser&apos;s address bar next to the URL &rarr; set <strong>Camera</strong> to <strong>Allow</strong>.
                        </div>
                        <div className="flex flex-col gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setQrCamError(null);
                              setScanRetryTrigger(prev => prev + 1);
                            }}
                            className="w-full py-2 bg-[#39ff88] text-black font-mono font-bold text-xs rounded-lg hover:bg-[#39ff88]/90 transition-all cursor-pointer"
                          >
                            🔄 Retry Camera Access
                          </button>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setLoginMode("qr_upload")}
                              className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs rounded-lg transition-all cursor-pointer"
                            >
                              📁 Upload QR
                            </button>
                            <button
                              type="button"
                              onClick={() => setLoginMode("credentials")}
                              className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-[#39ff88] font-mono text-xs rounded-lg transition-all cursor-pointer"
                            >
                              🔑 Password Login
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {!isQrScanning && (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="w-6 h-6 border-2 border-[#39ff88] border-t-transparent rounded-full animate-spin" />
                            <span className="text-[11px] text-[#39ff88]">Starting Camera...</span>
                          </div>
                        )}
                        <div id="student-qr-reader" className="w-full max-w-[240px] mx-auto rounded-lg overflow-hidden [&_video]:rounded-lg" />
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">Point your camera at your QR Badge to log in automatically.</p>
                  {loginError && (
                    <p className="text-red-400 text-xs bg-red-950/40 py-2 px-3 border border-red-500/30 rounded-xl">
                      {loginError}
                    </p>
                  )}
                </div>
              )}

              {/* MODE 3: UPLOAD QR BADGE IMAGE AUTO-LOGIN */}
              {loginMode === "qr_upload" && (
                <div className="space-y-3 text-center">
                  <div className="bg-[#050806] border border-dashed border-[#39ff88]/40 rounded-xl p-6 flex flex-col items-center justify-center">
                    <FaUpload size={28} className="text-[#39ff88] mb-2" />
                    <p className="text-xs text-white mb-2">Upload Pass Screenshot / Downloaded PNG Badge</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStudentFileUpload}
                      className="text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-[#39ff88] file:text-black file:font-bold cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">Upload your pass card file to automatically decode token and login.</p>
                  {loginError && (
                    <p className="text-red-400 text-xs bg-red-950/40 py-2 px-3 border border-red-500/30 rounded-xl">
                      {loginError}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-400">
                Forgot or haven&apos;t received your User ID? <Link href="/lookup" className="text-[#39ff88] hover:underline">Lookup Registration</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TOP SESSION CONTROL BAR */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#08100b]/80 border border-white/10 backdrop-blur-xl rounded-2xl p-4 font-mono text-xs shadow-lg">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#39ff88] animate-pulse" />
                  <span className="text-gray-300">
                    Logged in: <strong className="text-white font-bold">{session.user.name}</strong> (<code className="text-[#39ff88] font-bold">{session.user.userId}</code>)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => refreshLiveStatus(session.user.userId)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-[#39ff88]/50 text-gray-200 hover:text-[#39ff88] rounded-xl transition-all flex items-center gap-1.5"
                    title="Sync Live Attendance"
                  >
                    <FaSyncAlt className={refreshingStatus ? "animate-spin" : ""} size={12} /> Sync Status
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/60 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <FaSignOutAlt size={12} /> Logout
                  </button>
                </div>
              </div>

              {/* TWO-COLUMN DASHBOARD & PASS LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* LEFT COLUMN: PARTICIPANT DETAILS & STATUSES (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* PARTICIPANT IDENTIFICATION CARD */}
                  <div className="bg-[#08100b]/80 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden font-mono">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ef4a40] via-[#a395f3] to-[#39ff88]" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-[#39ff88]/10 text-[#39ff88] border border-[#39ff88]/30 rounded-full text-xs font-bold uppercase">
                          {session.event?.title || "AIDEX 2026 SYMPOSIUM"}
                        </span>
                        <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase">
                          {session.user.role || "Member"}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">Team: <strong className="text-white">{session.team.teamId}</strong></span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black text-white font-orbitron tracking-wide uppercase mb-1">
                      {session.user.name}
                    </h2>
                    <p className="text-sm text-[#a395f3] font-bold">
                      Team &ldquo;{session.team.teamName}&rdquo;
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-5 mt-5 border-t border-white/10">
                      <div>
                        <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">Student ID</span>
                        <span className="text-[#4ade80] font-bold text-sm">{session.user.userId}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">College</span>
                        <span className="text-gray-200">{session.team.college}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">Department</span>
                        <span className="text-gray-200">{session.team.department}</span>
                      </div>
                    </div>
                  </div>

                  {/* REAL-TIME ATTENDANCE & MEAL TRI-STATUS INDICATORS */}
                  <div className="bg-[#08100b]/80 border border-white/10 backdrop-blur-xl rounded-3xl p-6 font-mono shadow-lg">
                    <h3 className="text-xs font-bold text-[#39ff88] uppercase tracking-widest mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse" />
                        LIVE STATUS INDICATORS
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">Auto-synchronized with gate scanner</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {/* Event Attendance */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        session.attendance?.present 
                          ? "bg-green-500/10 border-green-500/40 text-green-300" 
                          : "bg-red-500/10 border-red-500/30 text-red-300"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider">Event Attendance</span>
                          {session.attendance?.present ? <FaCheckCircle className="text-green-400" /> : <FaTimesCircle className="text-red-400" />}
                        </div>
                        <p className="text-sm font-bold font-orbitron">
                          {session.attendance?.present ? "✓ Present" : "✗ Absent / Pending"}
                        </p>
                        <span className="text-[10px] opacity-75 block mt-1">
                          {session.attendance?.present ? `Verified at ${session.attendance.presentTime || "Entrance Desk"}` : "Scan pass at gate"}
                        </span>
                      </div>

                      {/* Lunch Pass */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        session.attendance?.lunch 
                          ? "bg-green-500/10 border-green-500/40 text-green-300" 
                          : "bg-white/5 border-white/10 text-gray-400"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider">Lunch Pass</span>
                          <FaHamburger className={session.attendance?.lunch ? "text-emerald-400" : "text-gray-500"} />
                        </div>
                        <p className="text-sm font-bold font-orbitron">
                          {session.attendance?.lunch ? "🍱 Redeemed" : "🍱 Available"}
                        </p>
                        <span className="text-[10px] opacity-75 block mt-1">
                          {session.attendance?.lunch ? `Claimed (${session.attendance.lunchTime || "Lunch Counter"})` : "Present QR at food court"}
                        </span>
                      </div>

                      {/* Snacks Pass */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        session.attendance?.snacks 
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-300" 
                          : "bg-white/5 border-white/10 text-gray-400"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider">Snacks Pass</span>
                          <FaCoffee className={session.attendance?.snacks ? "text-amber-400" : "text-gray-500"} />
                        </div>
                        <p className="text-sm font-bold font-orbitron">
                          {session.attendance?.snacks ? "☕ Redeemed" : "☕ Available"}
                        </p>
                        <span className="text-[10px] opacity-75 block mt-1">
                          {session.attendance?.snacks ? `Claimed (${session.attendance.snacksTime || "Snack Desk"})` : "Present QR at refreshment counter"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* EVENT SCHEDULE & VENUE INSPECTOR */}
                  <div className="bg-[#08100b]/80 border border-white/10 backdrop-blur-xl rounded-3xl p-6 font-mono shadow-lg">
                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FaCalendarAlt className="text-purple-400" /> SCHEDULE & VENUE COORDINATES
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <FaMapPin size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest block">Venue Location</span>
                          <span className="text-sm font-bold text-white block mt-0.5">
                            {session.event?.venue || "Main Tech Auditorium / Lab Block A"}
                          </span>
                          <span className="text-xs text-gray-400">Vel Tech Multi Tech Campus</span>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                          <FaClock size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest block">Event Timing</span>
                          <span className="text-sm font-bold text-white block mt-0.5">
                            {session.event?.time || "09:00 AM — 04:30 PM"}
                          </span>
                          <span className="text-xs text-gray-400">Registration opens at 08:30 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TEAM ROSTER VIEW */}
                  <div className="bg-[#08100b]/80 border border-white/10 backdrop-blur-xl rounded-3xl p-6 font-mono shadow-lg">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FaUsers className="text-[#39ff88]" /> SQUAD ROSTER ({session.team.allMembers?.length || 1} PARTICIPANTS)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {session.team.allMembers?.map((m) => {
                        const isCurrent = m.userId === session.user.userId;
                        return (
                          <div
                            key={m.userId}
                            className={`rounded-2xl p-3.5 flex items-center justify-between transition-all ${
                              isCurrent 
                                ? "bg-[#ef4a40]/10 border border-[#ef4a40] shadow-[0_0_15px_rgba(239,74,64,0.25)]" 
                                : "bg-white/5 border border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-white text-sm">{m.name}</p>
                                {isCurrent && (
                                  <span className="text-[9px] bg-[#ef4a40] text-white px-1.5 py-0.5 rounded font-black tracking-wider">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">ID: <code className="text-[#4ade80]">{m.userId}</code></p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] bg-white/10 border border-white/15 text-gray-200 rounded-full font-bold uppercase">
                              {m.role || "Member"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: OFFICIAL EVENT PASS & QR BADGE CONTAINER */}
                <div className="bg-[#08100b]/90 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(57,255,136,0.15)] flex flex-col items-center text-center font-mono sticky top-28">
                  <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs">
                    <span className="text-[#39ff88] font-bold flex items-center gap-1.5">
                      <FaShieldAlt /> VERIFIED PASS
                    </span>
                    <span className="text-gray-400 text-[10px]">600x740 HD</span>
                  </div>

                  {/* QR Image Frame */}
                  <div className="p-4 bg-white rounded-2xl shadow-2xl mb-3 max-w-[240px] w-full flex items-center justify-center">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="Participant Event Pass QR" className="w-full h-auto object-contain rounded-lg" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-gray-500 font-mono text-xs">Synthesizing QR...</div>
                    )}
                  </div>

                  {/* Barcode Graphic Stripes */}
                  <div className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-2.5 mb-3 flex flex-col items-center">
                    <div className="flex justify-center items-center gap-[3px] h-8 w-full max-w-[220px] px-2">
                      {Array.from({ length: 42 }).map((_, i) => (
                        <span
                          key={i}
                          className="h-full bg-[#39ff88]"
                          style={{
                            width: i % 4 === 0 ? '3px' : i % 2 === 0 ? '2px' : '1px',
                            opacity: i % 6 === 0 ? 0.35 : 0.95
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-[#39ff88] font-mono tracking-widest uppercase mt-1">
                      BARCODE ID: {session.user.userId}
                    </span>
                  </div>

                  {/* Token String Box */}
                  <div className="w-full bg-[#050806] border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
                    <div className="text-left overflow-hidden mr-2">
                      <span className="text-gray-400 text-[9px] uppercase tracking-widest block">Token Hash</span>
                      <span className="text-[#39ff88] font-bold text-xs truncate block">{session.qrToken}</span>
                    </div>
                    <button
                      onClick={copyQrToken}
                      className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-all"
                      title="Copy Token String"
                    >
                      {copiedToken ? <FaCheck className="text-green-400" size={13} /> : <FaCopy size={13} />}
                    </button>
                  </div>

                  {/* One-Click Download HD Pass Badge */}
                  <button
                    onClick={handleDownloadQR}
                    className="w-full py-3.5 bg-gradient-to-r from-[#18c96a] via-[#39ff88] to-[#4ade80] text-black font-orbitron font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-95 shadow-[0_0_25px_rgba(57,255,136,0.35)] transition-all flex items-center justify-center gap-2 mb-4 cursor-pointer"
                  >
                    <FaDownload /> DOWNLOAD HD PASS (.PNG)
                  </button>

                  {/* Gate Instructions */}
                  <div className="text-left text-[11px] text-gray-400 space-y-2 bg-white/5 p-3.5 rounded-xl border border-white/5 w-full">
                    <p className="flex items-center gap-1.5 text-gray-300 font-bold text-xs">
                      <FaInfoCircle className="text-[#39ff88]" /> Gate Pass Instructions:
                    </p>
                    <p>• Keep this QR saved offline on your mobile device.</p>
                    <p>• Present at the verification terminal upon arrival.</p>
                    <p>• Single-scan clearance grants entrance, lunch, & snacks.</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

