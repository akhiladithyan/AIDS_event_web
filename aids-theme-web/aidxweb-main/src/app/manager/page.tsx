"use client";

import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import QRCode from "qrcode";
import JSZip from "jszip";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import config from "@/config";
import { safeJsonResponse } from "@/lib/utils";
import { 
  FaUserCheck, 
  FaUsers,
  FaUtensils, 
  FaSearch, 
  FaFilter, 
  FaLock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSyncAlt,
  FaCoffee,
  FaHamburger,
  FaConciergeBell,
  FaQrcode,
  FaCamera,
  FaUpload,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaFileCsv,
  FaKey,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaTimes,
  FaUserPlus,
  FaIdCard
} from "react-icons/fa";

// Interfaces
interface Member {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  college?: string;
  department?: string;
  role?: string;
  password?: string;
  qrToken?: string;
  barcode?: string;
}

interface TeamData {
  _id: string;
  teamId: string;
  teamName: string;
  event: { id: string; title: string };
  college: string;
  department: string;
  teamLeader: Member;
  members: Member[];
  allMembers: Member[];
  attendance: {
    present: boolean;
    lunch: boolean;
    snacks: boolean;
    studentScans: Record<string, { userId?: string; memberName?: string; present?: boolean; presentTime?: string; lunch?: boolean; lunchTime?: string; snacks?: boolean; snacksTime?: string }>;
  };
  createdAt: string;
}

interface ScanToast {
  type: "success" | "warning" | "error";
  message: string;
  data?: {
    teamId?: string;
    teamName?: string;
    memberName?: string;
    userId?: string;
    eventTitle?: string;
    scannedAt?: string;
    mode?: string;
    timestamp?: string;
  };
}

// Utility to sanitize key for student scans
const toScanKey = (emailOrId?: string) => {
  if (!emailOrId) return "";
  return String(emailOrId).toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, "_");
};

