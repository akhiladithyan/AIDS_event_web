import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { storeService } from '../services/store';
import QRCode from 'qrcode';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import PillButton from '../components/PillButton';
import { QrCode, Camera, UserPlus, CheckCircle2, XCircle, Search, Sparkles, Lock, RefreshCw, Download, Edit, Trash2, Plus, ChevronDown, ChevronUp, Users, ShieldCheck, Upload, FileSpreadsheet, Mail, ArrowLeft } from 'lucide-react';

const Manager = () => {
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passError, setPassError] = useState('');

  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedEventId, setSelectedEventId] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  // Full Team Editing & Manager Password Confirmation Modal State
  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editLeaderPhone, setEditLeaderPhone] = useState('');
  const [editLeaderEmail, setEditLeaderEmail] = useState('');
  const [membersDraft, setMembersDraft] = useState([]);
  const [showPassConfirmModal, setShowPassConfirmModal] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Delete Team Password Confirmation Modal State
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [deletePassInput, setDeletePassInput] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Batch QR Download Range Modal State
  const [showBatchQrModal, setShowBatchQrModal] = useState(false);
  const [batchStartId, setBatchStartId] = useState(1);
  const [batchEndId, setBatchEndId] = useState(200);
  const [batchEventFilter, setBatchEventFilter] = useState('All');
  const [batchStatusMessage, setBatchStatusMessage] = useState('');

  // Scanner & Scan Feedback State
  const [scanMode, setScanMode] = useState('attendance'); // 'attendance', 'lunch', 'snacks'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [scanMessage, setScanMessage] = useState(null);
  const scannerRef = useRef(null);

  // On-Spot Registration Modal
  const [showOnSpotModal, setShowOnSpotModal] = useState(false);
  const [onSpotTeamName, setOnSpotTeamName] = useState('');
  const [onSpotCollege, setOnSpotCollege] = useState('');
  const [onSpotDepartment, setOnSpotDepartment] = useState('');
  const [onSpotEventId, setOnSpotEventId] = useState('');
  const [onSpotLeaderName, setOnSpotLeaderName] = useState('');
  const [onSpotLeaderPhone, setOnSpotLeaderPhone] = useState('');
  const [onSpotLeaderEmail, setOnSpotLeaderEmail] = useState('');

  useEffect(() => {
    // Mandatory password lock: Require password entry on every page visit
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadManagerData();
    // Poll attendance and team data every 3 seconds for instant multi-user synchronization
    const interval = setInterval(loadManagerData, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadManagerData = async () => {
    const tms = await storeService.getTeams();
    const evts = await storeService.getEvents();
    const att = await storeService.getAttendance();
    setTeams(tms);
    setEvents(evts);
    setAttendance(att);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await storeService.verifyUserAccess({ username: usernameInput, password, requiredLevel: 'manager' });
      if (res.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('neura_manager_auth', 'true');
        setPassError('');
        await loadManagerData();
      } else {
        setPassError(res.error || 'Access Denied! Manager permissions required.');
      }
    } catch (err) {
      setPassError(err.message || 'Authentication error');
    }
  };

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Camera QR Scanner Setup
  const startCameraScan = async () => {
    setIsCameraActive(true);
    setTimeout(async () => {
      try {
        if (html5QrCodeRef.current) {
          try { await html5QrCodeRef.current.stop(); } catch (e) {}
        }
        const html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = html5QrCode;

        // Dynamic responsive scan box sizing
        const qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.85);
          return { width: Math.max(200, qrboxSize), height: Math.max(200, qrboxSize) };
        };

        const config = {
          fps: 20,
          qrbox: qrboxFunction,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        };

        let isProcessing = false;

        const qrSuccessCallback = async (decodedText) => {
          if (isProcessing) return;
          isProcessing = true;
          console.log("Scanned QR Text:", decodedText);

          // Audio beep feedback on successful scan
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
          } catch (e) {}

          await handleProcessQR(decodedText);
          await stopCameraScan();
          isProcessing = false;
        };

        // Try environment camera first, fallback to user camera if environment fails
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            qrSuccessCallback,
            () => {}
          );
        } catch (camErr) {
          console.warn("Back camera fail, attempting default camera:", camErr);
          await html5QrCode.start(
            { facingMode: "user" },
            config,
            qrSuccessCallback,
            () => {}
          );
        }
      } catch (err) {
        console.error("Camera start error:", err);
        setScanMessage({ success: false, text: "Unable to access camera. Check device permissions or upload a QR image file." });
        setIsCameraActive(false);
      }
    }, 200);
  };

  const stopCameraScan = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {}
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleFileUploadScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setScanMessage({ success: true, text: "Scanning QR image file..." });
      const html5QrCode = new Html5Qrcode("qr-file-reader-hidden");
      const qrToken = await html5QrCode.scanFile(file, true);
      await handleProcessQR(qrToken);
    } catch (err) {
      console.error("File QR scan error:", err);
      setScanMessage({ success: false, text: "Could not read QR code from image file. Please upload a clear QR screenshot." });
      setTimeout(() => setScanMessage(null), 4000);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProcessQR = async (qrToken) => {
    try {
      const result = await storeService.markAttendance(qrToken, scanMode, `Manager ${scanMode.toUpperCase()} Scan`);
      if (result.success) {
        setScanMessage({ success: true, text: result.message });
        await loadManagerData();
      } else {
        setScanMessage({ success: false, text: result.message });
      }
    } catch (err) {
      console.error("Scan processing error:", err);
      setScanMessage({ success: false, text: `Scan Error: ${err.message || 'Failed to update attendance records.'}` });
    }
    setTimeout(() => setScanMessage(null), 6000);
  };

  const handleDeleteSingleTeam = (team) => {
    setTeamToDelete(team);
    setDeletePassInput('');
    setDeleteError('');
  };

  const handleConfirmDeleteTeamSubmit = async (e) => {
    e.preventDefault();
    if (!teamToDelete) return;
    try {
      await storeService.deleteTeam(teamToDelete.id, deletePassInput);
      const name = teamToDelete.teamName;
      const id = teamToDelete.id;
      setTeamToDelete(null);
      setDeletePassInput('');
      setDeleteError('');
      alert(`✅ Team "${name}" (${id}) deleted successfully!`);
      await loadManagerData();
    } catch (err) {
      setDeleteError(err.message || 'Incorrect Manager Password!');
    }
  };

  const handleManualScanSubmit = async (e) => {
    e.preventDefault();
    if (!manualToken) return;
    await handleProcessQR(manualToken.trim());
    setManualToken('');
  };

  const handleToggleAttendanceStage = async (teamId, memberUserId, type) => {
    // 1. Optimistic UI update for instant UI feedback
    const prevAttendance = { ...attendance };
    setAttendance(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      const existing = clone[teamId] || { present: false, lunch: false, snacks: false, studentScans: {} };
      const studentScans = existing.studentScans || {};
      const scanTypeKey = type.toLowerCase();

      if (memberUserId) {
        if (!studentScans[memberUserId]) studentScans[memberUserId] = { attendance: false, lunch: false, snacks: false };
        if (scanTypeKey === 'attendance') {
          const nextState = !studentScans[memberUserId].attendance;
          studentScans[memberUserId].attendance = nextState;
          if (!nextState) {
            studentScans[memberUserId].lunch = false;
            studentScans[memberUserId].snacks = false;
          }
        } else if (scanTypeKey === 'lunch' || scanTypeKey === 'snacks') {
          studentScans[memberUserId][scanTypeKey] = !Boolean(studentScans[memberUserId][scanTypeKey]);
        }
      } else {
        if (scanTypeKey === 'attendance') {
          const nextState = !existing.present;
          existing.present = nextState;
          if (!nextState) {
            existing.lunch = false;
            existing.snacks = false;
            Object.keys(studentScans).forEach(sId => {
              studentScans[sId].attendance = false;
              studentScans[sId].lunch = false;
              studentScans[sId].snacks = false;
            });
          }
        } else if (scanTypeKey === 'lunch' || scanTypeKey === 'snacks') {
          existing[scanTypeKey] = !Boolean(existing[scanTypeKey]);
        }
      }

      existing.studentScans = studentScans;
      clone[teamId] = existing;
      return clone;
    });

    try {
      await storeService.toggleAttendanceStage(teamId, memberUserId, type);
      await loadManagerData();
    } catch (err) {
      // Revert optimistic state on error
      setAttendance(prevAttendance);
      alert(err.message || 'Operation failed');
    }
  };

  const handleOnSpotRegister = async (e) => {
    e.preventDefault();
    
    const onSpotSelectedEvent = events.find(ev => ev.id === onSpotEventId);
    const isOnSpotSolo = onSpotSelectedEvent && (
      onSpotSelectedEvent.teamSize === '1' ||
      onSpotSelectedEvent.teamSize === '1 Member' ||
      onSpotSelectedEvent.teamSize === 'Individual' ||
      onSpotSelectedEvent.teamSize?.toLowerCase().includes('individual') ||
      onSpotSelectedEvent.teamSize?.toLowerCase().includes('solo')
    );

    if ((!isOnSpotSolo && (!onSpotTeamName || onSpotTeamName.trim() === '')) || !onSpotEventId || !onSpotLeaderName || !onSpotCollege || !onSpotDepartment || !onSpotLeaderPhone || !onSpotLeaderEmail) {
      alert(isOnSpotSolo ? 'Please fill all required fields: Event, College, Department, Leader Name, Phone, and Email' : 'Please fill all required fields: Event, Team Name, College, Department, Leader Name, Phone, and Email');
      return;
    }

    const newTeam = await storeService.registerTeam({
      teamName: onSpotTeamName,
      eventId: onSpotEventId,
      college: onSpotCollege,
      department: onSpotDepartment,
      leaderName: onSpotLeaderName,
      leaderPhone: onSpotLeaderPhone || 'Walk-in',
      leaderEmail: onSpotLeaderEmail || '',
      memberNames: []
    });

    // Automatically mark attendance for on-spot registered team
    await storeService.markAttendance(newTeam.id, 'Manager On-Spot');

    setShowOnSpotModal(false);
    setOnSpotTeamName('');
    setOnSpotCollege('');
    setOnSpotDepartment('');
    setOnSpotLeaderName('');
    setOnSpotLeaderPhone('');
    setOnSpotLeaderEmail('');
    alert(`On-spot team ${newTeam.teamName} registered & marked present! Team ID: ${newTeam.id}`);
    await loadManagerData();
  };

  const handleDownloadEventWiseCSV = () => {
    let csv = 'Event Title,Team No,Team ID,Team Name,College,Department,Participant Name,Role,User ID,Password,Phone,Email,Attendance Status,QR Token,Registration Date\n';
    events.forEach(evt => {
      const eventTeams = teams.filter(t => t.eventId === evt.id);
      eventTeams.forEach(t => {
        const isPresent = attendance[t.id]?.present ? 'PRESENT' : 'ABSENT';
        const regDate = t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A';
        (t.members || []).forEach(m => {
          csv += `"${evt.title}","${t.teamNo || 1}","${t.id}","${t.teamName}","${t.college || 'N/A'}","${t.department || 'N/A'}","${m.name}","${m.role}","${m.userId}","${m.password}","${t.leaderPhone || ''}","${t.leaderEmail || ''}","${isPresent}","${m.qrToken || ''}","${regDate}"\n`;
        });
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neura_event_wise_complete_roster_${Date.now()}.csv`;
    a.click();
  };

  const generateBadgeCanvas = async (member, team) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const canvasWidth = 600;
    const canvasHeight = 740;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Dark background gradient matching theme
    const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    grad.addColorStop(0, '#0c0618');
    grad.addColorStop(1, '#05020a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Top decorative gradient bar (Coral Red -> Purple)
    const topGrad = ctx.createLinearGradient(0, 0, canvasWidth, 0);
    topGrad.addColorStop(0, '#ef4a40');
    topGrad.addColorStop(0.5, '#9a4789');
    topGrad.addColorStop(1, '#6654b5');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, canvasWidth, 14);

    // Event Title Header (e.g. DATA SCIENCE SYMPOSIUM)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#a395f3';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    const eventName = (team.eventTitle || 'AI & DS EVENT 2026').toUpperCase();
    ctx.fillText(eventName, canvasWidth / 2, 60);

    // Pill Tag Badge "OFFICIAL EVENT PASS"
    const pillWidth = 260;
    const pillHeight = 36;
    const pillX = (canvasWidth - pillWidth) / 2;
    const pillY = 76;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 18);
    ctx.fill();

    ctx.fillStyle = '#ef4a40';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText('OFFICIAL EVENT PASS', canvasWidth / 2, pillY + 23);

    // Generate QR Code URL
    const qrToken = member.qrToken || `QR-${member.userId}-${team.id}`;
    let qrUrl = member.qrCodeUrl;
    if (!qrUrl) {
      qrUrl = await QRCode.toDataURL(qrToken, { width: 500, margin: 2 });
    }

    // Load QR image onto canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = qrUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Big White Rounded Container for QR Code
    const qrBoxSize = 360;
    const qrBoxX = (canvasWidth - qrBoxSize) / 2;
    const qrBoxY = 132;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
    ctx.fill();

    // Draw QR image centered inside white container
    const qrPadding = 24;
    ctx.drawImage(img, qrBoxX + qrPadding, qrBoxY + qrPadding, qrBoxSize - (qrPadding * 2), qrBoxSize - (qrPadding * 2));

    // Participant Name (Large & Bold)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(member.name, canvasWidth / 2, 538);

    // ID & Role line (Green highlight)
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 22px system-ui, -apple-system, monospace';
    ctx.fillText(`ID: ${member.userId}    |    ${member.role || 'Leader'}`, canvasWidth / 2, 578);

    // Team Line (Light Lavender)
    ctx.fillStyle = '#a395f3';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Team: ${team.teamName} (${team.id})`, canvasWidth / 2, 618);

    // College Line
    if (team.college && team.college !== 'N/A') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '15px system-ui, -apple-system, sans-serif';
      ctx.fillText(team.college, canvasWidth / 2, 654);
    }

    return canvas.toDataURL('image/png');
  };

  const handleDownloadMemberQR = async (member, team) => {
    try {
      const dataUrl = await generateBadgeCanvas(member, team);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `QR_Pass_${member.userId}_${member.name.replace(/\s+/g, '_')}.png`;
      a.click();
    } catch (err) {
      alert('Failed to download QR code pass: ' + err.message);
    }
  };

  const handleExecuteBatchQrDownload = async (e) => {
    e.preventDefault();
    const start = Number(batchStartId);
    const end = Number(batchEndId);

    if (isNaN(start) || isNaN(end) || start > end) {
      alert('Please enter a valid User ID number range (e.g. 1 to 200).');
      return;
    }

    // Collect matching students across teams
    const matches = [];
    teams.forEach(team => {
      if (batchEventFilter !== 'All' && team.eventId !== batchEventFilter) return;
      (team.members || []).forEach(member => {
        const digitsMatch = (member.userId || '').match(/\d+/);
        if (digitsMatch) {
          const numId = parseInt(digitsMatch[0], 10);
          if (numId >= start && numId <= end) {
            matches.push({ member, team });
          }
        }
      });
    });

    if (matches.length === 0) {
      setBatchStatusMessage(`No student accounts found in range ${start} - ${end}.`);
      return;
    }

    setBatchStatusMessage(`Preparing to download ${matches.length} student QR passes...`);

    for (let i = 0; i < matches.length; i++) {
      const { member, team } = matches[i];
      setBatchStatusMessage(`Downloading ${i + 1} of ${matches.length}: ${member.name} (${member.userId})...`);
      
      try {
        const dataUrl = await generateBadgeCanvas(member, team);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `QR_Pass_${member.userId}_${member.name.replace(/\s+/g, '_')}.png`;
        a.click();
      } catch (err) {
        console.error(`Batch QR error for ${member.userId}:`, err);
      }

      // Delay between downloads for browser stability
      await new Promise(res => setTimeout(res, 300));
    }

    setBatchStatusMessage(`✅ Successfully downloaded ${matches.length} QR code pass images for User ID range ${start} to ${end}!`);
  };

  const handleSendTeamRegistrationEmail = (team) => {
    const recipient = team.leaderEmail || '';
    const subject = `Official Registration Confirmation & Student Access Pass - Vel Tech Multi Tech Engineering College`;
    
    let membersBreakdown = '';
    (team.members || []).forEach((m, idx) => {
      membersBreakdown += `Member ${idx + 1}: ${m.name} (${m.role})\n`;
      membersBreakdown += `User ID  : ${m.userId}\n`;
      membersBreakdown += `Password : ${m.password}\n\n`;
    });

    const body = `Dear ${team.leaderName || 'Participant'},

Greetings from Vel Tech Multi Tech Engineering College!

We are pleased to confirm your team's registration for ${team.eventTitle}. Below are your official registration details and student portal credentials:

--------------------------------------------------
REGISTRATION & LOGIN DETAILS
--------------------------------------------------
Team Name      : ${team.teamName}
Event Name     : ${team.eventTitle}
College        : ${team.college || 'Vel Tech Multi Tech Engineering College'}
Leader Contact : ${team.leaderName} (${team.leaderPhone || 'N/A'})

STUDENT PORTAL ACCESS CREDENTIALS:
${membersBreakdown}--------------------------------------------------

📌 MANDATORY INSTRUCTION & NOTE:
Each student must log in to the Student Portal (or /scan page) using their individual User ID and Password listed above.
Your digital QR Code pass inside the portal is mandatory for:
1. Event Gate & Team Attendance Verification
2. Lunch Counter Access
3. Evening Refreshments & Snacks

Please keep your credentials confidential and present your digital QR Code at all scan counters during the event.

We wish you and your team all the best!

Warm Regards,
Event Coordination Committee
Vel Tech Multi Tech Engineering College`;

    const fullMailText = `SUBJECT: ${subject}\n\nRECIPIENT: ${recipient}\n\n${body}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(fullMailText).then(() => {
        alert(`📋 Email template for "${team.teamName}" copied to your clipboard!\n\nYou can now open your email app and paste it directly.`);
      }).catch(() => {
        fallbackCopyTextToClipboard(fullMailText, team.teamName);
      });
    } else {
      fallbackCopyTextToClipboard(fullMailText, team.teamName);
    }
  };

  const fallbackCopyTextToClipboard = (text, teamName) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert(`📋 Email template for "${teamName}" copied to your clipboard!\n\nYou can now open your email app and paste it directly.`);
    } catch (err) {
      prompt(`Copy this email text manually for ${teamName}:`, text);
    }
    document.body.removeChild(textArea);
  };

  const handleOpenEditMembersModal = (team) => {
    setEditingTeam(team);
    setEditTeamName(team.teamName || '');
    setEditCollege(team.college || '');
    setEditDepartment(team.department || '');
    setEditLeaderPhone(team.leaderPhone || '');
    setEditLeaderEmail(team.leaderEmail || '');
    setMembersDraft(JSON.parse(JSON.stringify(team.members || [])));
    setConfirmPasswordInput('');
    setConfirmError('');
    setShowPassConfirmModal(true);
  };

  const handleAddMemberToDraft = () => {
    const newIdx = membersDraft.length + 1;
    const uId = 'STD-' + Math.floor(100 + Math.random() * 900);
    const uPass = 'pass-' + Math.floor(100 + Math.random() * 900);
    setMembersDraft([
      ...membersDraft,
      {
        userId: uId,
        name: `New Member ${newIdx}`,
        password: uPass,
        role: 'Member',
        qrToken: `QR-${uId}-${editingTeam.id}`
      }
    ]);
  };

  const handleUpdateMemberDraftName = (index, name) => {
    const next = [...membersDraft];
    next[index].name = name;
    setMembersDraft(next);
  };

  const handleRemoveMemberFromDraft = (index) => {
    if (membersDraft.length <= 1) {
      alert('A team must have at least 1 member.');
      return;
    }
    const next = membersDraft.filter((_, idx) => idx !== index);
    setMembersDraft(next);
  };

  const handleSaveMembersWithPassword = async (e) => {
    e.preventDefault();
    if (!editingTeam) return;
    try {
      await storeService.updateTeamMembers(editingTeam.id, {
        teamName: editTeamName,
        college: editCollege,
        department: editDepartment,
        leaderPhone: editLeaderPhone,
        leaderEmail: editLeaderEmail,
        members: membersDraft
      }, confirmPasswordInput);
      setShowPassConfirmModal(false);
      setEditingTeam(null);
      setConfirmPasswordInput('');
      setConfirmError('');
      alert(`Team details & members for "${editTeamName}" updated and saved to Supabase!`);
      await loadManagerData();
    } catch (err) {
      setConfirmError(err.message || 'Verification failed');
    }
  };

  const filteredTeams = teams.filter(t => {
    const matchesEvent = selectedEventId === 'All' || t.eventId === selectedEventId;
    const matchesSearch = t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.leaderName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 1180, margin: '40px auto', padding: '0 20px' }}>
      <Link to="/" className="btn-secondary" style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>
      {!isAuthenticated ? (
        /* MANAGER LOGIN MODAL */
        <div className="glass-panel" style={{ maxWidth: 440, margin: '60px auto', padding: 36, textAlign: 'center' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(102, 84, 181, 0.25)',
            border: '1px solid rgba(131, 114, 216, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <QrCode size={30} color="#a395f3" />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manager Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, marginBottom: 24 }}>
            Enter manager password to scan QR codes & take team attendance.
          </p>

          {passError && (
            <div style={{
              background: 'rgba(239, 74, 64, 0.15)',
              border: '1px solid rgba(239, 74, 64, 0.4)',
              color: '#ff8a82',
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: '0.88rem',
              marginBottom: 18
            }}>
              {passError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="text"
              className="glass-input"
              placeholder="Username / Account ID"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
            />
            <input
              type="password"
              className="glass-input"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <PillButton type="submit" variant="primary" style={{ padding: '14px', width: '100%' }}>
              Access Event Manager <Lock size={16} />
            </PillButton>
          </form>
        </div>
      ) : (
        /* MANAGER WORKSPACE */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <span className="badge-purple" style={{ marginBottom: 6, display: 'inline-block' }}>
                Attendance & Gate Operations
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Event Manager Console</h2>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <PillButton
                onClick={() => {
                  setBatchStatusMessage('');
                  setShowBatchQrModal(true);
                }}
                variant="secondary"
              >
                <QrCode size={18} /> Download Batch QRs (Range)
              </PillButton>

              <PillButton
                onClick={handleDownloadEventWiseCSV}
                variant="secondary"
              >
                <Download size={18} /> Export Event-Wise CSV
              </PillButton>

              <PillButton
                onClick={() => {
                  setOnSpotEventId(events[0]?.id || '');
                  setShowOnSpotModal(true);
                }}
                variant="primary"
              >
                <UserPlus size={18} /> On-Spot Registration
              </PillButton>
            </div>
          </div>

          {/* SCANNER & ATTENDANCE ACTION BAR */}
          <div className="glass-panel" style={{ padding: 28, marginBottom: 32 }}>
            {/* Scan Mode Switcher Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge-coral" style={{ fontSize: '0.85rem' }}>Current Scan Mode</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  {scanMode === 'attendance' ? '1. Event Attendance Scanning' : scanMode === 'lunch' ? '2. Lunch Token Scanning' : '3. Snacks Token Scanning'}
                </h4>
              </div>

              {/* 3 Scan Mode Selector Tabs */}
              <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.06)', padding: 4, borderRadius: 100, border: '1px solid rgba(255,255,255,0.12)' }}>
                <PillButton
                  onClick={() => setScanMode('attendance')}
                  variant={scanMode === 'attendance' ? 'active' : 'secondary'}
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  📋 Attendance
                </PillButton>
                <PillButton
                  onClick={() => setScanMode('lunch')}
                  variant={scanMode === 'lunch' ? 'active' : 'secondary'}
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  🍱 Lunch
                </PillButton>
                <PillButton
                  onClick={() => setScanMode('snacks')}
                  variant={scanMode === 'snacks' ? 'active' : 'secondary'}
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  ☕ Snacks
                </PillButton>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
              
              {/* Camera & File QR Scanner Box */}
              <div style={{ background: 'rgba(12, 8, 24, 0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 20, textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Camera size={18} color="#ef4a40" /> Camera & Image QR Scanner
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Scan live via camera or upload a QR screenshot for <strong style={{ color: '#fff' }}>{scanMode.toUpperCase()}</strong> verification.
                </p>

                <div id="qr-file-reader-hidden" style={{ display: 'none' }}></div>

                {!isCameraActive ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <PillButton onClick={startCameraScan} variant="secondary" style={{ width: '100%', padding: '12px' }}>
                      <Camera size={16} /> Open Device Camera ({scanMode.toUpperCase()})
                    </PillButton>
                    <PillButton onClick={() => fileInputRef.current && fileInputRef.current.click()} variant="secondary" style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}>
                      <Upload size={16} /> Upload QR Image File
                    </PillButton>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUploadScan}
                      style={{ display: 'none' }}
                    />
                  </div>
                ) : (
                  <div>
                    <div id="qr-reader" style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}></div>
                    <PillButton onClick={stopCameraScan} variant="secondary" style={{ marginTop: 10, width: '100%', padding: '10px' }}>
                      Close Camera
                    </PillButton>
                  </div>
                )}
              </div>

              {/* Manual Token Verification Box */}
              <div style={{ background: 'rgba(12, 8, 24, 0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 20 }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Search size={18} color="#4ade80" /> Manual Token / ID Entry
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Enter Team ID (e.g. <code>TM-E1-01</code>) or Student ID (e.g. <code>STD-101</code>) for <strong style={{ color: '#fff' }}>{scanMode.toUpperCase()}</strong>.
                </p>

                <form onSubmit={handleManualScanSubmit} style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Enter TM-E1-01 or STD-101"
                    value={manualToken}
                    onChange={e => setManualToken(e.target.value)}
                  />
                  <PillButton type="submit" variant="primary" style={{ whiteSpace: 'nowrap' }}>
                    Verify {scanMode.toUpperCase()}
                  </PillButton>
                </form>
              </div>

            </div>

            {/* SCAN FEEDBACK TOAST */}
            {scanMessage && (
              <div style={{
                marginTop: 20,
                padding: '14px 20px',
                borderRadius: 14,
                background: scanMessage.success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 74, 64, 0.2)',
                border: scanMessage.success ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(239, 74, 64, 0.5)',
                color: scanMessage.success ? '#4ade80' : '#ff8a82',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '1rem'
              }}>
                {scanMessage.success ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                {scanMessage.text}
              </div>
            )}
          </div>

          {/* TEAMS ATTENDANCE ROSTER */}
          <div className="glass-panel" style={{ padding: 28 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Team Attendance Roster</h3>

              <div style={{ display: 'flex', gap: 12 }}>
                {/* Event Filter */}
                <select
                  className="glass-input"
                  style={{ width: 220 }}
                  value={selectedEventId}
                  onChange={e => setSelectedEventId(e.target.value)}
                >
                  <option value="All" style={{ background: '#150d2e' }}>All Events</option>
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id} style={{ background: '#150d2e' }}>{evt.title}</option>
                  ))}
                </select>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: 240 }}>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Search team or ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: 36 }}
                  />
                  <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 12, top: 14 }} />
                </div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-subtle)' }}>
                  <th style={{ padding: '12px 16px' }}>Team ID</th>
                  <th style={{ padding: '12px 16px' }}>Team Name</th>
                  <th style={{ padding: '12px 16px' }}>Event</th>
                  <th style={{ padding: '12px 16px' }}>Leader Contact</th>
                  <th style={{ padding: '12px 16px' }}>Status (Attendance / Lunch / Snacks)</th>
                  <th style={{ padding: '12px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map(t => {
                  const teamAtt = attendance[t.id] || {};
                  const isPresent = teamAtt.present || false;
                  const isLunch = teamAtt.lunch || false;
                  const isSnacks = teamAtt.snacks || false;
                  const studentScans = teamAtt.studentScans || {};

                  const isExpanded = expandedTeamId === t.id;
                  return (
                    <React.Fragment key={t.id}>
                      <tr
                        onClick={() => setExpandedTeamId(isExpanded ? null : t.id)}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer',
                          background: isExpanded ? 'rgba(102, 84, 181, 0.15)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#ef4a40' }}>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: '#a395f3' }}>Team #{t.teamNo || 1}</span>
                          {t.displayId || t.id}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isExpanded ? <ChevronUp size={16} color="#a395f3" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
                            {t.teamName}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#a395f3' }}>{t.eventTitle}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div>{t.leaderName} ({t.leaderPhone})</div>
                          {t.leaderEmail ? <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t.leaderEmail}</div> : <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.5 }}>No Email Provided</div>}
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleToggleAttendanceStage(t.id, null, 'attendance')}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 100,
                                border: isPresent ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(239, 74, 64, 0.5)',
                                background: isPresent ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 74, 64, 0.2)',
                                color: isPresent ? '#4ade80' : '#ff8a82',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              {isPresent ? '✓ ATTEND' : '✗ ABSENT'}
                            </button>
                            <button
                              onClick={() => handleToggleAttendanceStage(t.id, null, 'lunch')}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 100,
                                border: isLunch ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                                background: isLunch ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: isLunch ? '#4ade80' : 'rgba(255, 255, 255, 0.5)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              {isLunch ? '🍱 LUNCH' : '🍱 NO LUNCH'}
                            </button>
                            <button
                              onClick={() => handleToggleAttendanceStage(t.id, null, 'snacks')}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 100,
                                border: isSnacks ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                                background: isSnacks ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: isSnacks ? '#facc15' : 'rgba(255, 255, 255, 0.5)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              {isSnacks ? '☕ SNACKS' : '☕ NO SNACKS'}
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleSendTeamRegistrationEmail(t)}
                              className="btn-primary"
                              title="Send Registration Confirmation Email to Team"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: 6, background: 'rgba(59, 130, 246, 0.25)', border: '1px solid rgba(59, 130, 246, 0.5)', color: '#60a5fa' }}
                            >
                              <Mail size={14} /> Send Mail
                            </button>
                            <button
                              onClick={() => handleOpenEditMembersModal(t)}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: 6 }}
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSingleTeam(t)}
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                gap: 6,
                                background: 'rgba(239, 74, 64, 0.25)',
                                border: '1px solid rgba(239, 74, 64, 0.5)',
                                color: '#ff8a82',
                                borderRadius: 100,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                fontWeight: 700
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* SLIDE DOWN INDIVIDUAL MEMBER DETAILS & SCAN BREAKDOWN FOR MANAGER */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} style={{ padding: '16px 20px', background: 'rgba(12, 8, 24, 0.7)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                            <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Users size={18} color="#a395f3" />
                                  <strong style={{ fontSize: '1rem', color: '#fff' }}>Team #{t.teamNo || 1} - {t.teamName} Individual Student Scan Audit</strong>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                  College: <strong style={{ color: '#fff' }}>{t.college || 'N/A'}</strong> &nbsp;|&nbsp; Dept: <strong style={{ color: '#fff' }}>{t.department || 'N/A'}</strong>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                  onClick={() => handleSendTeamRegistrationEmail(t)}
                                  className="btn-primary"
                                  style={{ padding: '6px 14px', fontSize: '0.8rem', gap: 6, background: 'rgba(59, 130, 246, 0.25)', border: '1px solid rgba(59, 130, 246, 0.5)', color: '#60a5fa' }}
                                >
                                  <Mail size={14} /> Send Credentials Mail
                                </button>
                                <button
                                  onClick={() => handleOpenEditMembersModal(t)}
                                  className="btn-primary"
                                  style={{ padding: '6px 14px', fontSize: '0.8rem', gap: 6 }}
                                >
                                  <Edit size={14} /> Modify Team Members
                                </button>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                              {t.members.map((m, idx) => {
                                const mScans = studentScans[m.userId] || {};
                                const mAtt = Boolean(mScans.attendance);
                                const mLunch = Boolean(mScans.lunch);
                                const mSnacks = Boolean(mScans.snacks);

                                return (
                                  <div key={m.userId || idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                      <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{m.name}</strong>
                                      <span className={m.role === 'Leader' ? 'badge-purple' : 'badge-pink'} style={{ fontSize: '0.72rem' }}>
                                        {m.role}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                                      <div>User ID: <code style={{ color: '#4ade80' }}>{m.userId}</code></div>
                                      <div>Password: <code style={{ color: '#fbbf24' }}>{m.password}</code></div>
                                    </div>

                                    {/* 3 Stage Status Buttons for Individual Student */}
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                                      <button
                                        onClick={() => handleToggleAttendanceStage(t.id, m.userId, 'attendance')}
                                        style={{
                                          padding: '3px 8px',
                                          borderRadius: 6,
                                          border: mAtt ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(239,74,64,0.5)',
                                          background: mAtt ? 'rgba(34,197,94,0.2)' : 'rgba(239,74,64,0.2)',
                                          color: mAtt ? '#4ade80' : '#ff8a82',
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        {mAtt ? '✓ Present' : '✗ Absent'}
                                      </button>

                                      <button
                                        onClick={() => handleToggleAttendanceStage(t.id, m.userId, 'lunch')}
                                        style={{
                                          padding: '3px 8px',
                                          borderRadius: 6,
                                          border: mLunch ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.15)',
                                          background: mLunch ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                                          color: mLunch ? '#4ade80' : 'rgba(255,255,255,0.4)',
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        {mLunch ? '🍱 Lunch Had' : '🍱 No Lunch'}
                                      </button>

                                      <button
                                        onClick={() => handleToggleAttendanceStage(t.id, m.userId, 'snacks')}
                                        style={{
                                          padding: '3px 8px',
                                          borderRadius: 6,
                                          border: mSnacks ? '1px solid rgba(234,179,8,0.5)' : '1px solid rgba(255,255,255,0.15)',
                                          background: mSnacks ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.05)',
                                          color: mSnacks ? '#facc15' : 'rgba(255,255,255,0.4)',
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        {mSnacks ? '☕ Snacks Had' : '☕ No Snacks'}
                                      </button>
                                    </div>

                                    <button
                                      onClick={() => handleDownloadMemberQR(m, t)}
                                      className="btn-secondary"
                                      style={{ width: '100%', padding: '6px 10px', fontSize: '0.78rem', gap: 6, justifyContent: 'center' }}
                                    >
                                      <Download size={13} /> Download Student QR
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ON SPOT REGISTRATION MODAL */}
          {showOnSpotModal && (
            <div className="modal-overlay" onClick={() => setShowOnSpotModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>On-Spot Team Registration</h3>
                <form onSubmit={handleOnSpotRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Event *</label>
                    <select className="glass-input" value={onSpotEventId} onChange={e => setOnSpotEventId(e.target.value)} required>
                      {events.map(evt => (
                        <option key={evt.id} value={evt.id} style={{ background: '#150d2e' }}>{evt.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Team Name *</label>
                    <input type="text" className="glass-input" value={onSpotTeamName} onChange={e => setOnSpotTeamName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>College / Institution Name *</label>
                    <input type="text" className="glass-input" placeholder="e.g. Vel Tech High Tech" value={onSpotCollege} onChange={e => setOnSpotCollege(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Department *</label>
                    <input type="text" className="glass-input" placeholder="e.g. AI & DS" value={onSpotDepartment} onChange={e => setOnSpotDepartment(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Team Leader / Representative Name *</label>
                    <input type="text" className="glass-input" value={onSpotLeaderName} onChange={e => setOnSpotLeaderName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Phone Number *</label>
                    <input type="tel" className="glass-input" value={onSpotLeaderPhone} onChange={e => setOnSpotLeaderPhone(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email Address *</label>
                    <input type="email" className="glass-input" value={onSpotLeaderEmail} onChange={e => setOnSpotLeaderEmail(e.target.value)} required />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                    <button type="button" onClick={() => setShowOnSpotModal(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Register & Mark Present</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MANAGER PASSWORD CONFIRMATION MODAL FOR FULL TEAM EDITING */}
          {showPassConfirmModal && editingTeam && (
            <div className="modal-overlay" onClick={() => setShowPassConfirmModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <ShieldCheck size={26} color="#a395f3" />
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Edit Team Details & Roster</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                      Modifying team details for <strong>{editingTeam.id}</strong> ({editingTeam.eventTitle})
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveMembersWithPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Team Name *</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={editTeamName}
                      onChange={e => setEditTeamName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>College / Institution</label>
                      <input
                        type="text"
                        className="glass-input"
                        value={editCollege}
                        onChange={e => setEditCollege(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Department</label>
                      <input
                        type="text"
                        className="glass-input"
                        value={editDepartment}
                        onChange={e => setEditDepartment(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Leader Phone Number</label>
                      <input
                        type="tel"
                        className="glass-input"
                        value={editLeaderPhone}
                        onChange={e => setEditLeaderPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Leader Email</label>
                      <input
                        type="email"
                        className="glass-input"
                        value={editLeaderEmail}
                        onChange={e => setEditLeaderEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14, marginTop: 4 }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                      Team Members List
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto', marginBottom: 12, paddingRight: 4 }}>
                      {membersDraft.map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 10 }}>
                          <input
                            type="text"
                            className="glass-input"
                            value={m.name}
                            onChange={e => handleUpdateMemberDraftName(idx, e.target.value)}
                            placeholder="Member Name"
                            style={{ flex: 1 }}
                            required
                          />
                          <span className={m.role === 'Leader' ? 'badge-purple' : 'badge-pink'} style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {m.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMemberFromDraft(idx)}
                            style={{ background: 'rgba(239,74,64,0.2)', border: 'none', color: '#ff8a82', padding: 8, borderRadius: 8, cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddMemberToDraft}
                        className="btn-secondary"
                        style={{ fontSize: '0.85rem', padding: '8px 14px', gap: 6 }}
                      >
                        <Plus size={16} /> Add Member to Team
                      </button>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(102, 84, 181, 0.15)', border: '1px solid rgba(131, 114, 216, 0.4)', borderRadius: 12, padding: 14 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: 6, color: '#fff' }}>
                      Enter Manager Security Password to Confirm *
                    </label>
                    <input
                      type="password"
                      className="glass-input"
                      placeholder="Manager Password (manager123)"
                      value={confirmPasswordInput}
                      onChange={e => setConfirmPasswordInput(e.target.value)}
                      required
                    />
                  </div>

                  {confirmError && (
                    <div style={{ color: '#ff8a82', fontSize: '0.85rem', fontWeight: 600 }}>
                      ⚠️ {confirmError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 6 }}>
                    <button type="button" onClick={() => setShowPassConfirmModal(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Confirm & Save to Supabase
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* BATCH QR DOWNLOAD BY RANGE MODAL */}
          {showBatchQrModal && (
            <div className="modal-overlay" onClick={() => setShowBatchQrModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <QrCode size={28} color="#a395f3" />
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Batch Download Student QRs</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                      Download student QR codes in bulk based on User ID range (e.g. 1 - 200).
                    </p>
                  </div>
                </div>

                <form onSubmit={handleExecuteBatchQrDownload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Start User ID No.</label>
                      <input
                        type="number"
                        className="glass-input"
                        value={batchStartId}
                        onChange={e => setBatchStartId(e.target.value)}
                        placeholder="1"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>End User ID No.</label>
                      <input
                        type="number"
                        className="glass-input"
                        value={batchEndId}
                        onChange={e => setBatchEndId(e.target.value)}
                        placeholder="200"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Filter by Event</label>
                    <select
                      className="glass-input"
                      value={batchEventFilter}
                      onChange={e => setBatchEventFilter(e.target.value)}
                    >
                      <option value="All" style={{ background: '#150d2e' }}>All Events</option>
                      {events.map(evt => (
                        <option key={evt.id} value={evt.id} style={{ background: '#150d2e' }}>{evt.title}</option>
                      ))}
                    </select>
                  </div>

                  {batchStatusMessage && (
                    <div style={{
                      background: 'rgba(102, 84, 181, 0.15)',
                      border: '1px solid rgba(131, 114, 216, 0.4)',
                      color: '#a395f3',
                      padding: '10px 14px',
                      borderRadius: 12,
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {batchStatusMessage}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="button" onClick={() => setShowBatchQrModal(false)} className="btn-secondary">
                      Close
                    </button>
                    <button type="submit" className="btn-primary">
                      <Download size={16} /> Start Batch Download
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DELETE TEAM CONFIRMATION MODAL WITH MANAGER PASSWORD */}
          {teamToDelete && (
            <div className="modal-overlay" onClick={() => setTeamToDelete(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(239, 74, 64, 0.2)',
                    border: '1px solid rgba(239, 74, 64, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Trash2 size={22} color="#ff8a82" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Delete Team</h3>
                    <span style={{ fontSize: '0.8rem', color: '#ff8a82', fontWeight: 600 }}>Manager Password Required</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                  You are about to delete team <strong style={{ color: '#fff' }}>"{teamToDelete.teamName}" ({teamToDelete.id})</strong>.
                  <br /><br />
                  <span style={{ color: '#ff8a82', fontWeight: 600 }}>⚠️ This action will permanently remove this team from the database.</span>
                </p>

                {deleteError && (
                  <div style={{
                    background: 'rgba(239, 74, 64, 0.15)',
                    border: '1px solid rgba(239, 74, 64, 0.4)',
                    color: '#ff8a82',
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: '0.88rem',
                    marginBottom: 16
                  }}>
                    {deleteError}
                  </div>
                )}

                <form onSubmit={handleConfirmDeleteTeamSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Enter Manager / Admin Password *
                    </label>
                    <input
                      type="password"
                      className="glass-input"
                      placeholder="Enter Manager Password"
                      value={deletePassInput}
                      onChange={e => setDeletePassInput(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                    <PillButton type="button" onClick={() => setTeamToDelete(null)} variant="secondary">
                      Cancel
                    </PillButton>
                    <PillButton type="submit" variant="danger" style={{ background: '#ef4a40', border: 'none', color: '#fff' }}>
                      Confirm Delete Team
                    </PillButton>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Manager;
