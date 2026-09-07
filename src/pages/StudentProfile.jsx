import React, { useState, useEffect } from 'react';
import { storeService } from '../services/store';
import QRCode from 'qrcode';
import { User, LogOut, QrCode as QrIcon, Shield, CheckCircle2, Clock, MapPin, Printer } from 'lucide-react';

const StudentProfile = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loggedUser, setLoggedUser] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check if logged in in session
    const saved = localStorage.getItem('neura_student_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        loadStudentProfile(parsed.userId, parsed.password);
      } catch (e) {}
    }
  }, []);

  const loadStudentProfile = async (uId, uPass) => {
    const teams = storeService.getTeams();
    let foundMember = null;
    let foundTeam = null;

    for (const t of teams) {
      const m = t.members.find(mem => mem.userId.toUpperCase() === uId.trim().toUpperCase() && mem.password === uPass);
      if (m) {
        foundMember = m;
        foundTeam = t;
        break;
      }
    }

    if (foundMember && foundTeam) {
      setLoggedUser(foundMember);
      setTeamInfo(foundTeam);
      setLoginError('');

      // Store session
      localStorage.setItem('neura_student_session', JSON.stringify({ userId: foundMember.userId, password: foundMember.password }));

      // Generate high quality QR code
      try {
        const url = await QRCode.toDataURL(foundMember.qrToken, { width: 300, margin: 2 });
        setQrCodeUrl(url);
      } catch (e) {
        console.error('QR generation error:', e);
      }
    } else {
      setLoginError('Invalid User ID or Password. Check credentials given during team registration.');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loadStudentProfile(userId, password);
  };

  const handleLogout = () => {
    localStorage.removeItem('neura_student_session');
    setLoggedUser(null);
    setTeamInfo(null);
    setUserId('');
    setPassword('');
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: 880, margin: '40px auto', padding: '0 20px' }}>
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

            <button type="submit" className="btn-primary" style={{ padding: '14px', marginTop: 6 }}>
              Login to View Profile & QR Code
            </button>

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
              <button onClick={handlePrintCard} className="btn-secondary">
                <Printer size={16} /> Print Wristband Badge
              </button>
              <button onClick={handleLogout} className="btn-secondary" style={{ background: 'rgba(239, 74, 64, 0.2)' }}>
                <LogOut size={16} /> Logout
              </button>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'center' }}>
              {/* Profile Details */}
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <span className="badge-purple">{loggedUser.role}</span>
                  <span className="badge-coral">{teamInfo.eventTitle}</span>
                </div>

                <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                  {loggedUser.name}
                </h1>
                <div style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', marginBottom: 24 }}>
                  User ID: <strong style={{ color: '#4ade80' }}>{loggedUser.userId}</strong>
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
                  <img
                    src={qrCodeUrl}
                    alt="Participant QR"
                    style={{ width: 190, height: 190, borderRadius: 16, border: '5px solid #ffffff', background: '#fff' }}
                  />
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