export default function ManagerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [authError, setAuthError] = useState("");

  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"team" | "member">("team");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("ALL");
  const [attendanceFilter, setAttendanceFilter] = useState<"ALL" | "ATTENDED" | "ABSENT" | "LUNCH" | "SNACKS">("ALL");
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<"attendance" | "lunch" | "snacks">("attendance");
  const [inputMode, setInputMode] = useState<"camera" | "upload" | "manual">("camera");
  const [manualToken, setManualToken] = useState("");
  const [scanningActive, setScanningActive] = useState(false);
  const [toastNotification, setToastNotification] = useState<ScanToast | null>(null);

  // Password Confirmation Modal State (Destructive Actions)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [pendingActionTitle, setPendingActionTitle] = useState("");

  // On-Spot Registration State
  const [showOnSpotModal, setShowOnSpotModal] = useState(false);
  const [onSpotData, setOnSpotData] = useState({
    teamName: "",
    eventTitle: "Algorithmic Duel (Speed Coding)",
    college: "",
    department: "",
    leaderName: "",
    leaderPhone: "",
    leaderEmail: "",
    members: [{ name: "", phone: "" }]
  });

  // Team Edit Modal State
  const [editingTeam, setEditingTeam] = useState<TeamData | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  // Batch QR Pass Generator State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchEventFilter, setBatchEventFilter] = useState("ALL");
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraRetryCount, setCameraRetryCount] = useState(0);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);

  useEffect(() => {
    // Session persistence check
    const managerAuth = sessionStorage.getItem("neura_manager_auth") || localStorage.getItem("nexathon_token");
    if (managerAuth) {
      setIsAuthenticated(true);
      fetchTeams();
    }
  }, []);

  // Web Audio API Success Chime
  const playSound = (type: "success" | "warning" | "error") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "warning") {
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.15); // F4
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      /* Audio context not allowed without interaction */
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch(`${config.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "manager@nexathon.org", password: passphrase }),
      });
      const data = await safeJsonResponse(res);
      if (data && data.success && data.token) {
        sessionStorage.setItem("neura_manager_auth", data.token);
        sessionStorage.setItem("neura_manager_token", data.token);
        localStorage.setItem("nexathon_token", data.token);
        setIsAuthenticated(true);
        fetchTeams();
        return;
      }
      
      // Fallback for legacy password check
      if (passphrase === "manager123" || passphrase === "admin123") {
        sessionStorage.setItem("neura_manager_auth", "authenticated");
        localStorage.setItem("nexathon_token", "manager-token-2026");
        setIsAuthenticated(true);
        fetchTeams();
        return;
      }

      setAuthError(data?.error || data?.message || "Invalid Manager Credentials");
    } catch (err) {
      if (passphrase === "manager123" || passphrase === "admin123") {
        sessionStorage.setItem("neura_manager_auth", "authenticated");
        setIsAuthenticated(true);
        fetchTeams();
      } else {
        setAuthError("Server authentication failed.");
      }
    }
  };

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/manager/teams`);
      const data = await safeJsonResponse(res);
      if (data && data.success) {
        setTeams(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch teams", err);
    } finally {
      setLoading(false);
    }
  };

  // Require Password Confirmation before Destructive Action
  const triggerProtectedAction = (title: string, action: () => void) => {
    setPendingActionTitle(title);
    setPendingAction(() => action);
    setConfirmPasswordInput("");
    setConfirmPasswordError("");
    setShowPasswordConfirm(true);
  };

  const handleConfirmPassword = () => {
    if (confirmPasswordInput === "manager123" || confirmPasswordInput === "admin123") {
      setShowPasswordConfirm(false);
      if (pendingAction) pendingAction();
      setPendingAction(null);
    } else {
      setConfirmPasswordError("Incorrect Password. Action Aborted.");
      playSound("error");
    }
  };

  // QR Scan Execution
  const executeScan = async (tokenStr: string) => {
    if (!tokenStr) return;
    try {
      const res = await fetch(`${config.API_URL}/manager/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenOrId: tokenStr, mode: scanMode, scannedBy: "Manager Desk" })
      });
      const result = await safeJsonResponse(res);

      if (result && result.success) {
        playSound("success");
        setToastNotification({
          type: "success",
          message: `🟢 ${result.message}`,
          data: result.data
        });
        fetchTeams(); // refresh list live
      } else if (result.alreadyScanned) {
        playSound("warning");
        setToastNotification({
          type: "warning",
          message: result.message,
          data: result.data
        });
      } else {
        playSound("error");
        setToastNotification({
          type: "error",
          message: `🔴 ${result.error || "Invalid QR Token"}`
        });
      }
    } catch (err) {
      playSound("error");
      setToastNotification({
        type: "error",
        message: "❌ Network error during scan verification"
      });
    }
  };

  // Camera QR Scanner Initialization with preflight permissions & graceful fallbacks
  useEffect(() => {
    let isMounted = true;
    let localScanner: Html5Qrcode | null = null;

    const cleanupScanner = async () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (e) {
          console.warn("[Camera] Cleanup notice:", e);
        }
        scannerRef.current = null;
      }
    };

    const startCamera = async () => {
      if (!showScanner || inputMode !== "camera") return;
      if (isStartingRef.current) return;
      isStartingRef.current = true;

      setCameraError(null);
      setScanningActive(false);

      // Clean up previous instance cleanly
      await cleanupScanner();

      // Wait a moment for React DOM insertion of #reader
      await new Promise((r) => setTimeout(r, 200));
      if (!isMounted) {
        isStartingRef.current = false;
        return;
      }

      const readerElem = document.getElementById("reader");
      if (!readerElem) {
        isStartingRef.current = false;
        return;
      }
      readerElem.innerHTML = "";

      try {
        // 1. Check navigator mediaDevices support
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error("MEDIA_DEVICES_NOT_SUPPORTED");
        }

        // 2. Preflight permission request
        let probeStream: MediaStream | null = null;
        try {
          probeStream = await navigator.mediaDevices.getUserMedia({
            video: selectedCameraId
              ? { deviceId: { exact: selectedCameraId } }
              : { facingMode: { ideal: "environment" } }
          });
        } catch (pErr1) {
          // If ideal environment fails (common on PC webcams), try generic video permission
          try {
            probeStream = await navigator.mediaDevices.getUserMedia({ video: true });
          } catch (pErr2: any) {
            throw pErr2; // Rethrow actual permission or device error
          }
        }

        // Stop probe tracks immediately so the video device is released
        if (probeStream) {
          probeStream.getTracks().forEach((track) => track.stop());
        }

        if (!isMounted) {
          isStartingRef.current = false;
          return;
        }

        // 3. Enumerate cameras (labels will now be available because permission was granted)
        let cameraList: Array<{ id: string; label: string }> = [];
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            cameraList = devices.map((d, index) => ({
              id: d.id,
              label: d.label || `Camera ${index + 1}`
            }));
            setAvailableCameras(cameraList);
          }
        } catch (enumErr) {
          console.log("[Camera] getCameras enumeration fallback:", enumErr);
        }

        // 4. Select target camera
        let targetCamera: any;
        if (selectedCameraId && cameraList.some((c) => c.id === selectedCameraId)) {
          targetCamera = selectedCameraId;
        } else if (cameraList.length > 0) {
          const backCam = cameraList.find((c) =>
            /back|rear|environment|primary/i.test(c.label)
          );
          targetCamera = backCam ? backCam.id : cameraList[0].id;
        } else {
          targetCamera = { facingMode: "environment" };
        }

        // 5. Initialize Html5Qrcode instance
        localScanner = new Html5Qrcode("reader", { verbose: false });
        scannerRef.current = localScanner;

        const scanConfig = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.max(Math.floor(minEdge * 0.72), 180);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0,
          disableFlip: false
        };

        const onScanSuccess = (decodedText: string) => {
          if (isMounted) {
            executeScan(decodedText);
          }
        };

        // 6. Launch camera scanner
        try {
          await localScanner.start(targetCamera, scanConfig, onScanSuccess, () => {});
        } catch (camStartErr) {
          console.warn("[Camera] Primary target start failed, trying front/default camera fallback:", camStartErr);
          await cleanupScanner();
          if (!isMounted) return;

          const retryElem = document.getElementById("reader");
          if (retryElem) retryElem.innerHTML = "";

          localScanner = new Html5Qrcode("reader", { verbose: false });
          scannerRef.current = localScanner;
          await localScanner.start({ facingMode: "user" }, scanConfig, onScanSuccess, () => {});
        }

        if (isMounted) {
          setScanningActive(true);
          setCameraError(null);
        }
      } catch (err: any) {
        console.error("[Camera] Error:", err);
        if (isMounted) {
          setScanningActive(false);
          const errName = err?.name || "";
          const errMsg = err?.message || String(err);

          if (
            errName === "NotAllowedError" ||
            errName === "PermissionDeniedError" ||
            errMsg.includes("Permission") ||
            errMsg.includes("denied")
          ) {
            setCameraError(
              "Camera permission blocked. Please click the lock 🔒 or camera icon in your browser address bar and choose 'Allow', then click Retry Camera."
            );
          } else if (
            errName === "NotReadableError" ||
            errName === "TrackStartError" ||
            errMsg.includes("Could not start video source")
          ) {
            setCameraError(
              "Camera is currently in use by another app (Zoom, Teams, or another tab). Please close other apps and click Retry Camera."
            );
          } else if (
            errName === "NotFoundError" ||
            errName === "DevicesNotFoundError" ||
            errMsg.includes("device not found")
          ) {
            setCameraError(
              "No camera device detected on this system. Please use Image Upload or Manual Token verification."
            );
          } else if (errMsg === "MEDIA_DEVICES_NOT_SUPPORTED" || errName === "SecurityError") {
            setCameraError(
              "Camera access requires a secure context (HTTPS or localhost). Please open this portal on http://localhost:3000."
            );
          } else {
            setCameraError(
              `Camera initialization error (${errMsg || "feed unavailable"}). You can switch to Image Upload or Manual Token below.`
            );
          }
        }
      } finally {
        isStartingRef.current = false;
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      cleanupScanner();
    };
  }, [showScanner, inputMode, selectedCameraId, cameraRetryCount]);

  // Image Upload Scanner with graceful headless decoding & fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let tempElem = document.getElementById("file-reader-temp");
      if (!tempElem) {
        tempElem = document.createElement("div");
        tempElem.id = "file-reader-temp";
        tempElem.style.display = "none";
        document.body.appendChild(tempElem);
      }
      const html5Qrcode = new Html5Qrcode("file-reader-temp");
      // Use showImage=false so it operates purely in memory without DOM element layout issues
      const decodedText = await html5Qrcode.scanFile(file, false);
      html5Qrcode.clear();
      executeScan(decodedText);
    } catch (err) {
      playSound("error");
      setToastNotification({
        type: "error",
        message: "🔴 Could not decode QR code from uploaded image. Please ensure image has clear contrast."
      });
    } finally {
      e.target.value = "";
    }
  };

  // Helper to extract scan status for a member
  const getMemberScan = (team: TeamData, member: Member) => {
    const scans = team.attendance?.studentScans || {};
    const key = toScanKey(member.userId || member.email);
    return (
      scans[key] ||
      (member.userId ? scans[member.userId] : undefined) ||
      (member.email ? scans[member.email] : undefined) ||
      {}
    );
  };

  // Manual Attendance & Meal Toggle
  const toggleAttendanceStatus = async (
    teamId: string,
    field: "present" | "lunch" | "snacks",
    currentValue: boolean,
    userId?: string
  ) => {
    const newValue = !currentValue;
    const nowTimeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    setTeams((prev) =>
      prev.map((t) => {
        if (t.teamId === teamId) {
          if (userId) {
            const scanKey = toScanKey(userId);
            const currentScans = t.attendance?.studentScans || {};
            const currentMemberScan =
              currentScans[scanKey] || currentScans[userId] || {};

            const updatedMemberScan = {
              ...currentMemberScan,
              userId,
              [field]: newValue,
              [`${field}Time`]: newValue ? nowTimeStr : undefined
            };

            const updatedStudentScans = {
              ...currentScans,
              [scanKey]: updatedMemberScan,
              [userId]: updatedMemberScan
            };

            // Check if any member is present
            const anyPresent =
              field === "present"
                ? newValue || Object.values(updatedStudentScans).some((s) => s?.present)
                : t.attendance?.present;

            const anyLunch =
              field === "lunch"
                ? newValue || Object.values(updatedStudentScans).some((s) => s?.lunch)
                : t.attendance?.lunch;

            const anySnacks =
              field === "snacks"
                ? newValue || Object.values(updatedStudentScans).some((s) => s?.snacks)
                : t.attendance?.snacks;

            return {
              ...t,
              attendance: {
                ...t.attendance,
                present: anyPresent,
                lunch: anyLunch,
                snacks: anySnacks,
                studentScans: updatedStudentScans
              }
            };
          } else {
            // Team-level toggle
            return {
              ...t,
              attendance: {
                ...t.attendance,
                [field]: newValue
              }
            };
          }
        }
        return t;
      })
    );

    try {
      await fetch(`${config.API_URL}/manager/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, field, value: newValue, userId })
      });
    } catch (e) {
      fetchTeams();
    }
  };

  // On-spot Team Registration Submit
  const handleOnSpotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${config.API_URL}/manager/team/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: onSpotData.teamName,
          event: { id: "evt-spot", title: onSpotData.eventTitle },
          college: onSpotData.college,
          department: onSpotData.department,
          leaderName: onSpotData.leaderName,
          leaderPhone: onSpotData.leaderPhone,
          leaderEmail: onSpotData.leaderEmail,
          members: onSpotData.members.filter(m => m.name.trim())
        })
      });
      const data = await safeJsonResponse(res);
      if (data && data.success) {
        playSound("success");
        setShowOnSpotModal(false);
        setOnSpotData({
          teamName: "",
          eventTitle: "Algorithmic Duel (Speed Coding)",
          college: "",
          department: "",
          leaderName: "",
          leaderPhone: "",
          leaderEmail: "",
          members: [{ name: "", phone: "" }]
        });
        fetchTeams();
      } else {
        alert(data?.error || "Failed to create walk-in team");
      }
    } catch (e) {
      alert("Error submitting walk-in registration");
    }
  };

  // Team Save Changes (Protected)
  const handleSaveTeamEdit = async () => {
    if (!editFormData) return;

    triggerProtectedAction("Confirm Team Details Update", async () => {
      try {
        const res = await fetch(`${config.API_URL}/manager/team/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData)
        });
        const data = await safeJsonResponse(res);
        if (data && data.success) {
          playSound("success");
          setEditingTeam(null);
          setEditFormData(null);
          fetchTeams();
        } else {
          alert(data?.error || "Failed to update team");
        }
      } catch (e) {
        alert("Error updating team");
      }
    });
  };

  // Delete Team (Protected)
  const handleDeleteTeam = (teamId: string, teamName: string) => {
    triggerProtectedAction(`Delete Team "${teamName}" Permanently`, async () => {
      try {
        const res = await fetch(`${config.API_URL}/manager/team/${encodeURIComponent(teamId)}`, {
          method: "DELETE"
        });
        const data = await safeJsonResponse(res);
        if (data && data.success) {
          playSound("success");
          fetchTeams();
        } else {
          alert(data?.error || "Failed to delete team");
        }
      } catch (e) {
        alert("Error deleting team");
      }
    });
  };

  // HD Canvas Pass Synthesizer (600x740px)
  const generatePassCanvas = async (team: TeamData, member: Member): Promise<string> => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 740;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Dark Neon Background Fill
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 740);
    bgGrad.addColorStop(0, "#08100b");
    bgGrad.addColorStop(0.5, "#0b1c13");
    bgGrad.addColorStop(1, "#050806");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 740);

    // Outer Neon Border
    ctx.strokeStyle = "#39ff88";
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, 576, 716);

    // Inner Accent Border
    ctx.strokeStyle = "rgba(57, 255, 136, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, 560, 700);

    // Header Glow Banner
    ctx.fillStyle = "rgba(57, 255, 136, 0.15)";
    ctx.fillRect(20, 20, 560, 80);
    ctx.fillStyle = "#39ff88";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText("NEURA 2026 — OFFICIAL PASS", 300, 65);

    // Event Title Badge
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(team.event?.title || "AIDEX 2026 SYMPOSIUM", 300, 135);

    // Participant & Team Details
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(191, 200, 195, 0.7)";
    ctx.font = "14px monospace";
    ctx.fillText("PARTICIPANT NAME", 50, 195);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px monospace";
    ctx.fillText(member.name.toUpperCase(), 50, 225);

    ctx.fillStyle = "rgba(191, 200, 195, 0.7)";
    ctx.font = "14px monospace";
    ctx.fillText("TEAM NAME", 50, 275);
    ctx.fillStyle = "#39ff88";
    ctx.font = "bold 20px monospace";
    ctx.fillText(team.teamName, 50, 305);

    ctx.fillStyle = "rgba(191, 200, 195, 0.7)";
    ctx.font = "14px monospace";
    ctx.fillText("COLLEGE / DEPT", 50, 355);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px sans-serif";
    ctx.fillText(`${team.college} (${team.department})`, 50, 385);

    ctx.fillStyle = "rgba(191, 200, 195, 0.7)";
    ctx.font = "14px monospace";
    ctx.fillText("USER ID / ROLE", 50, 435);
    ctx.fillStyle = "#39ff88";
    ctx.font = "bold 18px monospace";
    ctx.fillText(`${member.userId} — ${member.role || "Member"}`, 50, 465);

    // Solid White QR Container Plate with Quiet Zone (Crucial for optical scanner recognition)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(190, 490, 220, 200, 12);
    ctx.fill();

    // Subtle neon border around the white plate
    ctx.strokeStyle = "rgba(57, 255, 136, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Render High-Contrast QR Code centered onto Canvas
    const qrToken = member.qrToken || `QR-${member.userId}-${team.teamId}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(qrToken, {
        width: 180,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#000000", light: "#ffffff" }
      });
      const img = new Image();
      img.src = qrDataUrl;
      await new Promise((res) => { img.onload = res; });
      ctx.drawImage(img, 210, 500, 180, 180);
    } catch (e) {
      ctx.fillStyle = "#000000";
      ctx.font = "12px monospace";
      ctx.fillText("QR CODE ERROR", 300, 590);
    }

    // Footer Text
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(57, 255, 136, 0.7)";
    ctx.font = "11px monospace";
    ctx.fillText(`TOKEN: ${qrToken}`, 300, 718);

    return canvas.toDataURL("image/png");
  };

  // Download Individual Pass Image
  const downloadSinglePass = async (team: TeamData, member: Member) => {
    const dataUrl = await generatePassCanvas(team, member);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `NEURA_2026_Pass_${member.userId}_${member.name.replace(/\s+/g, "_")}.png`;
    link.click();
  };

  // Bulk ZIP Pass Exporter
  const handleExportBatchZip = async () => {
    setGeneratingBatch(true);
    try {
      const zip = new JSZip();
      const filteredTeams = teams.filter(t => batchEventFilter === "ALL" || t.event?.title === batchEventFilter);

      for (const t of filteredTeams) {
        const teamFolder = zip.folder(`${t.teamId}_${t.teamName.replace(/\s+/g, "_")}`);
        for (const m of t.allMembers) {
          const dataUrl = await generatePassCanvas(t, m);
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          teamFolder?.file(`Pass_${m.userId}_${m.name.replace(/\s+/g, "_")}.png`, base64Data, { base64: true });
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `NEURA_2026_Passes_${batchEventFilter.replace(/\s+/g, "_")}.zip`;
      link.click();
      setShowBatchModal(false);
    } catch (e) {
      alert("Error exporting batch ZIP");
    } finally {
      setGeneratingBatch(false);
    }
  };

  // Flattened Operatives for Member View
  const allOperatives = teams.flatMap((team) =>
    team.allMembers.map((member) => {
      const scan = getMemberScan(team, member);
      return {
        member,
        team,
        scan,
        teamId: team.teamId,
        teamName: team.teamName,
        eventTitle: team.event?.title || "Event",
        college: team.college || member.college || "N/A",
        department: team.department || member.department || "N/A"
      };
    })
  );

  // Filter Roster
  const uniqueEvents = Array.from(new Set(teams.map((r) => r.event?.title))).filter(Boolean);

  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.teamName?.toLowerCase().includes(q) ||
      t.teamId?.toLowerCase().includes(q) ||
      t.college?.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q) ||
      t.allMembers.some(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.userId?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.phone?.includes(q) ||
          m.barcode?.toLowerCase().includes(q)
      );

    const matchesEvent = selectedEvent === "ALL" || t.event?.title === selectedEvent;

    const matchesAttendance =
      attendanceFilter === "ALL" ||
      (attendanceFilter === "ATTENDED" && (t.attendance?.present || t.allMembers.some((m) => getMemberScan(t, m)?.present))) ||
      (attendanceFilter === "ABSENT" && !t.attendance?.present && !t.allMembers.some((m) => getMemberScan(t, m)?.present)) ||
      (attendanceFilter === "LUNCH" && (t.attendance?.lunch || t.allMembers.some((m) => getMemberScan(t, m)?.lunch))) ||
      (attendanceFilter === "SNACKS" && (t.attendance?.snacks || t.allMembers.some((m) => getMemberScan(t, m)?.snacks)));

    return matchesSearch && matchesEvent && matchesAttendance;
  });

  const filteredOperatives = allOperatives.filter((op) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      op.member.name?.toLowerCase().includes(q) ||
      op.member.userId?.toLowerCase().includes(q) ||
      op.member.email?.toLowerCase().includes(q) ||
      op.member.phone?.includes(q) ||
      op.member.barcode?.toLowerCase().includes(q) ||
      op.teamName?.toLowerCase().includes(q) ||
      op.teamId?.toLowerCase().includes(q) ||
      op.college?.toLowerCase().includes(q) ||
      op.department?.toLowerCase().includes(q);

    const matchesEvent = selectedEvent === "ALL" || op.eventTitle === selectedEvent;

    const matchesAttendance =
      attendanceFilter === "ALL" ||
      (attendanceFilter === "ATTENDED" && (op.scan?.present || op.team.attendance?.present)) ||
      (attendanceFilter === "ABSENT" && !op.scan?.present && !op.team.attendance?.present) ||
      (attendanceFilter === "LUNCH" && (op.scan?.lunch || op.team.attendance?.lunch)) ||
      (attendanceFilter === "SNACKS" && (op.scan?.snacks || op.team.attendance?.snacks));

    return matchesSearch && matchesEvent && matchesAttendance;
  });

  // Calculate Statistics
  const totalTeams = teams.length;
  const totalParticipants = allOperatives.length;
  const attendedOperatives = allOperatives.filter((o) => o.scan?.present || o.team.attendance?.present).length;
  const attendedTeams = teams.filter((t) => t.attendance?.present || t.allMembers.some((m) => getMemberScan(t, m)?.present)).length;
  const lunchClaimedOperatives = allOperatives.filter((o) => o.scan?.lunch || o.team.attendance?.lunch).length;
  const snacksClaimedOperatives = allOperatives.filter((o) => o.scan?.snacks || o.team.attendance?.snacks).length;

  // CSV Data Exporter
  const exportRosterCSV = () => {
    if (viewMode === "member") {
      const headers = [
        "Participant Name",
        "Role",
        "Email / User ID",
        "Phone",
        "Squad Name",
        "Team ID",
        "Event",
        "College",
        "Department",
        "Attendance Status",
        "Check-in Time",
        "Lunch Claimed",
        "Lunch Time",
        "Snacks Claimed",
        "Snacks Time",
        "Barcode ID",
        "QR Token"
      ];

      const rows = filteredOperatives.map((op) => [
        `"${op.member.name.replace(/"/g, '""')}"`,
        `"${op.member.role || "Member"}"`,
        `"${(op.member.email || op.member.userId || "").replace(/"/g, '""')}"`,
        `"${op.member.phone || "N/A"}"`,
        `"${op.teamName.replace(/"/g, '""')}"`,
        `"${op.teamId}"`,
        `"${op.eventTitle.replace(/"/g, '""')}"`,
        `"${op.college.replace(/"/g, '""')}"`,
        `"${op.department.replace(/"/g, '""')}"`,
        op.scan?.present || op.team.attendance?.present ? "Present" : "Absent",
        `"${op.scan?.presentTime || ""}"`,
        op.scan?.lunch || op.team.attendance?.lunch ? "Claimed" : "Unclaimed",
        `"${op.scan?.lunchTime || ""}"`,
        op.scan?.snacks || op.team.attendance?.snacks ? "Claimed" : "Unclaimed",
        `"${op.scan?.snacksTime || ""}"`,
        `"${op.member.barcode || ""}"`,
        `"${op.member.qrToken || ""}"`
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `NEURA_2026_Individual_Operatives_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        "Team ID",
        "Team Name",
        "Event",
        "College",
        "Department",
        "Leader Name",
        "Leader Phone",
        "Leader Email",
        "Member Count",
        "Attendance Status",
        "Lunch Claimed",
        "Snacks Claimed"
      ];

      const rows = filteredTeams.map((t) => [
        `"${t.teamId}"`,
        `"${t.teamName.replace(/"/g, '""')}"`,
        `"${(t.event?.title || "Event").replace(/"/g, '""')}"`,
        `"${t.college.replace(/"/g, '""')}"`,
        `"${t.department.replace(/"/g, '""')}"`,
        `"${t.teamLeader?.name || "N/A"}"`,
        `"${t.teamLeader?.phone || "N/A"}"`,
        `"${t.teamLeader?.email || "N/A"}"`,
        t.allMembers.length,
        t.attendance?.present ? "Present" : "Absent",
        t.attendance?.lunch ? "Claimed" : "Unclaimed",
        t.attendance?.snacks ? "Claimed" : "Unclaimed"
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `NEURA_2026_Team_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="min-h-screen bg-[#050806] text-white font-sans selection:bg-[#39ff88] selection:text-black">
      <Header />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Title & Portal Badge */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#08100b] border border-[#39ff88]/30 mb-3 shadow-[0_0_15px_rgba(57,255,136,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse" />
            <span className="font-mono text-xs text-[#39ff88] tracking-widest uppercase">
              NEURA 2026 // MANAGER CONSOLE
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-orbitron tracking-wider text-white mb-2">
            OPERATIONS & SCANNER DESK
          </h1>
          <p className="text-gray-400 font-mono text-sm max-w-2xl mx-auto">
            Triple-mode individual QR scanner, dual team/member attendance roster, live meal tokens, on-spot registrations, and HD pass generator.
          </p>
        </div>

        {/* AUTH SHIELD */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-[#0e1b14] border border-[#39ff88]/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(57,255,136,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#39ff88] to-transparent" />
            <div className="text-center mb-6">
              <FaLock className="mx-auto text-[#39ff88] text-4xl mb-3" />
              <h2 className="font-orbitron font-bold text-xl text-white">MANAGER SECURITY ACCESS</h2>
              <p className="text-gray-400 font-mono text-xs mt-1">
                Enter Manager Passphrase: <span className="text-[#39ff88] font-bold bg-[#39ff88]/10 px-2 py-0.5 rounded border border-[#39ff88]/30">manager123</span>
              </p>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter Manager Password (manager123)..."
                  className="w-full bg-[#08100b] border border-[#39ff88]/30 rounded-xl py-3.5 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#39ff88] transition-all"
                  required
                />
              </div>
              {authError && (
                <p className="text-red-400 font-mono text-xs text-center bg-red-950/40 py-2 border border-red-500/30 rounded-lg">
                  {authError}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-[#39ff88] text-black font-orbitron font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#18c96a] shadow-[0_0_20px_rgba(57,255,136,0.3)] transition-all cursor-pointer"
              >
                UNLOCK MANAGER SUITE
              </button>

              <button
                type="button"
                onClick={() => {
                  setPassphrase("manager123");
                  sessionStorage.setItem("neura_manager_auth", "authenticated");
                  setIsAuthenticated(true);
                  fetchTeams();
                }}
                className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-gray-300 hover:text-[#39ff88] hover:border-[#39ff88]/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚡ Auto-fill & Login as Manager</span>
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* KPI STATS DASHBOARD */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-4 text-center">
                <span className="text-gray-400 text-xs font-mono uppercase block mb-1">Squads / Operatives</span>
                <span className="text-2xl font-orbitron font-bold text-white">
                  {totalTeams} <span className="text-xs text-[#39ff88]">({totalParticipants} total)</span>
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Across {uniqueEvents.length} events</span>
              </div>
              <div className="bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-4 text-center">
                <span className="text-[#39ff88] text-xs font-mono uppercase block mb-1">Operative Check-ins</span>
                <span className="text-2xl font-orbitron font-bold text-[#39ff88]">
                  {attendedOperatives} <span className="text-xs text-gray-400">/ {totalParticipants}</span>
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  ({totalParticipants ? Math.round((attendedOperatives / totalParticipants) * 100) : 0}% Present)
                </span>
              </div>
              <div className="bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-4 text-center">
                <span className="text-emerald-400 text-xs font-mono uppercase block mb-1 flex items-center justify-center gap-1">
                  <FaHamburger size={12} /> Lunch Redeemed
                </span>
                <span className="text-2xl font-orbitron font-bold text-emerald-400">
                  {lunchClaimedOperatives} <span className="text-xs text-gray-400">/ {totalParticipants}</span>
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  ({totalParticipants - lunchClaimedOperatives} Remaining)
                </span>
              </div>
              <div className="bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-4 text-center">
                <span className="text-amber-400 text-xs font-mono uppercase block mb-1 flex items-center justify-center gap-1">
                  <FaCoffee size={12} /> Snacks Redeemed
                </span>
                <span className="text-2xl font-orbitron font-bold text-amber-400">
                  {snacksClaimedOperatives} <span className="text-xs text-gray-400">/ {totalParticipants}</span>
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  ({totalParticipants - snacksClaimedOperatives} Remaining)
                </span>
              </div>
              <div className="bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-4 text-center col-span-2 md:col-span-1 flex flex-col justify-center gap-2">
                <button
                  onClick={() => setShowOnSpotModal(true)}
                  className="w-full bg-[#39ff88] text-black font-bold font-mono text-xs py-2 px-3 rounded-lg hover:bg-[#18c96a] transition-all flex items-center justify-center gap-1.5"
                >
                  <FaUserPlus size={12} /> Walk-in Reg
                </button>
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="w-full bg-[#08100b] border border-[#39ff88]/40 text-[#39ff88] hover:bg-[#39ff88]/10 font-bold font-mono text-xs py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <FaIdCard size={12} /> Batch HD Passes
                </button>
              </div>
            </div>

            {/* ACTION & SCANNER LAUNCH BAR */}
            <div className="bg-[#0e1b14] border border-[#39ff88]/30 rounded-2xl p-5 mb-8 space-y-4 shadow-[0_0_30px_rgba(57,255,136,0.1)]">
              {/* TOP ROW: SCANNER BUTTON & VIEW SWITCHER */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowScanner(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#18c96a] to-[#39ff88] text-black font-orbitron font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(57,255,136,0.4)] hover:scale-[1.02] transition-transform flex items-center gap-2"
                  >
                    <FaQrcode size={18} /> OPEN QR SCANNER DESK
                  </button>
                  <button
                    onClick={exportRosterCSV}
                    className="px-4 py-3 bg-[#08100b] border border-[#39ff88]/30 text-[#39ff88] hover:bg-[#39ff88]/10 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-2"
                    title={viewMode === "member" ? "Export Individual Operatives CSV" : "Export Squad Roster CSV"}
                  >
                    <FaFileCsv size={16} /> Export {viewMode === "member" ? "Operatives CSV" : "Squad CSV"}
                  </button>
                </div>

                {/* VIEW MODE TOGGLE SWITCH (TEAM VS INDIVIDUAL) */}
                <div className="flex bg-[#08100b] border border-[#39ff88]/30 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setViewMode("team")}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                      viewMode === "team"
                        ? "bg-[#39ff88] text-black shadow-[0_0_12px_rgba(57,255,136,0.4)]"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <FaUsers size={14} /> Team Roster View
                  </button>
                  <button
                    onClick={() => setViewMode("member")}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                      viewMode === "member"
                        ? "bg-[#39ff88] text-black shadow-[0_0_12px_rgba(57,255,136,0.4)]"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <FaUserCheck size={14} /> Individual Operatives View
                  </button>
                </div>
              </div>

              {/* BOTTOM ROW: SEARCH & STATUS/EVENT FILTERS */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5">
                <div className="relative flex-1 min-w-[220px]">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      viewMode === "member"
                        ? "Search by Operative Name, Email, Barcode, Phone, Team ID..."
                        : "Search Squad Name, Team ID, Leader, College..."
                    }
                    className="w-full bg-[#08100b] border border-[#39ff88]/20 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#39ff88]"
                  />
                </div>

                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="bg-[#08100b] border border-[#39ff88]/20 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#39ff88]"
                >
                  <option value="ALL">All Events ({uniqueEvents.length})</option>
                  {uniqueEvents.map((evt) => (
                    <option key={evt} value={evt}>
                      {evt}
                    </option>
                  ))}
                </select>

                <select
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value as any)}
                  className="bg-[#08100b] border border-[#39ff88]/20 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#39ff88]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ATTENDED">Attended / Present</option>
                  <option value="ABSENT">Absent / Pending</option>
                  <option value="LUNCH">Lunch Claimed</option>
                  <option value="SNACKS">Snacks Claimed</option>
                </select>

                <button
                  onClick={fetchTeams}
                  className="p-2.5 bg-[#08100b] border border-[#39ff88]/20 text-[#39ff88] hover:bg-[#39ff88]/10 rounded-xl transition-all"
                  title="Refresh Data"
                >
                  <FaSyncAlt className={loading ? "animate-spin" : ""} size={14} />
                </button>
              </div>
            </div>

            {/* ROSTER CONTENT VIEW (TEAM ACCORDION VS INDIVIDUAL OPERATIVES) */}
            {loading ? (
              <div className="text-center py-16">
                <FaSyncAlt className="animate-spin text-3xl text-[#39ff88] mx-auto mb-3" />
                <p className="font-mono text-sm text-gray-400">Loading manager registry & scan states...</p>
              </div>
            ) : viewMode === "team" ? (
              /* ================= TEAM ROSTER VIEW ================= */
              filteredTeams.length === 0 ? (
                <div className="bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-12 text-center text-gray-400 font-mono">
                  No matching teams found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTeams.map((team, tIdx) => {
                    const isExpanded = expandedTeamId === team.teamId;
                    const uniqueTeamKey = team._id ? `team-${team._id}` : `team-${team.teamId || tIdx}-${tIdx}`;
                    const checkedInCount = team.allMembers.filter((m) => getMemberScan(team, m)?.present).length;
                    const lunchCount = team.allMembers.filter((m) => getMemberScan(team, m)?.lunch).length;
                    const snacksCount = team.allMembers.filter((m) => getMemberScan(team, m)?.snacks).length;

                    return (
                      <div
                        key={uniqueTeamKey}
                        className={`bg-[#0e1b14] border rounded-2xl transition-all overflow-hidden ${
                          team.attendance?.present || checkedInCount > 0
                            ? "border-[#39ff88]/40 shadow-[0_0_20px_rgba(57,255,136,0.05)]"
                            : "border-gray-800"
                        }`}
                      >
                        {/* ACCORDION HEADER */}
                        <div
                          onClick={() => setExpandedTeamId(isExpanded ? null : team.teamId)}
                          className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#12241b] transition-colors"
                        >
                          {/* Left Info */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-orbitron font-bold text-lg text-white">
                                {team.teamName}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#39ff88]/10 text-[#39ff88] border border-[#39ff88]/30 font-bold">
                                {team.teamId}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/5 text-gray-300">
                                {team.event?.title || "Event"}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/10 text-gray-300">
                                👥 {checkedInCount}/{team.allMembers.length} Check-in
                              </span>
                            </div>
                            <div className="text-xs font-mono text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                              <span>
                                Leader: <strong className="text-white">{team.teamLeader?.name}</strong> (
                                {team.teamLeader?.phone || "N/A"})
                              </span>
                              <span>
                                College: <strong className="text-gray-200">{team.college}</strong>
                              </span>
                              <span>
                                Dept: <strong className="text-gray-200">{team.department}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Right Quick Badges & Controls */}
                          <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Squad-level Attendance Toggle */}
                            <button
                              onClick={() =>
                                toggleAttendanceStatus(team.teamId, "present", team.attendance?.present)
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                                team.attendance?.present
                                  ? "bg-[#39ff88] text-black shadow-[0_0_10px_rgba(57,255,136,0.3)]"
                                  : "bg-[#08100b] border border-gray-700 text-gray-400 hover:border-[#39ff88]"
                              }`}
                              title="Toggle Entire Squad Attendance"
                            >
                              {team.attendance?.present ? (
                                <>
                                  <FaCheckCircle /> SQUAD PRESENT
                                </>
                              ) : (
                                <>
                                  <FaTimesCircle /> SQUAD ABSENT
                                </>
                              )}
                            </button>

                            {/* Squad-level Meal Toggles */}
                            <button
                              onClick={() => toggleAttendanceStatus(team.teamId, "lunch", team.attendance?.lunch)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 border transition-all ${
                                team.attendance?.lunch
                                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                                  : "bg-[#08100b] border-gray-800 text-gray-500 hover:text-emerald-400"
                              }`}
                              title={`Squad Lunch (${lunchCount}/${team.allMembers.length} members claimed)`}
                            >
                              <FaHamburger size={12} /> {team.attendance?.lunch ? "Lunch ✓" : "Lunch"}
                            </button>

                            <button
                              onClick={() =>
                                toggleAttendanceStatus(team.teamId, "snacks", team.attendance?.snacks)
                              }
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 border transition-all ${
                                team.attendance?.snacks
                                  ? "bg-amber-500/20 border-amber-500 text-amber-400 font-bold"
                                  : "bg-[#08100b] border-gray-800 text-gray-500 hover:text-amber-400"
                              }`}
                              title={`Squad Snacks (${snacksCount}/${team.allMembers.length} members claimed)`}
                            >
                              <FaCoffee size={12} /> {team.attendance?.snacks ? "Snacks ✓" : "Snacks"}
                            </button>

                            {/* Edit / Delete Buttons */}
                            <button
                              onClick={() => {
                                setEditingTeam(team);
                                setEditFormData(JSON.parse(JSON.stringify(team)));
                              }}
                              className="p-2 bg-[#08100b] border border-white/10 hover:border-[#39ff88] text-gray-300 hover:text-[#39ff88] rounded-lg transition-colors"
                              title="Edit Team Details"
                            >
                              <FaEdit size={13} />
                            </button>

                            <button
                              onClick={() => handleDeleteTeam(team.teamId, team.teamName)}
                              className="p-2 bg-[#08100b] border border-white/10 hover:border-red-500 text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                              title="Delete Team"
                            >
                              <FaTrash size={13} />
                            </button>

                            {/* Accordion Expand Icon */}
                            <div className="pl-2 text-gray-400">
                              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                            </div>
                          </div>
                        </div>

                        {/* EXPANDED MEMBER PANEL */}
                        {isExpanded && (
                          <div className="bg-[#08100b] p-5 border-t border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-mono font-bold text-[#39ff88] uppercase tracking-wider">
                                // INDIVIDUAL MEMBER CREDENTIALS & ATTENDANCE ({team.allMembers.length} Operatives)
                              </h4>
                              <span className="text-[11px] font-mono text-gray-400">
                                Click any toggle below to check-in or redeem meals per individual member
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {team.allMembers.map((m, mIdx) => {
                                const scan = getMemberScan(team, m);
                                const isMemberPresent = !!scan.present || !!team.attendance?.present;
                                const isMemberLunch = !!scan.lunch || !!team.attendance?.lunch;
                                const isMemberSnacks = !!scan.snacks || !!team.attendance?.snacks;
                                const uniqueMemberKey = `member-${team._id || team.teamId}-${m.userId || mIdx}-${mIdx}`;

                                return (
                                  <div
                                    key={uniqueMemberKey}
                                    className={`bg-[#0e1b14] border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all ${
                                      isMemberPresent
                                        ? "border-[#39ff88]/30 shadow-[0_0_15px_rgba(57,255,136,0.03)]"
                                        : "border-white/10"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-white font-mono text-sm">{m.name}</span>
                                          <span
                                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                              m.role === "Leader"
                                                ? "bg-[#39ff88]/15 text-[#39ff88] border border-[#39ff88]/40"
                                                : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                                            }`}
                                          >
                                            {m.role || "Member"}
                                          </span>
                                        </div>
                                        <p className="text-xs font-mono text-gray-400 mt-1">
                                          Email / User ID:{" "}
                                          <code className="text-[#39ff88] font-bold">{m.email || m.userId}</code>
                                        </p>
                                        {m.phone && (
                                          <p className="text-[11px] font-mono text-gray-400">Phone: {m.phone}</p>
                                        )}
                                        {m.barcode && (
                                          <p className="text-[10px] font-mono text-gray-500">
                                            Barcode: <code className="text-gray-300">{m.barcode}</code>
                                          </p>
                                        )}
                                      </div>

                                      <button
                                        onClick={() => downloadSinglePass(team, m)}
                                        className="px-2.5 py-1.5 bg-[#39ff88]/10 hover:bg-[#39ff88] text-[#39ff88] hover:text-black font-mono text-[10px] font-bold rounded-lg border border-[#39ff88]/30 transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                                        title="Download HD Pass Card"
                                      >
                                        <FaDownload size={10} /> HD Pass
                                      </button>
                                    </div>

                                    {/* Individual Member Interactive Action Controls */}
                                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                                      {/* Individual Present Toggle */}
                                      <button
                                        onClick={() =>
                                          toggleAttendanceStatus(
                                            team.teamId,
                                            "present",
                                            !!scan.present,
                                            m.userId || m.email
                                          )
                                        }
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1 transition-all ${
                                          scan.present
                                            ? "bg-[#39ff88] text-black"
                                            : "bg-[#08100b] border border-gray-700 text-gray-400 hover:border-[#39ff88]"
                                        }`}
                                      >
                                        {scan.present ? (
                                          <>✓ Present {scan.presentTime ? `(${scan.presentTime})` : ""}</>
                                        ) : (
                                          <>○ Mark Present</>
                                        )}
                                      </button>

                                      {/* Individual Lunch Toggle */}
                                      <button
                                        onClick={() =>
                                          toggleAttendanceStatus(
                                            team.teamId,
                                            "lunch",
                                            !!scan.lunch,
                                            m.userId || m.email
                                          )
                                        }
                                        className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 border transition-all ${
                                          scan.lunch
                                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                                            : "bg-[#08100b] border-gray-800 text-gray-500 hover:text-emerald-400"
                                        }`}
                                      >
                                        <FaHamburger size={10} />{" "}
                                        {scan.lunch
                                          ? `Lunch ✓ ${scan.lunchTime ? `(${scan.lunchTime})` : ""}`
                                          : "Lunch"}
                                      </button>

                                      {/* Individual Snacks Toggle */}
                                      <button
                                        onClick={() =>
                                          toggleAttendanceStatus(
                                            team.teamId,
                                            "snacks",
                                            !!scan.snacks,
                                            m.userId || m.email
                                          )
                                        }
                                        className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 border transition-all ${
                                          scan.snacks
                                            ? "bg-amber-500/20 border-amber-500 text-amber-400 font-bold"
                                            : "bg-[#08100b] border-gray-800 text-gray-500 hover:text-amber-400"
                                        }`}
                                      >
                                        <FaCoffee size={10} />{" "}
                                        {scan.snacks
                                          ? `Snacks ✓ ${scan.snacksTime ? `(${scan.snacksTime})` : ""}`
                                          : "Snacks"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* ================= INDIVIDUAL OPERATIVES VIEW ================= */
              filteredOperatives.length === 0 ? (
                <div className="bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-12 text-center text-gray-400 font-mono">
                  No matching operatives found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOperatives.map((op, oIdx) => {
                    const scan = op.scan;
                    const isCheckedIn = !!scan.present || !!op.team.attendance?.present;
                    const isLunchClaimed = !!scan.lunch || !!op.team.attendance?.lunch;
                    const isSnacksClaimed = !!scan.snacks || !!op.team.attendance?.snacks;
                    const uniqueOpKey = `op-${op.teamId}-${op.member.userId || oIdx}-${oIdx}`;

                    return (
                      <div
                        key={uniqueOpKey}
                        className={`bg-[#0e1b14] border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all ${
                          isCheckedIn
                            ? "border-[#39ff88]/40 shadow-[0_0_20px_rgba(57,255,136,0.08)] bg-gradient-to-b from-[#0e1b14] to-[#08100b]"
                            : "border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        {/* TOP: Name, Role Badge, HD Pass button */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-orbitron font-bold text-white text-base">
                                {op.member.name}
                              </h3>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                  op.member.role === "Leader"
                                    ? "bg-[#39ff88]/20 text-[#39ff88] border border-[#39ff88]/40"
                                    : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                }`}
                              >
                                {op.member.role || "Member"}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-[#39ff88] font-bold mt-1">
                              {op.member.email || op.member.userId}
                            </p>
                          </div>

                          <button
                            onClick={() => downloadSinglePass(op.team, op.member)}
                            className="p-2 bg-[#39ff88]/10 hover:bg-[#39ff88] text-[#39ff88] hover:text-black rounded-lg border border-[#39ff88]/30 transition-colors"
                            title="Download Pass"
                          >
                            <FaDownload size={12} />
                          </button>
                        </div>

                        {/* MIDDLE: Squad & Event Info */}
                        <div className="space-y-1.5 text-xs font-mono bg-[#08100b] p-3 rounded-xl border border-white/5">
                          <div className="flex items-center justify-between text-gray-300">
                            <span className="text-gray-500">Squad:</span>
                            <span className="font-bold text-white truncate max-w-[170px]">
                              {op.teamName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-gray-300">
                            <span className="text-gray-500">Team ID:</span>
                            <span className="text-[#39ff88] font-bold">{op.teamId}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-300">
                            <span className="text-gray-500">Event:</span>
                            <span className="text-gray-200 truncate max-w-[170px]">{op.eventTitle}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-300">
                            <span className="text-gray-500">College:</span>
                            <span className="text-gray-300 truncate max-w-[170px]">{op.college}</span>
                          </div>
                          {op.member.phone && (
                            <div className="flex items-center justify-between text-gray-300">
                              <span className="text-gray-500">Phone:</span>
                              <span className="text-gray-300">{op.member.phone}</span>
                            </div>
                          )}
                          {op.member.barcode && (
                            <div className="flex items-center justify-between text-gray-400 text-[10px]">
                              <span className="text-gray-500">Barcode:</span>
                              <span className="text-gray-300 font-mono">{op.member.barcode}</span>
                            </div>
                          )}
                        </div>

                        {/* BOTTOM: Individual Attendance & Meal Action Toggles */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          {/* Present Toggle */}
                          <button
                            onClick={() =>
                              toggleAttendanceStatus(
                                op.teamId,
                                "present",
                                !!scan.present,
                                op.member.userId || op.member.email
                              )
                            }
                            className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all ${
                              scan.present
                                ? "bg-[#39ff88] text-black shadow-[0_0_12px_rgba(57,255,136,0.3)]"
                                : "bg-[#08100b] border border-gray-700 text-gray-400 hover:border-[#39ff88]"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {scan.present ? <FaCheckCircle /> : <FaTimesCircle />}
                              {scan.present ? "CHECKED IN" : "MARK PRESENT"}
                            </span>
                            <span className="text-[10px] font-normal">
                              {scan.present && scan.presentTime ? scan.presentTime : "Tap to toggle"}
                            </span>
                          </button>

                          {/* Meal Toggles Row */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() =>
                                toggleAttendanceStatus(
                                  op.teamId,
                                  "lunch",
                                  !!scan.lunch,
                                  op.member.userId || op.member.email
                                )
                              }
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-mono flex items-center justify-center gap-1 border transition-all ${
                                scan.lunch
                                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                                  : "bg-[#08100b] border-gray-800 text-gray-500 hover:text-emerald-400"
                              }`}
                            >
                              <FaHamburger size={11} />
                              {scan.lunch ? `Lunch ✓ ${scan.lunchTime || ""}` : "Lunch"}
                            </button>

                            <button
                              onClick={() =>
                                toggleAttendanceStatus(
                                  op.teamId,
                                  "snacks",
                                  !!scan.snacks,
                                  op.member.userId || op.member.email
                                )
                              }
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-mono flex items-center justify-center gap-1 border transition-all ${
                                scan.snacks
                                  ? "bg-amber-500/20 border-amber-500 text-amber-400 font-bold"
                                  : "bg-[#08100b] border-gray-800 text-gray-500 hover:text-amber-400"
                              }`}
                            >
                              <FaCoffee size={11} />
                              {scan.snacks ? `Snacks ✓ ${scan.snacksTime || ""}` : "Snacks"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* TRIPLE-MODE MULTI-INPUT QR SCANNER MODAL */}
      {showScanner && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1510] border border-[#39ff88]/40 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_60px_rgba(57,255,136,0.25)] relative font-mono">
            <button
              onClick={() => {
                setShowScanner(false);
                setToastNotification(null);
                if (scannerRef.current?.isScanning) scannerRef.current.stop();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
            >
              <FaTimes size={18} />
            </button>

            <div className="text-center mb-4">
              <span className="text-[10px] text-[#39ff88] uppercase tracking-widest block mb-1">:: NEURA MULTI-MODE QR DESK ::</span>
              <h3 className="font-orbitron font-bold text-xl text-white">SCAN VERIFICATION DESK</h3>
            </div>

            {/* SCAN MODE SELECTOR */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setScanMode("attendance")}
                className={`py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                  scanMode === "attendance" ? "bg-[#39ff88] text-black shadow-[0_0_15px_rgba(57,255,136,0.4)]" : "bg-[#08100b] border border-gray-800 text-gray-400"
                }`}
              >
                🟢 Attendance
              </button>
              <button
                onClick={() => setScanMode("lunch")}
                className={`py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                  scanMode === "lunch" ? "bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.4)]" : "bg-[#08100b] border border-gray-800 text-gray-400"
                }`}
              >
                🍱 Lunch Pass
              </button>
              <button
                onClick={() => setScanMode("snacks")}
                className={`py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                  scanMode === "snacks" ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]" : "bg-[#08100b] border border-gray-800 text-gray-400"
                }`}
              >
                ☕ Snacks Pass
              </button>
            </div>

            {/* INPUT METHOD SELECTOR */}
            <div className="flex rounded-xl overflow-hidden border border-white/10 mb-4 text-xs">
              <button
                onClick={() => setInputMode("camera")}
                className={`flex-1 py-2 flex items-center justify-center gap-1.5 ${inputMode === "camera" ? "bg-white/15 text-white font-bold" : "text-gray-400"}`}
              >
                <FaCamera /> Live Camera
              </button>
              <button
                onClick={() => setInputMode("upload")}
                className={`flex-1 py-2 flex items-center justify-center gap-1.5 ${inputMode === "upload" ? "bg-white/15 text-white font-bold" : "text-gray-400"}`}
              >
                <FaUpload /> Image Upload
              </button>
              <button
                onClick={() => setInputMode("manual")}
                className={`flex-1 py-2 flex items-center justify-center gap-1.5 ${inputMode === "manual" ? "bg-white/15 text-white font-bold" : "text-gray-400"}`}
              >
                <FaSearch /> Manual Token
              </button>
            </div>

            {/* CAMERA CONTAINER */}
            {inputMode === "camera" && (
              <div className="space-y-2 mb-4">
                {/* Multi-Camera Selector */}
                {availableCameras.length > 1 && (
                  <div className="flex items-center justify-between gap-2 bg-[#050806] border border-[#39ff88]/20 px-3 py-1.5 rounded-lg">
                    <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
                      <FaCamera size={10} className="text-[#39ff88]" /> SELECT CAMERA:
                    </span>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => {
                        setSelectedCameraId(e.target.value);
                        setCameraRetryCount((c) => c + 1);
                      }}
                      className="bg-[#0e1b14] border border-[#39ff88]/30 rounded-md px-2 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-[#39ff88]"
                    >
                      {availableCameras.map((cam) => (
                        <option key={cam.id} value={cam.id}>
                          {cam.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="bg-[#050806] border border-[#39ff88]/30 rounded-xl overflow-hidden relative min-h-[300px] flex flex-col items-center justify-center p-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                  {cameraError && (
                    <div className="w-full text-center p-4 bg-red-950/50 border border-red-500/40 rounded-xl space-y-3 z-20">
                      <p className="text-red-400 font-mono text-xs leading-relaxed">{cameraError}</p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            setCameraError(null);
                            setCameraRetryCount((c) => c + 1);
                          }}
                          className="bg-[#39ff88] text-black font-bold font-mono text-xs py-2 px-3.5 rounded-lg hover:bg-[#18c96a] transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(57,255,136,0.3)]"
                        >
                          <FaSyncAlt size={11} className="animate-spin-once" /> Retry Camera
                        </button>
                        <button
                          onClick={() => setInputMode("upload")}
                          className="bg-white/10 text-white font-mono text-xs py-2 px-3 rounded-lg hover:bg-white/20 transition-all flex items-center gap-1.5"
                        >
                          <FaUpload size={11} /> Use Image Upload
                        </button>
                        <button
                          onClick={() => setInputMode("manual")}
                          className="bg-white/10 text-white font-mono text-xs py-2 px-3 rounded-lg hover:bg-white/20 transition-all flex items-center gap-1.5"
                        >
                          <FaSearch size={11} /> Enter Token Manually
                        </button>
                      </div>
                    </div>
                  )}

                  {!scanningActive && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm z-10 pointer-events-none">
                      <div className="w-8 h-8 rounded-full border-2 border-[#39ff88] border-t-transparent animate-spin" />
                      <span className="text-[11px] text-[#39ff88] font-mono tracking-widest uppercase animate-pulse">
                        Requesting Camera Access...
                      </span>
                    </div>
                  )}

                  {/* Active Scanning Status Badge */}
                  {scanningActive && !cameraError && (
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-[#39ff88]/40 pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-ping" />
                      <span className="text-[9px] font-mono text-[#39ff88] font-bold tracking-wider uppercase">
                        LIVE FEED ACTIVE
                      </span>
                    </div>
                  )}

                  {/* Reader element */}
                  <div
                    id="reader"
                    className={`w-full max-w-[360px] mx-auto overflow-hidden rounded-lg [&_video]:w-full [&_video]:h-auto [&_video]:rounded-lg [&_video]:object-cover ${
                      cameraError ? "hidden" : "block"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* IMAGE UPLOAD CONTAINER */}
            {inputMode === "upload" && (
              <div className="bg-[#050806] border border-dashed border-[#39ff88]/40 rounded-xl p-8 text-center mb-4">
                <div id="file-reader-temp" className="hidden" />
                <FaUpload size={32} className="mx-auto text-[#39ff88] mb-2" />
                <p className="text-xs text-white mb-2">Upload Pass Screenshot / Ticket Image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-[#39ff88] file:text-black file:font-bold cursor-pointer"
                />
              </div>
            )}

            {/* MANUAL TOKEN INPUT CONTAINER */}
            {inputMode === "manual" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeScan(manualToken);
                }}
                className="space-y-3 mb-4"
              >
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Enter QR Token or User ID (e.g. STU-101)..."
                  className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl py-3 px-4 text-white text-xs font-mono focus:outline-none focus:border-[#39ff88]"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#39ff88] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#18c96a] transition-all"
                >
                  VERIFY & CLAIM TOKEN
                </button>
              </form>
            )}

            {/* AUDIO-VISUAL TOAST NOTIFICATION */}
            {toastNotification && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed animate-pulse ${
                  toastNotification.type === "success"
                    ? "bg-green-950/80 border-green-500 text-green-200"
                    : toastNotification.type === "warning"
                    ? "bg-yellow-950/80 border-yellow-500 text-yellow-200"
                    : "bg-red-950/80 border-red-500 text-red-200"
                }`}
              >
                <p className="font-bold text-sm mb-1">{toastNotification.message}</p>
                {toastNotification.data && (
                  <div className="font-mono text-[11px] opacity-90">
                    <p>Team: {toastNotification.data.teamName} | Member: {toastNotification.data.memberName}</p>
                    <p>Event: {toastNotification.data.eventTitle} {toastNotification.data.scannedAt && `(Scanned: ${toastNotification.data.scannedAt})`}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PASSWORD CONFIRMATION MODAL (DESTRUCTIVE ACTION PROTECTION) */}
      {showPasswordConfirm && (
        <div className="fixed inset-0 z-[220] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1510] border border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative font-mono text-center">
            <FaExclamationTriangle size={36} className="text-amber-400 mx-auto mb-3" />
            <h3 className="font-orbitron font-bold text-lg text-white mb-1">MANAGER AUTHORIZATION REQUIRED</h3>
            <p className="text-xs text-amber-200 mb-4">{pendingActionTitle}</p>

            <input
              type="password"
              value={confirmPasswordInput}
              onChange={(e) => setConfirmPasswordInput(e.target.value)}
              placeholder="Re-enter Manager Password..."
              className="w-full bg-[#050806] border border-amber-500/40 rounded-xl py-3 px-4 text-white text-xs font-mono focus:outline-none focus:border-amber-400 mb-3 text-center"
            />

            {confirmPasswordError && <p className="text-red-400 text-xs mb-3">{confirmPasswordError}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordConfirm(false)}
                className="flex-1 py-2.5 bg-gray-800 text-gray-300 text-xs rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPassword}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs rounded-xl font-bold uppercase tracking-wider"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ON-SPOT TEAM REGISTRATION MODAL */}
      {showOnSpotModal && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b1510] border border-[#39ff88]/40 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_60px_rgba(57,255,136,0.2)] relative font-mono my-8">
            <button
              onClick={() => setShowOnSpotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
            >
              <FaTimes size={18} />
            </button>

            <h3 className="font-orbitron font-bold text-xl text-white mb-4">WALK-IN ON-SPOT REGISTRATION</h3>

            <form onSubmit={handleOnSpotSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  value={onSpotData.teamName}
                  onChange={(e) => setOnSpotData({ ...onSpotData, teamName: e.target.value })}
                  className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#39ff88]"
                  placeholder="Ex: Cyber Warriors"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Target Event *</label>
                <input
                  type="text"
                  required
                  value={onSpotData.eventTitle}
                  onChange={(e) => setOnSpotData({ ...onSpotData, eventTitle: e.target.value })}
                  className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#39ff88]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">College *</label>
                  <input
                    type="text"
                    required
                    value={onSpotData.college}
                    onChange={(e) => setOnSpotData({ ...onSpotData, college: e.target.value })}
                    className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#39ff88]"
                    placeholder="College Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={onSpotData.department}
                    onChange={(e) => setOnSpotData({ ...onSpotData, department: e.target.value })}
                    className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#39ff88]"
                    placeholder="CSE / ECE / IT"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="block text-[#39ff88] font-bold mb-1">Team Leader Details *</label>
                <input
                  type="text"
                  required
                  placeholder="Leader Name *"
                  value={onSpotData.leaderName}
                  onChange={(e) => setOnSpotData({ ...onSpotData, leaderName: e.target.value })}
                  className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={onSpotData.leaderPhone}
                    onChange={(e) => setOnSpotData({ ...onSpotData, leaderPhone: e.target.value })}
                    className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={onSpotData.leaderEmail}
                    onChange={(e) => setOnSpotData({ ...onSpotData, leaderEmail: e.target.value })}
                    className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              {/* Members */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-300 font-bold">Additional Team Members</label>
                  <button
                    type="button"
                    onClick={() => setOnSpotData({ ...onSpotData, members: [...onSpotData.members, { name: "", phone: "" }] })}
                    className="text-[#39ff88] text-[11px] font-bold"
                  >
                    + Add Member
                  </button>
                </div>
                {onSpotData.members.map((m, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Member ${idx + 1} Name`}
                      value={m.name}
                      onChange={(e) => {
                        const updated = [...onSpotData.members];
                        updated[idx].name = e.target.value;
                        setOnSpotData({ ...onSpotData, members: updated });
                      }}
                      className="flex-1 bg-[#050806] border border-gray-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#39ff88] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#18c96a] mt-4"
              >
                GENERATE CREDENTIALS & REGISTER
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TEAM EDIT MODAL */}
      {editingTeam && editFormData && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b1510] border border-[#39ff88]/40 rounded-2xl max-w-xl w-full p-6 shadow-[0_0_60px_rgba(57,255,136,0.2)] relative font-mono my-8">
            <button
              onClick={() => { setEditingTeam(null); setEditFormData(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
            >
              <FaTimes size={18} />
            </button>

            <h3 className="font-orbitron font-bold text-xl text-white mb-4">EDIT TEAM CREDENTIALS</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Team Name</label>
                <input
                  type="text"
                  value={editFormData.teamName || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, teamName: e.target.value })}
                  className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">College</label>
                  <input
                    type="text"
                    value={editFormData.college || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, college: e.target.value })}
                    className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={editFormData.department || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="block text-[#39ff88] font-bold mb-1">Leader Info</label>
                <input
                  type="text"
                  placeholder="Leader Name"
                  value={editFormData.teamLeader?.name || ""}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    teamLeader: { ...editFormData.teamLeader, name: e.target.value }
                  })}
                  className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white mb-2"
                />
                <input
                  type="tel"
                  placeholder="Leader Phone"
                  value={editFormData.teamLeader?.phone || ""}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    teamLeader: { ...editFormData.teamLeader, phone: e.target.value }
                  })}
                  className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white"
                />
              </div>

              {/* Members Edit */}
              <div className="pt-2 border-t border-white/10">
                <label className="block text-gray-300 font-bold mb-2">Team Members</label>
                {editFormData.members?.map((m: any, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Member Name"
                      value={m.name}
                      onChange={(e) => {
                        const updated = [...editFormData.members];
                        updated[idx].name = e.target.value;
                        setEditFormData({ ...editFormData, members: updated });
                      }}
                      className="flex-1 bg-[#050806] border border-gray-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveTeamEdit}
                className="w-full py-3 bg-[#39ff88] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#18c96a] mt-4"
              >
                SAVE CHANGES (REQUIRES PASSWORD)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH HD PASS GENERATOR MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1510] border border-[#39ff88]/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_60px_rgba(57,255,136,0.2)] relative font-mono text-center">
            <button
              onClick={() => setShowBatchModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
            >
              <FaTimes size={18} />
            </button>

            <FaIdCard size={36} className="mx-auto text-[#39ff88] mb-3" />
            <h3 className="font-orbitron font-bold text-xl text-white mb-2">BATCH HD PASS GENERATOR</h3>
            <p className="text-xs text-gray-400 mb-4">Export all participant HD graphic badges (600x740px) as a ZIP archive for ID printing.</p>

            <div className="mb-6 text-left">
              <label className="block text-gray-400 text-xs mb-1">Filter Event</label>
              <select
                value={batchEventFilter}
                onChange={(e) => setBatchEventFilter(e.target.value)}
                className="w-full bg-[#050806] border border-[#39ff88]/30 rounded-xl p-3 text-white text-xs font-mono"
              >
                <option value="ALL">All Events ({teams.length} teams)</option>
                {uniqueEvents.map(evt => (
                  <option key={evt} value={evt}>{evt}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportBatchZip}
              disabled={generatingBatch}
              className="w-full py-3.5 bg-[#39ff88] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#18c96a] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generatingBatch ? (
                <><FaSyncAlt className="animate-spin" /> SYNTHESIZING ZIP ARCHIVE...</>
              ) : (
                <><FaDownload /> GENERATE & DOWNLOAD ZIP</>
              )}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
