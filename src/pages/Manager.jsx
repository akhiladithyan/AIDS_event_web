import React, { useState, useEffect, useRef } from 'react';
import { storeService } from '../services/store';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, UserPlus, CheckCircle2, XCircle, Search, Sparkles, Lock, RefreshCw } from 'lucide-react';

const Manager = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passError, setPassError] = useState('');

  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedEventId, setSelectedEventId] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Scanner & Scan Feedback State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [scanMessage, setScanMessage] = useState(null);
  const scannerRef = useRef(null);

  // On-Spot Registration Modal
  const [showOnSpotModal, setShowOnSpotModal] = useState(false);
  const [onSpotTeamName, setOnSpotTeamName] = useState('');
  const [onSpotEventId, setOnSpotEventId] = useState('');
  const [onSpotLeaderName, setOnSpotLeaderName] = useState('');
  const [onSpotLeaderPhone, setOnSpotLeaderPhone] = useState('');

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('neura_manager_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      loadManagerData();
    }
  }, []);

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
    const curPass = await storeService.getPasswords();
    if (password === curPass.manager) {
      setIsAuthenticated(true);
      sessionStorage.setItem('neura_manager_auth', 'true');
      setPassError('');
      await loadManagerData();
    } else {
      setPassError('Incorrect Manager Password!');
    }
  };

  // Camera QR Scanner Setup
  useEffect(() => {
    if (isAuthenticated && isCameraActive) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          handleProcessQR(decodedText);
          scanner.clear();
          setIsCameraActive(false);
        },
        (error) => {}
      );

      return () => {
        scanner.clear().catch(e => {});
      };
    }
  }, [isCameraActive, isAuthenticated]);

  const handleProcessQR = async (qrToken) => {
    const result = await storeService.markAttendance(qrToken, 'Manager Camera Scan');
    if (result.success) {
      setScanMessage({ success: true, text: result.message });
      await loadManagerData();
    } else {
      setScanMessage({ success: false, text: result.message });
    }
    setTimeout(() => setScanMessage(null), 4000);
  };

  const handleManualScanSubmit = async (e) => {
    e.preventDefault();
    if (!manualToken) return;
    await handleProcessQR(manualToken.trim());
    setManualToken('');
  };

  const handleToggleAttendance = async (teamId) => {
    await storeService.toggleAttendance(teamId);
    await loadManagerData();
  };

  const handleOnSpotRegister = async (e) => {
    e.preventDefault();
    if (!onSpotTeamName || !onSpotEventId || !onSpotLeaderName) {
      alert('Please fill all required fields');
      return;
    }

    const newTeam = await storeService.registerTeam({
      teamName: onSpotTeamName,
      eventId: onSpotEventId,
      leaderName: onSpotLeaderName,
      leaderPhone: onSpotLeaderPhone || 'Walk-in',
      memberNames: []
    });

    // Automatically mark attendance for on-spot registered team
    await storeService.markAttendance(newTeam.id, 'Manager On-Spot');

    setShowOnSpotModal(false);
    setOnSpotTeamName('');
    setOnSpotLeaderName('');
    setOnSpotLeaderPhone('');
    alert(`On-spot team ${newTeam.teamName} registered & marked present! Team ID: ${newTeam.id}`);
    await loadManagerData();
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

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="password"
              className="glass-input"
              placeholder="Manager Password (Default: manager123)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn-primary" style={{ padding: '14px' }}>
              Access Event Manager <Lock size={16} />
            </button>
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

            <button
              onClick={() => {
                setOnSpotEventId(events[0]?.id || '');
                setShowOnSpotModal(true);
              }}
              className="btn-primary"
            >
              <UserPlus size={18} /> On-Spot Registration
            </button>
          </div>

          {/* SCANNER & ATTENDANCE ACTION BAR */}
          <div className="glass-panel" style={{ padding: 28, marginBottom: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
              
              {/* Camera Scanner Box */}
              <div style={{ background: 'rgba(12, 8, 24, 0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 20, textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Camera size={18} color="#ef4a40" /> Camera QR Scanner
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Scan participant phone screen or wristband QR code to instantly verify attendance.
                </p>

                {!isCameraActive ? (
                  <button onClick={() => setIsCameraActive(true)} className="btn-secondary" style={{ width: '100%', padding: '12px' }}>
                    Open Phone/Device Camera
                  </button>
                ) : (
                  <div>
                    <div id="qr-reader" style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}></div>
                    <button onClick={() => setIsCameraActive(false)} className="btn-secondary" style={{ marginTop: 10, width: '100%' }}>
                      Close Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Manual Code Entry Box */}
              <div style={{ background: 'rgba(12, 8, 24, 0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 20 }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <QrCode size={18} color="#4ade80" /> Manual Token Verification
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Enter Team ID (e.g. <code>TM-9081</code>) or QR token string directly.
                </p>

                <form onSubmit={handleManualScanSubmit} style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Enter TM-XXXX or QR-STD-XXX"
                    value={manualToken}
                    onChange={e => setManualToken(e.target.value)}
                  />
                  <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    Verify & Mark
                  </button>
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
                  <th style={{ padding: '12px 16px' }}>Attendance Status</th>
                  <th style={{ padding: '12px 16px' }}>Judging Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map(t => {
                  const isPresent = attendance[t.id]?.present || false;
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#ef4a40' }}>{t.id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{t.teamName}</td>
                      <td style={{ padding: '14px 16px', color: '#a395f3' }}>{t.eventTitle}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {t.leaderName} ({t.leaderPhone})
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleToggleAttendance(t.id)}
                          style={{
                            padding: '6px 16px',
                            borderRadius: 100,
                            border: isPresent ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(239, 74, 64, 0.5)',
                            background: isPresent ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 74, 64, 0.2)',
                            color: isPresent ? '#4ade80' : '#ff8a82',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          {isPresent ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {isPresent ? 'PRESENT' : 'ABSENT'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isPresent ? (
                          <span className="badge-purple" style={{ fontSize: '0.75rem' }}>Eligible for Judging</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>Requires Attendance</span>
                        )}
                      </td>
                    </tr>
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
                    <input type="text" className="glass-input" value={onSpotTeamName} onChange={e => setOnSpotTeamName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Team Leader / Representative Name *</label>
                    <input type="text" className="glass-input" value={onSpotLeaderName} onChange={e => setOnSpotLeaderName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Phone Number</label>
                    <input type="tel" className="glass-input" value={onSpotLeaderPhone} onChange={e => setOnSpotLeaderPhone(e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                    <button type="button" onClick={() => setShowOnSpotModal(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Register & Mark Present</button>
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
