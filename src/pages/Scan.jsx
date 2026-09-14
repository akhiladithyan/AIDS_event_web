import React, { useState, useEffect, useRef } from 'react';
import { storeService } from '../services/store';
import { Html5Qrcode } from 'html5-qrcode';
import PillButton from '../components/PillButton';
import { QrCode, Camera, CheckCircle2, XCircle, Lock, Upload, ShieldCheck, RefreshCw } from 'lucide-react';

const Scan = () => {
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passError, setPassError] = useState('');

  // Scanning mode & states
  const [scanMode, setScanMode] = useState('attendance'); // 'attendance', 'lunch', 'snacks'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [scanMessage, setScanMessage] = useState(null);
  const [scannedLogs, setScannedLogs] = useState([]);

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fresh session lock: User must enter password every time they open /scan
    setIsAuthenticated(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await storeService.verifyUserAccess({ username: usernameInput, password, requiredLevel: 'scan' });

      if (res.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('neura_scan_auth', 'true');
        setPassError('');
      } else {
        setPassError(res.error || 'Access Denied! Scanner permissions required.');
      }
    } catch (err) {
      setPassError(err.message || 'Authentication error');
    }
  };

  // Camera QR Scanner setup
  const startCameraScan = async () => {
    setIsCameraActive(true);
    setTimeout(async () => {
      try {
        if (html5QrCodeRef.current) {
          try { await html5QrCodeRef.current.stop(); } catch (e) {}
        }
        const html5QrCode = new Html5Qrcode("qr-reader-page");
        html5QrCodeRef.current = html5QrCode;

        const qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.85);
          return { width: Math.max(220, qrboxSize), height: Math.max(220, qrboxSize) };
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

          // Play successful scan beep sound effect
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

        try {
          await html5QrCode.start({ facingMode: "environment" }, config, qrSuccessCallback, () => {});
        } catch (camErr) {
          await html5QrCode.start({ facingMode: "user" }, config, qrSuccessCallback, () => {});
        }
      } catch (err) {
        console.error("Camera error:", err);
        setScanMessage({ success: false, text: "Camera access error. Check browser permissions." });
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
      setScanMessage({ success: true, text: "Scanning QR image..." });
      const html5QrCode = new Html5Qrcode("qr-file-reader-hidden-scan");
      const qrToken = await html5QrCode.scanFile(file, true);
      await handleProcessQR(qrToken);
    } catch (err) {
      setScanMessage({ success: false, text: "Could not decode QR code from file. Try uploading a clearer photo." });
      setTimeout(() => setScanMessage(null), 4000);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProcessQR = async (qrToken) => {
    try {
      const result = await storeService.markAttendance(qrToken, scanMode, `Scan Portal (${scanMode.toUpperCase()})`);
      const timeStr = new Date().toLocaleTimeString();

      if (result.success) {
        setScanMessage({ success: true, text: result.message });
        setScannedLogs(prev => [{
          id: Date.now(),
          time: timeStr,
          mode: scanMode,
          text: result.message,
          success: true
        }, ...prev]);
      } else {
        setScanMessage({ success: false, text: result.message });
        setScannedLogs(prev => [{
          id: Date.now(),
          time: timeStr,
          mode: scanMode,
          text: result.message,
          success: false
        }, ...prev]);
      }
    } catch (err) {
      setScanMessage({ success: false, text: `Scan Error: ${err.message || 'Operation failed'}` });
    }
    setTimeout(() => setScanMessage(null), 6000);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    await handleProcessQR(manualToken.trim());
    setManualToken('');
  };

  return (
    <div style={{ maxWidth: 860, margin: '40px auto', padding: '0 20px' }}>
      {!isAuthenticated ? (
        /* PASSWORD AUTHENTICATION PORTAL */
        <div className="glass-panel" style={{ maxWidth: 440, margin: '60px auto', padding: 36, textAlign: 'center' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.18)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <QrCode size={32} color="#22c55e" />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Live QR Scanner Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, marginBottom: 24 }}>
            Enter Manager or Admin Password to access live barcode scanning.
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
              Unlock Scanner <Lock size={16} />
            </PillButton>
          </form>
        </div>
      ) : (
        /* LIVE SCANNER DASHBOARD */
        <div>
          <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
            <div style={{ position: 'absolute', right: 0, top: 0 }}>
              <PillButton
                onClick={() => {
                  setIsAuthenticated(false);
                  setPassword('');
                  sessionStorage.removeItem('neura_scan_auth');
                }}
                variant="danger"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <Lock size={14} /> Lock Scanner
              </PillButton>
            </div>
            <span className="badge-purple" style={{ fontSize: '0.88rem', padding: '6px 16px', marginBottom: 10, display: 'inline-block' }}>
              📷 Mobile & Web Scanner Portal
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 10px 0' }}>
              Live Event QR Check-In
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: 540, margin: '0 auto' }}>
              Select a stage below (Attendance, Lunch, or Snacks) then scan student/team QR codes live!
            </p>
          </div>

          {/* STAGE SELECTOR TABS */}
          <div className="glass-panel" style={{ padding: 12, marginBottom: 24, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <PillButton
              onClick={() => setScanMode('attendance')}
              variant={scanMode === 'attendance' ? 'primary' : 'secondary'}
              style={{ flex: 1, padding: '12px', fontSize: '0.92rem' }}
            >
              🎟️ Event Attendance
            </PillButton>
            <PillButton
              onClick={() => setScanMode('lunch')}
              variant={scanMode === 'lunch' ? 'primary' : 'secondary'}
              style={{ flex: 1, padding: '12px', fontSize: '0.92rem' }}
            >
              🍱 Lunch Pass
            </PillButton>
            <PillButton
              onClick={() => setScanMode('snacks')}
              variant={scanMode === 'snacks' ? 'primary' : 'secondary'}
              style={{ flex: 1, padding: '12px', fontSize: '0.92rem' }}
            >
              ☕ Snacks Pass
            </PillButton>
          </div>

          {/* MAIN SCANNING CARD */}
          <div className="glass-panel" style={{ padding: 28, textAlign: 'center', marginBottom: 28 }}>
            <div style={{ marginBottom: 20, fontWeight: 700, fontSize: '1.1rem', color: '#22c55e' }}>
              Active Mode: <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{scanMode} verification</span>
            </div>

            {/* Hidden canvas element for file reading */}
            <div id="qr-file-reader-hidden-scan" style={{ display: 'none' }} />

            {/* SCAN FEEDBACK MESSAGES */}
            {scanMessage && (
              <div style={{
                padding: '16px 20px',
                borderRadius: 16,
                marginBottom: 20,
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: scanMessage.success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 74, 64, 0.2)',
                border: scanMessage.success ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(239, 74, 64, 0.5)',
                color: scanMessage.success ? '#4ade80' : '#ff8a82'
              }}>
                {scanMessage.success ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                <span>{scanMessage.text}</span>
              </div>
            )}

            {/* CAMERA VIEWFINDER / CONTROLS */}
            {isCameraActive ? (
              <div>
                <div id="qr-reader-page" style={{ maxWidth: 460, margin: '0 auto 20px auto', borderRadius: 20, overflow: 'hidden', border: '2px solid #22c55e' }} />
                <PillButton onClick={stopCameraScan} variant="danger">
                  Stop Camera Scanner
                </PillButton>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <PillButton onClick={startCameraScan} variant="primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
                  <Camera size={20} /> Open Live Camera Scanner
                </PillButton>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUploadScan}
                  style={{ display: 'none' }}
                />
                <PillButton onClick={() => fileInputRef.current?.click()} variant="secondary" style={{ padding: '14px 24px', fontSize: '1rem' }}>
                  <Upload size={18} /> Upload Image File
                </PillButton>
              </div>
            )}

            {/* MANUAL TOKEN INPUT FALLBACK */}
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', maxWidth: 500, margin: '24px auto 0 auto' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                Manual ID / QR Token Entry Fallback
              </div>
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. TM-EVT1-01 or STD-101"
                  value={manualToken}
                  onChange={e => setManualToken(e.target.value)}
                  style={{ flex: 1 }}
                />
                <PillButton type="submit" variant="primary">
                  Verify Token
                </PillButton>
              </form>
            </div>
          </div>

          {/* RECENT SCANNED LOGS HISTORY */}
          {scannedLogs.length > 0 && (
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 14 }}>Recent Scan History (Session)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {scannedLogs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: log.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 74, 64, 0.1)',
                      border: log.success ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(239, 74, 64, 0.25)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.9rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {log.success ? <CheckCircle2 size={18} color="#4ade80" /> : <XCircle size={18} color="#ff8a82" />}
                      <span style={{ color: log.success ? '#ffffff' : '#ff8a82' }}>{log.text}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Scan;
