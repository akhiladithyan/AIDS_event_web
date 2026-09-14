import React, { useState, useEffect, useRef } from 'react';
import { storeService } from '../services/store';
import confetti from 'canvas-confetti';
import { Trophy, Award, Lock, Clock } from 'lucide-react';
import FlowingMenu from '../components/FlowingMenu';
import MagicBento, { ParticleCard } from '../components/MagicBento';

const Results = () => {
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState({});
  const [judgingLocks, setJudgingLocks] = useState({});
  const [judges, setJudges] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');

  // Track active countdown animation when a new place gets revealed live
  // { [`${eventId}_${place}`]: number }
  const [countdowns, setCountdowns] = useState({});
  const isInitialLoadRef = useRef(true);
  const previousRevealedRef = useRef({});

  useEffect(() => {
    loadResultsData();
    // Poll for live reveal updates every 3 seconds
    const interval = setInterval(loadResultsData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadResultsData = async () => {
    try {
      const [evts, tms, scs, lcks, jdgs] = await Promise.all([
        storeService.getEvents(),
        storeService.getTeams(),
        storeService.getScores(),
        storeService.getJudgingLock(),
        storeService.getJudges()
      ]);
      setEvents(evts);
      setTeams(tms);
      setScores(scs);
      setJudges(jdgs || []);

      // Check if any new place was just revealed by Judge/Manager while user is watching live
      if (!isInitialLoadRef.current && lcks) {
        Object.keys(lcks).forEach(evtId => {
          const newRevealed = lcks[evtId]?.revealedPlaces || {};
          const oldRevealed = previousRevealedRef.current[evtId] || {};

          [3, 2, 1].forEach(place => {
            if (newRevealed[place] && !oldRevealed[place]) {
              // Newly revealed place! Automatically switch active tab to this event & trigger countdown
              setSelectedEventId(evtId);
              const key = `${evtId}_${place}`;
              startCountdownForPlace(key);
            }
          });
        });
      }

      isInitialLoadRef.current = false;
      previousRevealedRef.current = lcks ? Object.keys(lcks).reduce((acc, k) => ({ ...acc, [k]: lcks[k]?.revealedPlaces || {} }), {}) : {};
      setJudgingLocks(lcks || {});

      if (evts.length > 0) {
        setSelectedEventId(prev => (prev ? prev : evts[0].id));
      }
    } catch (e) {
      console.error('Error loading results:', e);
    }
  };

  const startCountdownForPlace = (key) => {
    setCountdowns(prev => ({ ...prev, [key]: 3 }));
    let currentSec = 3;
    const timer = setInterval(() => {
      currentSec -= 1;
      if (currentSec > 0) {
        setCountdowns(prev => ({ ...prev, [key]: currentSec }));
      } else {
        clearInterval(timer);
        setCountdowns(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
      }
    }, 1000);
  };

  const currentEvent = events.find(e => e.id === selectedEventId);
  const isJudgingCompleted = judgingLocks[selectedEventId]?.isCompleted || false;
  const currentEventReveals = judgingLocks[selectedEventId]?.revealedPlaces || {};

  // Compute Top 3 Winners for selected event: total score = sum of points across all judges (e.g. 30 + 35 = 65)
  const eventTeams = teams.filter(t => t.eventId === selectedEventId);

  const rankedLeaderboard = eventTeams.map(t => {
    const teamScoreKeys = Object.keys(scores).filter(k => k.startsWith(`${selectedEventId}_${t.id}_`));
    const totalScore = teamScoreKeys.reduce((sum, key) => sum + (scores[key]?.totalScore || 0), 0);
    const judgeCount = teamScoreKeys.length;
    const avgScore = judgeCount > 0 ? parseFloat((totalScore / judgeCount).toFixed(2)) : 0;
    return { ...t, totalScore, avgScore, judgeCount };
  })
  .sort((a, b) => b.totalScore - a.totalScore)
  .slice(0, 3); // Top 3 places

  // Format menu items for FlowingMenu
  const flowingMenuItems = events.map(evt => ({
    id: evt.id,
    text: evt.title,
    subtext: `${evt.category} • ${evt.venue || 'AI & DS Dept'}`,
    image: evt.image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
    isDone: judgingLocks[evt.id]?.isCompleted
  }));

  return (
    <div style={{ maxWidth: 1080, margin: '40px auto', padding: '0 20px' }}>
      {/* HEADER & FLOWING EVENT MENU */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          padding: '6px 16px',
          borderRadius: 100,
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: 12
        }}>
          <Trophy size={16} /> AIDEX '26 EVENT WINNERS
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
          Official Hall of Fame & Results
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 620, margin: '0 auto 28px auto' }}>
          Scores are locked by official judges. Select an event from the menu below to view the podium!
        </p>

        {/* FLOWING MENU COMPONENT */}
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <FlowingMenu
            items={flowingMenuItems}
            activeId={selectedEventId}
            onSelect={id => setSelectedEventId(id)}
            speed={12}
            marqueeBgColor="#16a34a"
            marqueeTextColor="#ffffff"
          />
        </div>
      </div>

      {/* RESULTS DISPLAY CONTENT WITH MAGIC BENTO PARTICLES */}
      {currentEvent && (
        <div>
          {!isJudgingCompleted ? (
            /* STATE 1: JUDGING NOT YET CLOSED */
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <Clock size={36} color="#a395f3" />
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 10 }}>Live Judging in Progress</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 0 }}>
                Evaluations for <strong style={{ color: '#fff' }}>{currentEvent.title}</strong> are currently ongoing by event judges. Standings will be ready and locked once all assigned judges complete and finalize their marks!
              </p>
            </div>
          ) : rankedLeaderboard.length === 0 ? (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No teams evaluated for this event.</p>
            </div>
          ) : (
            /* STATE 2: JUDGING COMPLETED — MAGIC BENTO PODIUM CARDS */
            <div>
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <span className="badge-purple" style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
                  ✨ {currentEvent.title} Podium ✨
                </span>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: 8 }}>
                  Event Winners Podium
                </h2>
              </div>

              {/* MAGIC BENTO CONTAINER WITH SPOTLIGHT & PARTICLES */}
              <MagicBento glowColor="234, 179, 8" gridTemplateColumns="repeat(3, 1fr)">
                {[1, 2, 3].map(place => {
                  const teamIndex = place - 1;
                  const team = rankedLeaderboard[teamIndex];
                  const countdownKey = `${selectedEventId}_${place}`;
                  const currentCountdown = countdowns[countdownKey];
                  const isPlaceRevealed = currentEventReveals[place] || false;

                  const colors = {
                    1: { bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.22) 0%, rgba(18, 15, 23, 0.95) 100%)', border: 'rgba(234, 179, 8, 0.6)', badge: '#eab308', glow: '234, 179, 8', title: '1st Place Winner', icon: Trophy },
                    2: { bg: 'linear-gradient(135deg, rgba(226, 232, 240, 0.16) 0%, rgba(18, 15, 23, 0.95) 100%)', border: 'rgba(226, 232, 240, 0.4)', badge: '#cbd5e1', glow: '203, 213, 225', title: '2nd Place Runner Up', icon: Award },
                    3: { bg: 'linear-gradient(135deg, rgba(217, 119, 6, 0.16) 0%, rgba(18, 15, 23, 0.95) 100%)', border: 'rgba(217, 119, 6, 0.4)', badge: '#d97706', glow: '217, 119, 6', title: '3rd Place Runner Up', icon: Award }
                  };
                  const cfg = colors[place];
                  const PlaceIcon = cfg.icon;

                  if (!team) {
                    return (
                      <div key={place} className="glass-panel" style={{ padding: 40, textAlign: 'center', opacity: 0.5, borderRadius: 28 }}>
                        <div style={{ fontWeight: 700, color: cfg.badge, marginBottom: 8 }}>{cfg.title}</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No team ranked in position #{place}</p>
                      </div>
                    );
                  }

                  return (
                    <ParticleCard
                      key={place}
                      glowColor={cfg.glow}
                      particleCount={12}
                      enableTilt={true}
                      clickEffect={true}
                      enableMagnetism={false}
                      style={{
                        background: cfg.bg,
                        border: `1.5px solid ${cfg.border}`,
                        borderRadius: 24,
                        padding: '56px 24px 32px 24px',
                        position: 'relative',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        minHeight: 360,
                        boxShadow: isPlaceRevealed && place === 1 ? '0 0 40px rgba(234, 179, 8, 0.3)' : 'none',
                        transform: isPlaceRevealed && place === 1 ? 'scale(1.02)' : 'none',
                        zIndex: place === 1 ? 2 : 1
                      }}
                    >
                      {/* Place Badge Header */}
                      <div style={{
                        position: 'absolute',
                        top: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: cfg.badge,
                        color: '#090514',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        padding: '6px 20px',
                        borderRadius: 100,
                        letterSpacing: '0.05em',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                        whiteSpace: 'nowrap',
                        zIndex: 20
                      }}>
                        {cfg.title.toUpperCase()}
                      </div>

                        {/* CARD CONTENT STATES */}
                        {currentCountdown !== undefined ? (
                          /* STATE A: LIVE 3-SECOND COUNTDOWN FOR THIS PLACE */
                          <div style={{ padding: '40px 12px' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: cfg.badge, marginBottom: 8 }}>
                              REVEALING {cfg.title.toUpperCase()} IN
                            </div>
                            <div style={{
                              fontSize: '4.5rem',
                              fontWeight: 900,
                              color: cfg.badge,
                              lineHeight: 1,
                              marginBottom: 12
                            }}>
                              {currentCountdown}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                              Get ready for the announcement...
                            </div>
                          </div>
                        ) : !isPlaceRevealed ? (
                          /* STATE B: SEALED PLACE */
                          <div style={{ padding: '32px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 260 }}>
                            <div style={{
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              background: 'rgba(0,0,0,0.4)',
                              border: `1px solid ${cfg.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 16,
                              boxShadow: `0 0 20px ${cfg.border}`
                            }}>
                              <Lock size={30} color={cfg.badge} />
                            </div>

                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                              {cfg.title}
                            </h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, maxWidth: 240, lineHeight: 1.5 }}>
                              🔒 Sealed & awaiting live reveal on stage by event judges.
                            </p>
                          </div>
                        ) : (
                          /* STATE C: REVEALED WINNER DETAILS */
                          <>
                            <div style={{ marginTop: 8 }}>
                              <div style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.35)',
                                border: `1px solid ${cfg.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px auto'
                              }}>
                                <PlaceIcon size={34} color={cfg.badge} />
                              </div>

                              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginBottom: 4 }}>
                                {team.teamName}
                              </h3>
                              <div style={{ color: cfg.badge, fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>
                                {team.id} | Team #{team.teamNo || 1}
                              </div>

                              {team.college && (
                                <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', marginBottom: 18 }}>
                                  {team.college}
                                </div>
                              )}

                              {/* Leader & Members list */}
                              <div style={{
                                background: 'rgba(0, 0, 0, 0.35)',
                                padding: '16px 18px',
                                borderRadius: 16,
                                textAlign: 'left',
                                fontSize: '0.9rem',
                                marginBottom: 24
                              }}>
                                <div style={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', marginBottom: 6 }}>
                                  Leader: {team.leaderName}
                                </div>
                                {team.members && team.members.length > 1 && (
                                  <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.4 }}>
                                    Members: {team.members.filter(m => m.role !== 'Leader').map(m => m.name).join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>

                             {(() => {
                               const eventCriteria = currentEvent?.criteria || [
                                 { id: 'crit-1', label: 'Innovation & Originality', maxPoints: 10 },
                                 { id: 'crit-2', label: 'Technical Execution', maxPoints: 10 },
                                 { id: 'crit-3', label: 'Presentation & Demo', maxPoints: 10 },
                                 { id: 'crit-4', label: 'Q&A Response', maxPoints: 10 }
                               ];
                               const singleJudgeMax = eventCriteria.reduce((sum, c) => sum + Number(c.maxPoints || 10), 0);
                               const assignedJudgesCount = judges.filter(j => (j.assignedEvents || []).includes(selectedEventId)).length;
                               const judgeMultiplier = Math.max(1, assignedJudgesCount, team.judgeCount || 0);
                               const totalEventMaxScore = singleJudgeMax * judgeMultiplier;

                               return (
                                 <div style={{
                                   background: 'rgba(255, 255, 255, 0.08)',
                                   padding: '14px 18px',
                                   borderRadius: 14,
                                   display: 'flex',
                                   justify: 'space-between',
                                   alignItems: 'center'
                                 }}>
                                   <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Final Total Score</span>
                                   <span style={{ fontSize: '1.45rem', fontWeight: 900, color: cfg.badge }}>
                                     {team.totalScore} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {totalEventMaxScore} pts</span>
                                   </span>
                                 </div>
                               );
                             })()}
                          </>
                        )}
                      </ParticleCard>
                    );
                  })}
              </MagicBento>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Results;
