import React, { useState, useEffect } from 'react';
import { storeService } from '../services/store';
import ScrollExpand from '../components/ScrollExpand';
import Grainient from '../components/Grainient';
import MagicBento, { ParticleCard } from '../components/MagicBento';
import PillButton from '../components/PillButton';
import confetti from 'canvas-confetti';
import { Sparkles, Calendar, Clock, MapPin, Trophy, Users, ArrowRight, X, CheckCircle, Copy, Download, ShieldAlert, Cpu } from 'lucide-react';

const isCashPrize = (evt) => {
  if (!evt) return false;
  if (evt.hasCashPrize === false) return false;
  if (evt.hasCashPrize === true) return true;
  if (!evt.prize) return false;
  const p = evt.prize.toLowerCase();
  if (p.includes('no cash') || p.includes('nocash')) return false;
  return p.includes('₹') || p.includes('cash') || p.includes('rs') || p.includes('inr');
};

const Home = () => {
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Registration Modal State
  const [registerModalEvent, setRegisterModalEvent] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [memberNames, setMemberNames] = useState(['', '', '']);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const [expandProgress, setExpandProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [evts, tms] = await Promise.all([
        storeService.getEvents(),
        storeService.getTeams()
      ]);
      setEvents(evts);
      setTeams(tms);
    };
    fetchData();
  }, []);

  const handleProgressChange = (progress) => {
    setExpandProgress(progress);
    if (progress >= 0.88) {
      setIsCompleted(true);
    } else {
      setIsCompleted(false);
    }
  };

  const categories = ['All', ...new Set(events.map(e => e.category))];

  const filteredEvents = categoryFilter === 'All'
    ? events
    : events.filter(e => e.category === categoryFilter);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const isSolo = registerModalEvent && (
      registerModalEvent.teamSize === '1' ||
      registerModalEvent.teamSize === '1 Member' ||
      registerModalEvent.teamSize === 'Individual' ||
      registerModalEvent.teamSize?.toLowerCase().includes('individual') ||
      registerModalEvent.teamSize?.toLowerCase().includes('solo')
    );

    if ((!isSolo && !teamName) || !college || !department || !leaderName || !leaderPhone) {
      alert(isSolo ? 'Please fill out College, Department, Participant Name, and Phone Number.' : 'Please fill out Team Name, College, Department, Leader Name, and Leader Phone.');
      return;
    }

    try {
      const newTeam = await storeService.registerTeam({
        teamName: isSolo ? `${leaderName}'s Entry` : teamName,
        eventId: registerModalEvent.id,
        college,
        department,
        leaderName,
        leaderPhone,
        leaderEmail,
        memberNames
      });

      // Generate QR Code for team leader
      if (newTeam.qrCodeUrl) {
        setQrDataUrl(newTeam.qrCodeUrl);
      } else {
        try {
          const qrUrl = await QRCode.toDataURL(newTeam.members[0].qrToken, { width: 240, margin: 2 });
          setQrDataUrl(qrUrl);
        } catch (err) {
          console.error('QR generation error:', err);
        }
      }

      setRegistrationResult(newTeam);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      alert(err.message || 'Registration failed. Please check details.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied credentials to clipboard!');
  };

  return (
    <div style={{ paddingBottom: 80, position: 'relative', zIndex: 1, background: 'transparent' }}>
      {/* ScrollExpand Hero Section */}
      <div style={{ position: 'relative', width: '100%', marginBottom: 40, background: 'transparent' }}>
        <ScrollExpand
          title="NEURA 2026"
          scrollHint="Scroll down to expand frame & reveal events"
          startWidth={65}
          startHeight={60}
          startRadius={28}
          endRadius={0}
          scrollDistance={1.4}
          holdDistance={0.4}
          useWindowScroll={true}
          onProgressChange={handleProgressChange}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <span className="badge-coral" style={{ fontSize: '0.9rem', padding: '6px 18px' }}>
              DEPT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE
            </span>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #ffffff 0%, #dcd4ff 50%, #ef4a40 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
              INNOVATE. CODE. TRANSFORM.
            </h1>
            <p style={{ maxWidth: 640, color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Join the biggest technical event of the AI&DS department. Participate in Hackathons, Paper Presentations, Prompt Matrix Battles, and Speed Coding!
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
              <PillButton as="a" href="#events-section" variant="primary" style={{ padding: '12px 28px' }}>
                Explore Events <ArrowRight size={18} />
              </PillButton>
            </div>
          </div>
        </ScrollExpand>
      </div>

      {/* Events Section Container - Completely hidden until ScrollExpand animation finishes */}
      <div
        id="events-section"
        style={{
          maxWidth: 1280,
          margin: '40px auto 0 auto',
          padding: '0 24px',
          opacity: isCompleted || expandProgress > 0.85 ? 1 : 0,
          transform: `translateY(${isCompleted || expandProgress > 0.85 ? 0 : 60}px)`,
          transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: isCompleted || expandProgress > 0.85 ? 'auto' : 'none',
          visibility: isCompleted || expandProgress > 0.8 ? 'visible' : 'hidden'
        }}
      >
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 36
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4a40', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem' }}>
              <Cpu size={16} /> Flagship Department Events
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: 4 }}>
              Explore Competitions & Challenges
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {categories.map(cat => (
              <PillButton
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                variant={categoryFilter === cat ? 'active' : 'secondary'}
                style={{ padding: '8px 18px', fontSize: '0.88rem' }}
              >
                {cat}
              </PillButton>
            ))}
          </div>
        </div>

        {/* Event Cards Grid with Green Magic Bento & Particle Effects */}
        <MagicBento glowColor="34, 197, 94">
          {filteredEvents.map(evt => {
            const registeredTeamCount = teams.filter(t => t.eventId === evt.id).length;
            const maxSlots = evt.maxTeams || 20;

            return (
              <ParticleCard
                key={evt.id}
                glowColor="34, 197, 94"
                particleCount={10}
                enableTilt={true}
                clickEffect={true}
                enableMagnetism={false}
              >
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%', height: '100%' }}>
                  <div style={{ height: 190, position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={evt.image}
                      alt={evt.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(12, 8, 24, 0.95), transparent 60%)'
                    }} />
                    <span className="badge-coral" style={{ position: 'absolute', top: 16, left: 16 }}>
                      {evt.category}
                    </span>
                    {isCashPrize(evt) && evt.prize && (
                      <span className="badge-purple" style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trophy size={13} /> {evt.prize}
                      </span>
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 16,
                      background: registeredTeamCount >= maxSlots ? 'rgba(239, 74, 64, 0.85)' : 'rgba(34, 197, 94, 0.85)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: 100,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <Users size={12} /> {registeredTeamCount}/{maxSlots} Slots Filled ({maxSlots - registeredTeamCount} Left)
                    </div>
                  </div>

                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 14 }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>{evt.title}</h3>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5, flexGrow: 1 }}>
                      {evt.description}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', margin: '8px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} color="#22c55e" /> {evt.teamSize}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} color="#a395f3" /> {evt.venue}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, gridColumn: 'span 2' }}>
                        <Clock size={14} color="#4ade80" /> {evt.time}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                      <PillButton
                        onClick={() => setSelectedEvent(evt)}
                        variant="secondary"
                        style={{ fontSize: '0.88rem', padding: '10px' }}
                      >
                        Event Details
                      </PillButton>
                      <PillButton
                        onClick={() => {
                          setRegisterModalEvent(evt);
                          setRegistrationResult(null);
                          setTeamName('');
                          setCollege('');
                          setDepartment('');
                          setLeaderName('');
                          setLeaderPhone('');
                          setLeaderEmail('');
                          setMemberNames(['', '', '']);
                        }}
                        disabled={registeredTeamCount >= maxSlots}
                        variant="primary"
                        style={{ fontSize: '0.88rem', padding: '10px' }}
                      >
                        {registeredTeamCount >= maxSlots ? 'Full' : 'Register Team'}
                      </PillButton>
                    </div>
                  </div>
                </div>
              </ParticleCard>
            );
          })}
        </MagicBento>
      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedEvent(null)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: 36,
                height: 36,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            <span className="badge-coral">{selectedEvent.category}</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '12px 0 16px 0' }}>
              {selectedEvent.title}
            </h2>

            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              {selectedEvent.description}
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 18,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 24
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Prize Pool</div>
                <div style={{ fontWeight: 700, color: '#ef4a40', fontSize: '1.1rem' }}>{selectedEvent.prize}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Team Format</div>
                <div style={{ fontWeight: 600 }}>{selectedEvent.teamSize}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Venue</div>
                <div style={{ fontWeight: 600 }}>{selectedEvent.venue}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Timing</div>
                <div style={{ fontWeight: 600 }}>{selectedEvent.time}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>Rules & Guidelines</h4>
            <ul style={{ paddingLeft: 20, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              {selectedEvent.rules?.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>

            <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
              <PillButton
                onClick={() => {
                  setRegisterModalEvent(selectedEvent);
                  setSelectedEvent(null);
                }}
                variant="primary"
              >
                Proceed to Register <ArrowRight size={16} />
              </PillButton>
            </div>
          </div>
        </div>
      )}

      {/* TEAM REGISTRATION MODAL */}
      {registerModalEvent && (
        <div className="modal-overlay" onClick={() => setRegisterModalEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <button
              onClick={() => setRegisterModalEvent(null)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: 36,
                height: 36,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            {!registrationResult ? (
              <>
                {(() => {
                  const tSizeStr = String(registerModalEvent.teamSize || '');
                  const isSolo = tSizeStr === '1' || tSizeStr === '1 Member' || tSizeStr.toLowerCase().includes('individual') || tSizeStr.toLowerCase().includes('solo');
                  
                  // Parse dynamic max members allowed for team
                  let extraMemberInputsCount = 0;
                  if (!isSolo) {
                    const numbers = tSizeStr.match(/\d+/g);
                    if (numbers && numbers.length > 0) {
                      const maxMem = parseInt(numbers[numbers.length - 1], 10);
                      extraMemberInputsCount = Math.max(0, maxMem - 1);
                    } else {
                      extraMemberInputsCount = 3;
                    }
                  }

                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className="badge-purple">Event Registration</span>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{registerModalEvent.title}</span>
                      </div>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 20 }}>
                        {isSolo ? 'Individual Participant Registration' : 'Register Your Team'}
                      </h2>

                      <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {!isSolo && (
                          <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                              Team Name *
                            </label>
                            <input
                              type="text"
                              className="glass-input"
                              placeholder="e.g. AI Vanguard"
                              value={teamName}
                              onChange={e => setTeamName(e.target.value)}
                              required={!isSolo}
                            />
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                          <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                              College / Institution Name *
                            </label>
                            <input
                              type="text"
                              className="glass-input"
                              placeholder="e.g. Vel Tech High Tech"
                              value={college}
                              onChange={e => setCollege(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                              Department *
                            </label>
                            <input
                              type="text"
                              className="glass-input"
                              placeholder="e.g. AI & DS / CSE / ECE"
                              value={department}
                              onChange={e => setDepartment(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                          <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                              {isSolo ? 'Participant Name *' : 'Team Leader Name *'}
                            </label>
                            <input
                              type="text"
                              className="glass-input"
                              placeholder={isSolo ? 'Your Full Name' : 'Leader Full Name'}
                              value={leaderName}
                              onChange={e => setLeaderName(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                              {isSolo ? 'Phone Number *' : 'Leader Phone Number *'}
                            </label>
                            <input
                              type="tel"
                              className="glass-input"
                              placeholder="+91 9876543210"
                              value={leaderPhone}
                              onChange={e => setLeaderPhone(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                            {isSolo ? 'Email Address (Optional)' : 'Leader Email (Optional)'}
                          </label>
                          <input
                            type="email"
                            className="glass-input"
                            placeholder="student@college.edu"
                            value={leaderEmail}
                            onChange={e => setLeaderEmail(e.target.value)}
                          />
                        </div>

                        {!isSolo && extraMemberInputsCount > 0 && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, marginTop: 8 }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: 10 }}>
                              Additional Team Members ({extraMemberInputsCount} Max)
                            </label>
                            {Array.from({ length: extraMemberInputsCount }).map((_, idx) => (
                              <div key={idx} style={{ marginBottom: 10 }}>
                                <input
                                  type="text"
                                  className="glass-input"
                                  placeholder={`Member ${idx + 2} Full Name`}
                                  value={memberNames[idx] || ''}
                                  onChange={e => {
                                    const newM = [...memberNames];
                                    newM[idx] = e.target.value;
                                    setMemberNames(newM);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <PillButton type="submit" variant="primary" style={{ marginTop: 12, padding: '14px', width: '100%' }}>
                          Confirm & Generate Entry Credentials <Sparkles size={18} />
                        </PillButton>
                      </form>
                    </>
                  );
                })()}
              </>
            ) : (
              /* REGISTRATION SUCCESS RECEIPT WITH USER IDS, PASSWORDS & QR CODE */
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <CheckCircle size={32} color="#4ade80" />
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                  Team Registered Successfully!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
                  Save your team details and pass member credentials to your team.
                </p>

                <div style={{
                  background: 'rgba(15, 10, 32, 0.8)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 20,
                  padding: 20,
                  marginTop: 20,
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Team Name</div>
                      <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#ef4a40' }}>{registrationResult.teamName}</div>
                    </div>
                    <span className="badge-purple">{registrationResult.id}</span>
                  </div>

                  {/* QR Code & Wristband Print Token */}
                  {qrDataUrl && (
                    <div style={{ textTransform: 'center', textAlign: 'center', background: 'rgba(255,255,255,0.04)', padding: 16, borderRadius: 16, marginBottom: 16 }}>
                      <img src={qrDataUrl} alt="Team QR" style={{ width: 140, height: 140, borderRadius: 12, border: '4px solid #fff' }} />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
                        Attendance & Wristband QR: <strong>{registrationResult.members[0].qrToken}</strong>
                      </div>
                    </div>
                  )}

                  {/* Member Login Credentials Table */}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>
                    Member Credentials (for /student login)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {registrationResult.members.map((mem, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 10,
                        fontSize: '0.88rem'
                      }}>
                        <div>
                          <strong>{mem.name}</strong> <span style={{ fontSize: '0.75rem', color: '#ef4a40' }}>({mem.role})</span>
                        </div>
                        <div style={{ fontFamily: 'monospace', color: '#4ade80' }}>
                          ID: <strong>{mem.userId}</strong> | Pass: <strong>{mem.password}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                  <PillButton
                    onClick={() => {
                      const text = `Team: ${registrationResult.teamName}\nEvent: ${registrationResult.eventTitle}\n` +
                        registrationResult.members.map(m => `${m.name} (${m.role}) -> ID: ${m.userId} | Pass: ${m.password}`).join('\n');
                      copyToClipboard(text);
                    }}
                    variant="secondary"
                  >
                    <Copy size={16} /> Copy Credentials
                  </PillButton>
                  <PillButton
                    onClick={() => setRegisterModalEvent(null)}
                    variant="primary"
                  >
                    Done
                  </PillButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
