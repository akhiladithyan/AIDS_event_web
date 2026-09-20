import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeService } from '../services/store';
import QRCode from 'qrcode';
import PillButton from '../components/PillButton';
import { User, LogOut, QrCode as QrIcon, Shield, CheckCircle2, Clock, MapPin, Printer, ArrowLeft } from 'lucide-react';

const StudentProfile = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loggedUser, setLoggedUser] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check persistent storage for student login session
    const saved = localStorage.getItem('neura_student_session') || sessionStorage.getItem('neura_student_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.userId) {
          setUserId(parsed.userId);
          if (parsed.password) {
            // Legacy session: authenticate and seamlessly upgrade to token session
            loadStudentProfile(parsed.userId, parsed.password);
          } else if (parsed.token || parsed.isLoggedIn) {
            // Secure token session: restore student profile directly
            restoreStudentSession(parsed.userId);
          }
        }
      } catch (e) {}
    }
  }, []);

  const [eventDetails, setEventDetails] = useState(null);
  const [attendanceInfo, setAttendanceInfo] = useState({});

  const restoreStudentSession = async (uId) => {
    try {
      const res = await storeService.getStudentSession(uId);
      if (res && res.member && res.team) {
        await initializeStudentView(res.member, res.team);
      }
    } catch (e) {
      console.error('Session restore error:', e);
    }
  };

  const loadStudentProfile = async (uId, uPass) => {
    try {
      const res = await storeService.verifyStudentLogin(uId, uPass);
      if (res.success && res.member && res.team) {
        await initializeStudentView(res.member, res.team, res.token);
      } else {
        setLoginError(res.error || 'Invalid User ID or Password. Check credentials given during team registration.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Error logging in. Please check your credentials.');
    }
  };

  const initializeStudentView = async (foundMember, foundTeam, sessionToken) => {
    setLoggedUser(foundMember);
    setTeamInfo(foundTeam);
    
    try {
      const events = await storeService.getEvents();
      const evt = events.find(e => e.id === foundTeam.eventId);
      setEventDetails(evt || null);
    } catch (e) {}
    setLoginError('');

    // Fetch live attendance status for team & student
    try {
      const attMap = await storeService.getAttendance();
      setAttendanceInfo(attMap[foundTeam.id] || {});
    } catch (e) {
      console.error('Failed to load attendance info:', e);
    }

    // Store secure persistent session in localStorage (NO plain passwords stored in JSON/Inspect mode!)
    const sessionData = JSON.stringify({
      userId: foundMember.userId,
      name: foundMember.name,
      teamId: foundTeam.id,
      token: sessionToken || btoa(`${foundMember.userId}:${foundTeam.id}`),
      isLoggedIn: true
    });
    localStorage.setItem('neura_student_session', sessionData);
    sessionStorage.setItem('neura_student_session', sessionData);

    // Generate high quality QR code
    try {
      const qrTokenToUse = foundMember.qrToken || `QR-${foundMember.userId}-${foundTeam.id}`;
      const url = await QRCode.toDataURL(qrTokenToUse, { width: 300, margin: 2 });
      setQrCodeUrl(url);
    } catch (e) {
      console.error('QR generation error:', e);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loadStudentProfile(userId, password);
  };

  const handleLogout = () => {
    localStorage.removeItem('neura_student_session');
    sessionStorage.removeItem('neura_student_session');
    setLoggedUser(null);
    setTeamInfo(null);
    setUserId('');
    setPassword('');
  };

  const handleDownloadQR = async () => {
    if (!qrCodeUrl || !loggedUser || !teamInfo) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const canvasWidth = 600;
      const canvasHeight = 740;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Dark background gradient matching theme (#0c0618 to #080312)
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
      const eventName = (teamInfo.eventTitle || 'AI & DS EVENT 2026').toUpperCase();
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

      // Load QR image onto canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = qrCodeUrl;
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

      // Draw QR image centered inside the white container
      const qrPadding = 24;
      ctx.drawImage(img, qrBoxX + qrPadding, qrBoxY + qrPadding, qrBoxSize - (qrPadding * 2), qrBoxSize - (qrPadding * 2));

      // Participant Name (Large & Bold)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
      ctx.fillText(loggedUser.name, canvasWidth / 2, 538);

      // ID & Role line (Green highlight)
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 22px system-ui, -apple-system, monospace';
      ctx.fillText(`ID: ${loggedUser.userId}    |    ${loggedUser.role || 'Leader'}`, canvasWidth / 2, 578);

      // Team Line (Light Lavender)
      ctx.fillStyle = '#a395f3';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Team: ${teamInfo.teamName} (${teamInfo.id})`, canvasWidth / 2, 618);

      // College Line (Subtle bottom text)
      if (teamInfo.college && teamInfo.college !== 'N/A') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '15px system-ui, -apple-system, sans-serif';
        ctx.fillText(teamInfo.college, canvasWidth / 2, 654);
      }

      // Trigger automatic download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `QR_Pass_${loggedUser.userId}_${loggedUser.name.replace(/\s+/g, '_')}.png`;
      a.click();
    } catch (err) {
      console.error('Error generating custom QR badge image:', err);
      // Fallback
      const a = document.createElement('a');
      a.href = qrCodeUrl;
      a.download = `QR_Pass_${loggedUser.userId}_${loggedUser.name.replace(/\s+/g, '_')}.png`;
      a.click();
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '40px auto', padding: '0 20px' }}>
      <Link to="/" className="btn-secondary" style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>
      {!loggedUser ? (
        /* LOGIN FORM */
        <div className="glass-panel" style={{ maxWidth: 480, margin: '0 auto', padding: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(102, 84, 181, 0.25)',
              border: '1px solid rgba(131, 114, 216, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <User size={28} color="#a395f3" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Login</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
              Enter User ID & Password received during registration to view your QR code.
            </p>
          </div>

          {loginError && (
            <div style={{
              background: 'rgba(239, 74, 64, 0.15)',
              border: '1px solid rgba(239, 74, 64, 0.4)',
              color: '#ff8a82',
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: '0.88rem',
              marginBottom: 20
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                User ID (e.g. STD-101)
              </label>
              <input
                type="text"
                className="glass-input"
                placeholder="STD-101"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                className="glass-input"
                placeholder="pass-xxx"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <PillButton type="submit" variant="primary" style={{ padding: '14px', marginTop: 6, width: '100%' }}>
              Login to View Profile & QR Code
            </PillButton>

            <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
              Demo Login for testing: UserID <strong>STD-101</strong> / Password <strong>pass-101</strong>
            </div>
          </form>
        </div>
      ) : (
        /* STUDENT PROFILE CARD WITH SCANNING QR CODE */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Student Portal</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <PillButton onClick={handleLogout} variant="danger">
                <LogOut size={16} /> Logout
              </PillButton>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 36, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(102, 84, 181, 0.3) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 32, alignItems: 'center' }}>
              {/* Profile Details */}
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <span className="badge-purple">{loggedUser.role}</span>
                  <span className="badge-coral">{teamInfo.eventTitle}</span>
                </div>

                <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                  {loggedUser.name}
                </h1>
                <div style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', marginBottom: 16 }}>
                  User ID: <strong style={{ color: '#4ade80' }}>{loggedUser.userId}</strong>
                </div>

                {/* LIVE ATTENDANCE, LUNCH & SNACKS STATUS PILLS */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                  {(() => {
                    const sScans = (attendanceInfo.studentScans || {})[loggedUser.userId] || {};
                    const isAtt = Boolean(sScans.attendance);
                    const isLun = Boolean(sScans.lunch);
                    const isSna = Boolean(sScans.snacks);

                    return (
                      <>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: 100,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          background: isAtt ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 74, 64, 0.2)',
                          border: isAtt ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(239, 74, 64, 0.5)',
                          color: isAtt ? '#4ade80' : '#ff8a82'
                        }}>
                          {isAtt ? '✓ Attendance: Present' : '✗ Attendance: Absent'}
                        </span>

                        <span style={{
                          padding: '6px 14px',
                          borderRadius: 100,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          background: isLun ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: isLun ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                          color: isLun ? '#4ade80' : 'rgba(255, 255, 255, 0.5)'
                        }}>
                          {isLun ? '🍱 Lunch: Redeemed' : '🍱 Lunch: Available'}
                        </span>

                        <span style={{
                          padding: '6px 14px',
                          borderRadius: 100,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          background: isSna ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: isSna ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                          color: isSna ? '#facc15' : 'rgba(255, 255, 255, 0.5)'
                        }}>
                          {isSna ? '☕ Snacks: Redeemed' : '☕ Snacks: Available'}
                        </span>
                      </>
                    );
                  })()}
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 18,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-subtle)', fontSize: '0.9rem' }}>Team Name:</span>
                    <strong style={{ color: '#ef4a40', fontSize: '1.05rem' }}>{teamInfo.teamName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-subtle)', fontSize: '0.9rem' }}>Team ID:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{teamInfo.id}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-subtle)', fontSize: '0.9rem' }}>Team Leader:</span>
                    <strong>{teamInfo.leaderName}</strong>
                  </div>
                  {eventDetails && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 10 }}>
                        <span style={{ color: 'var(--text-subtle)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={15} color="#a395f3" /> Event Venue:
                        </span>
                        <strong style={{ color: '#a395f3' }}>{eventDetails.venue || 'Main Auditorium'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-subtle)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={15} color="#4ade80" /> Event Timing:
                        </span>
                        <strong style={{ color: '#4ade80' }}>{eventDetails.time || 'Schedule Announced'}</strong>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)' }}>
                    Team Roster:
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {teamInfo.members.map(m => (
                      <span key={m.userId} style={{
                        padding: '6px 14px',
                        borderRadius: 100,
                        background: m.userId === loggedUser.userId ? 'rgba(239, 74, 64, 0.3)' : 'rgba(255,255,255,0.06)',
                        border: m.userId === loggedUser.userId ? '1px solid #ef4a40' : '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.85rem',
                        color: m.userId === loggedUser.userId ? '#fff' : 'rgba(255,255,255,0.8)'
                      }}>
                        {m.name} ({m.role})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 24,
                padding: 24,
                textAlign: 'center',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a395f3', marginBottom: 12 }}>
                  Official Event Pass
                </div>

                {qrCodeUrl && (
                  <>
                    <img
                      src={qrCodeUrl}
                      alt="Participant QR"
                      style={{ width: 190, height: 190, borderRadius: 16, border: '5px solid #ffffff', background: '#fff' }}
                    />
                    <PillButton
                      onClick={handleDownloadQR}
                      variant="secondary"
                      style={{ marginTop: 12, width: '100%', padding: '8px 12px', fontSize: '0.82rem' }}
                    >
                      <QrIcon size={14} /> Download QR Badge Image
                    </PillButton>
                  </>
                )}

                <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', marginTop: 12 }}>
                  TOKEN: {loggedUser.qrToken}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <CheckCircle2 size={13} /> Show QR at /manager gate
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
