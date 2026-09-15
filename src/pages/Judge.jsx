import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeService } from '../services/store';
import confetti from 'canvas-confetti';
import { Award, Trophy, Lock, CheckCircle, Save, Star, ShieldAlert, Sparkles, UserCheck, Edit, ArrowLeft } from 'lucide-react';

const Judge = () => {
  const [judgeUser, setJudgeUser] = useState('');
  const [judgePass, setJudgePass] = useState('');
  const [currentJudge, setCurrentJudge] = useState(null);
  const [loginError, setLoginError] = useState('');

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [teams, setTeams] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [scores, setScores] = useState({});
  const [judgingLocks, setJudgingLocks] = useState({});

  const [allJudgesList, setAllJudgesList] = useState([]);

  // Active scoring form for selected team
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [criteriaScores, setCriteriaScores] = useState({});
  const [feedbackText, setFeedbackText] = useState('');

  // Judge Lock Password Verification Modal
  const [showJudgeLockModal, setShowJudgeLockModal] = useState(false);
  const [judgeLockPassInput, setJudgeLockPassInput] = useState('');
  const [judgeLockError, setJudgeLockError] = useState('');

  // Manager Lock Verification Modal
  const [showLockModal, setShowLockModal] = useState(false);
  const [managerVerificationPass, setManagerVerificationPass] = useState('');
  const [lockError, setLockError] = useState('');

  useEffect(() => {
    // Mandatory password lock: Require username & password entry on every page visit
    setCurrentJudge(null);
  }, []);

  const handleLoginJudge = async (uName, uPass) => {
    const cleanUser = (uName || '').trim();
    const cleanPass = (uPass || '').trim();

    // 1. Verify access via verifyUserAccess (supports Super Admin Ak1002hil, custom judges, env users)
    const accessRes = await storeService.verifyUserAccess({ username: cleanUser, password: cleanPass, requiredLevel: 'judge' });

    let found = null;
    const judges = await storeService.getJudges();
    found = judges.find(j => 
      ((j.username && j.username.toLowerCase() === cleanUser.toLowerCase()) || 
       (j.name && j.name.toLowerCase() === cleanUser.toLowerCase())) && 
      j.password === cleanPass
    );

    if (!found && accessRes.success && accessRes.user) {
      found = {
        id: accessRes.user.id || 'super-admin-akhil',
        name: accessRes.user.name || 'Akhil Adithyan (Super Admin)',
        username: accessRes.user.username || cleanUser || 'akhil',
        password: cleanPass,
        role: accessRes.user.role || 'admin',
        accessLevels: accessRes.user.accessLevels || ['admin', 'super_admin', 'judge'],
        assignedEvents: accessRes.user.assignedEvents || []
      };
    }

    if (found) {
      setCurrentJudge(found);
      setLoginError('');
      sessionStorage.setItem('neura_judge_session', JSON.stringify({ username: found.username, password: found.password }));
      await loadJudgeData(found);
    } else {
      setLoginError('Invalid Judge Username or Password.');
    }
  };

  const loadJudgeData = async (judgeInstance = currentJudge) => {
    const [allEvts, jdgs] = await Promise.all([
      storeService.getEvents(),
      storeService.getJudges()
    ]);
    setAllJudgesList(jdgs);

    const isSuperAdminOrAdmin = 
      judgeInstance?.accessLevels?.includes('admin') || 
      judgeInstance?.accessLevels?.includes('super_admin') || 
      judgeInstance?.role === 'admin' ||
      judgeInstance?.id === 'super-admin-akhil' ||
      (judgeInstance?.name && judgeInstance.name.toLowerCase().includes('akhil')) ||
      (judgeInstance?.username && judgeInstance.username.toLowerCase().includes('akhil'));

    let permittedEvts = allEvts;
    // Regular judges are filtered by assignedEvents; Super Admin (Akhil) and Admins can evaluate ALL events
    if (!isSuperAdminOrAdmin && judgeInstance && judgeInstance.assignedEvents && judgeInstance.assignedEvents.length > 0) {
      permittedEvts = allEvts.filter(e => judgeInstance.assignedEvents.includes(e.id));
    }

    // Safety fallback: if no events assigned, fallback to all events so judging is never blocked
    if (!permittedEvts || permittedEvts.length === 0) {
      permittedEvts = allEvts;
    }
    setEvents(permittedEvts);

    if (permittedEvts.length > 0) {
      setSelectedEventId(prev => (permittedEvts.some(e => e.id === prev) ? prev : permittedEvts[0].id));
    }

    const [tms, att, scs, lcks] = await Promise.all([
      storeService.getTeams(),
      storeService.getAttendance(),
      storeService.getScores(),
      storeService.getJudgingLock()
    ]);
    setTeams(tms);
    setAttendance(att);
    setScores(scs);
    setJudgingLocks(lcks);
  };

  const selectedEventObj = events.find(e => e.id === selectedEventId);
  const activeCriteria = selectedEventObj?.criteria || [
    { id: 'crit-1', label: 'Innovation & Originality', maxPoints: 10 },
    { id: 'crit-2', label: 'Technical Execution', maxPoints: 10 },
    { id: 'crit-3', label: 'Presentation & Demo', maxPoints: 10 },
    { id: 'crit-4', label: 'Q&A Response', maxPoints: 10 }
  ];

  const handleSelectTeamForScoring = (team) => {
    setSelectedTeam(team);
    const key = `${selectedEventId}_${team.id}_${currentJudge.id}`;
    const existing = scores[key];

    const initialScores = {};
    activeCriteria.forEach(c => {
      if (existing && existing.criteria && existing.criteria[c.id] !== undefined) {
        initialScores[c.id] = Number(existing.criteria[c.id]);
      } else if (existing && existing.criteria) {
        // Fallback for old criterion keys
        const legacyVal = Object.values(existing.criteria)[0] || 10;
        initialScores[c.id] = Number(legacyVal);
      } else {
        initialScores[c.id] = Math.min(10, Number(c.maxPoints || 10));
      }
    });

    setCriteriaScores(initialScores);
    setFeedbackText(existing?.feedback || '');
  };

  const handleSaveScoresSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !currentJudge) return;

    await storeService.saveScore({
      eventId: selectedEventId,
      teamId: selectedTeam.id,
      judgeId: currentJudge.id,
      criteria: criteriaScores,
      feedback: feedbackText
    });

    await loadJudgeData();
    setSelectedTeam(null);
  };

  const handleLockMyJudging = async (e) => {
    if (e) e.preventDefault();
    if (!currentJudge || !selectedEventId) return;

    const cleanInput = (judgeLockPassInput || '').trim();
    const isMasterPass = cleanInput === 'Ak1002hil';
    const isOwnPass = currentJudge.password && cleanInput === currentJudge.password;

    if (!isMasterPass && !isOwnPass) {
      setJudgeLockError('Incorrect Judge Password!');
      return;
    }

    try {
      await storeService.lockJudgeForEvent(selectedEventId, currentJudge.id || 'super-admin-akhil');
      setShowJudgeLockModal(false);
      setJudgeLockPassInput('');
      setJudgeLockError('');
      await loadJudgeData();
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    } catch (err) {
      setJudgeLockError(err.message || "Failed to lock judging.");
    }
  };

  const handleFinalizeEventJudging = async (e) => {
    e.preventDefault();
    try {
      const isManagerValid = await storeService.verifyManagerPassword(managerVerificationPass);
      const isAdminValid = !isManagerValid ? await storeService.verifyAdminPassword(managerVerificationPass) : false;

      if (isManagerValid || isAdminValid) {
        await storeService.finalizeJudging(selectedEventId);
        setShowLockModal(false);
        setManagerVerificationPass('');
        setLockError('');
        await loadJudgeData();
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      } else {
        setLockError('Incorrect Manager Password verification via Supabase!');
      }
    } catch (err) {
      setLockError(err.message || 'Verification failed');
    }
  };

  // Teams with at least 1 present member (or team-level attendance) are eligible for judging!
  const presentTeamsForSelectedEvent = teams.filter(t => {
    if (t.eventId !== selectedEventId) return false;
    const teamAtt = attendance[t.id] || {};
    const hasTeamPresent = teamAtt.present || false;
    const hasAnyMemberPresent = Object.values(teamAtt.studentScans || {}).some(s => s.attendance);
    return hasTeamPresent || hasAnyMemberPresent;
  });

  // Compute Leaderboard Ranking: Total cumulative points across all evaluating judges
  const leaderboard = presentTeamsForSelectedEvent.map(t => {
    const teamScoreKeys = Object.keys(scores).filter(k => k.startsWith(`${selectedEventId}_${t.id}_`));
    const totalScore = teamScoreKeys.reduce((sum, key) => sum + (scores[key]?.totalScore || 0), 0);
    const judgeCount = teamScoreKeys.length;
    const avgScore = judgeCount > 0 ? (totalScore / judgeCount).toFixed(1) : 0;
    return { ...t, totalScore, avgScore, judgeCount };
  }).sort((a, b) => b.totalScore - a.totalScore);

  const lockState = judgingLocks[selectedEventId] || {};
  const currentEventLock = lockState.isCompleted || false;
  const judgeLocksMap = lockState.judgeLocks || {};
  const currentJudgeHasLocked = currentJudge ? Boolean(judgeLocksMap[currentJudge.id] || judgeLocksMap[currentJudge.username]) : false;

  const assignedJudgesForSelectedEvent = allJudgesList.filter(j => (j.assignedEvents || []).includes(selectedEventId));
  const lockedAssignedCount = assignedJudgesForSelectedEvent.filter(j => Boolean(judgeLocksMap[j.id] || judgeLocksMap[j.username])).length;

  return (
    <div className="judge-container">
      <Link to="/" className="btn-secondary" style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>
      {!currentJudge ? (
        /* JUDGE LOGIN PORTAL */
        <div className="glass-panel judge-login-card">
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
            <Award size={30} color="#a395f3" />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Judge Authentication</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, marginBottom: 24 }}>
            Enter assigned judge credentials to evaluate teams.
          </p>

          {loginError && (
            <div style={{
              background: 'rgba(239, 74, 64, 0.15)',
              border: '1px solid rgba(239, 74, 64, 0.4)',
              color: '#ff8a82',
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: '0.88rem',
              marginBottom: 18
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleLoginJudge(judgeUser, judgePass); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="text"
              className="glass-input"
              placeholder="Username"
              value={judgeUser}
              onChange={e => setJudgeUser(e.target.value)}
              required
            />
            <input
              type="password"
              className="glass-input"
              placeholder="Password"
              value={judgePass}
              onChange={e => setJudgePass(e.target.value)}
              required
            />

            <button type="submit" className="btn-primary" style={{ padding: '14px' }}>
              Access Judging Matrix <Lock size={16} />
            </button>
          </form>
        </div>
      ) : (
        /* JUDGING WORKSPACE */
        <div>
          <div className="judge-header">
            <div>
              <span className="badge-coral" style={{ marginBottom: 6, display: 'inline-block' }}>
                Evaluator: {currentJudge.name}
              </span>
              <h2 className="judge-header-title" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Live Judging Console</h2>
            </div>

            {/* Event Selector & Finalize Lock Button */}
            <div className="judge-controls">
              <select
                className="glass-input"
                style={{ width: 240 }}
                value={selectedEventId}
                onChange={e => {
                  setSelectedEventId(e.target.value);
                  setSelectedTeam(null);
                  loadJudgeData();
                }}
              >
                {events.map(evt => (
                  <option key={evt.id} value={evt.id} style={{ background: '#150d2e' }}>{evt.title}</option>
                ))}
              </select>

              {!currentEventLock && !currentJudgeHasLocked ? (
                <button
                  onClick={() => {
                    setJudgeLockPassInput('');
                    setJudgeLockError('');
                    setShowJudgeLockModal(true);
                  }}
                  className="btn-primary"
                  style={{ whiteSpace: 'nowrap', background: '#d97706', border: 'none' }}
                >
                  <Lock size={16} /> Lock My Judging ({currentJudge?.name || 'Judge'})
                </button>
              ) : currentJudgeHasLocked ? (
                <span className="badge-green" style={{ padding: '8px 14px', fontSize: '0.86rem' }}>
                  <CheckCircle size={15} /> Your Judging is Locked ({currentJudge?.name})
                </span>
              ) : (
                <span className="badge-green" style={{ padding: '8px 14px', fontSize: '0.86rem' }}>
                  <CheckCircle size={15} /> All Judges Completed & Locked
                </span>
              )}
            </div>
          </div>

          {/* ASSIGNED JUDGES LOCK STATUS BANNER */}
          {assignedJudgesForSelectedEvent.length > 0 && (
            <div className="judge-progress-banner">
              <div>
                <strong>Assigned Judges Lock Progress ({lockedAssignedCount} / {assignedJudgesForSelectedEvent.length} Locked):</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                  {assignedJudgesForSelectedEvent.map(j => {
                    const isJLocked = Boolean(judgeLocksMap[j.id] || judgeLocksMap[j.username]);
                    return `${j.name} (${isJLocked ? '✓ Locked' : '⏳ Pending'})`;
                  }).join(', ')}
                </span>
              </div>
              {currentEventLock && (
                <span style={{ color: '#22c55e', fontWeight: 700 }}>✓ Event Ready for Results</span>
              )}
            </div>
          )}

          <div className="judge-grid">
            {/* LEFT COLUMN: PRESENT TEAMS LIST */}
            <div className="glass-panel judge-panel-padding" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>
                Present Teams Eligible for Judging
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                Only teams with confirmed manager attendance appear here. Click to enter or edit marks.
              </p>

              {presentTeamsForSelectedEvent.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-subtle)' }}>
                  No present teams for this event yet. Mark attendance on /manager first!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {presentTeamsForSelectedEvent.map(t => {
                    const scoreKey = `${selectedEventId}_${t.id}_${currentJudge.id}`;
                    const hasScored = Boolean(scores[scoreKey]);
                    const currentScore = scores[scoreKey]?.totalScore || 0;
                    const maxTotalScore = activeCriteria.reduce((sum, c) => sum + Number(c.maxPoints || 10), 0);

                    return (
                      <div
                        key={t.id}
                        onClick={() => !currentEventLock && !currentJudgeHasLocked && handleSelectTeamForScoring(t)}
                        className="glass-card judge-team-card"
                        style={{
                          cursor: (currentEventLock || currentJudgeHasLocked) ? 'default' : 'pointer',
                          borderColor: selectedTeam?.id === t.id ? '#ef4a40' : 'rgba(255,255,255,0.1)',
                          background: selectedTeam?.id === t.id ? 'rgba(239, 74, 64, 0.15)' : 'rgba(255,255,255,0.04)'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.78rem', color: '#ef4a40', fontWeight: 700, fontFamily: 'monospace' }}>{t.id}</div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t.teamName}</h4>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Leader: {t.leaderName}</div>
                        </div>

                        <div>
                          {hasScored ? (
                            <div style={{ textAlign: 'right' }}>
                              <span className="badge-purple">Scored</span>
                              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4ade80', marginTop: 4 }}>
                                {currentScore} / {maxTotalScore} pts
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 8, display: 'inline-block' }}>
                              Pending Evaluation
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: SCORING FORM OR LEADERBOARD */}
            <div>
              {selectedTeam && !currentEventLock && !currentJudgeHasLocked ? (
                /* SCORING FORM */
                (() => {
                  const scoreKey = `${selectedEventId}_${selectedTeam.id}_${currentJudge.id}`;
                  const hasExistingScore = Boolean(scores[scoreKey]);
                  const totalFormScore = Object.values(criteriaScores).reduce((sum, v) => sum + Number(v || 0), 0);
                  const totalMaxPoints = activeCriteria.reduce((sum, c) => sum + Number(c.maxPoints || 10), 0);

                  return (
                    <div className="glass-panel judge-panel-padding" style={{ padding: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4a40', margin: 0 }}>
                          Evaluate: {selectedTeam.teamName}
                        </h3>
                        {hasExistingScore && (
                          <span className="badge-purple" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Edit size={13} /> Editable Score
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                        {hasExistingScore
                          ? 'You can update and refine this score until final lock.'
                          : 'Enter scores for each event criteria metric below.'}
                      </p>

                      <form onSubmit={handleSaveScoresSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {activeCriteria.map((crit, idx) => {
                          const val = criteriaScores[crit.id] !== undefined ? criteriaScores[crit.id] : Math.min(10, crit.maxPoints);
                          return (
                            <div key={crit.id || idx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.88rem' }}>
                                <span style={{ fontWeight: 700 }}>{idx + 1}. {crit.label}</span>
                                <strong style={{ color: '#22c55e' }}>{val} / {crit.maxPoints} pts</strong>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max={crit.maxPoints}
                                value={val}
                                onChange={e => {
                                  setCriteriaScores({ ...criteriaScores, [crit.id]: Number(e.target.value) });
                                }}
                                style={{ width: '100%', accentColor: '#22c55e', cursor: 'pointer', height: 24 }}
                              />
                            </div>
                          );
                        })}

                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Judge Feedback / Remarks</label>
                          <textarea
                            className="glass-input"
                            rows={3}
                            placeholder="Constructive feedback for team..."
                            value={feedbackText}
                            onChange={e => setFeedbackText(e.target.value)}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10, flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => setSelectedTeam(null)} className="btn-secondary" style={{ flex: '1 1 auto', minWidth: 100 }}>Close</button>
                          <button type="submit" className="btn-primary" style={{ flex: '2 1 auto', minWidth: 180 }}>
                            <Save size={16} /> {hasExistingScore ? 'Update Score' : 'Save Score'} ({totalFormScore} / {totalMaxPoints} pts)
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                })()
              ) : (
                /* LIVE EVENT LEADERBOARD */
                <div className="glass-panel judge-panel-padding" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, color: '#ef4a40' }}>
                    <Trophy size={20} />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Live Event Leaderboard</h3>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                    {currentEventLock ? 'Final Verified Results' : 'Live Average Scores across judges (Hidden from public)'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    {leaderboard.map((item, rank) => (
                      <div
                        key={item.id}
                        className="glass-card judge-leaderboard-card"
                        style={{
                          borderLeft: rank === 0 ? '4px solid #ef4a40' : rank === 1 ? '4px solid #a395f3' : '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: rank === 0 ? '#ef4a40' : rank === 1 ? '#6654b5' : 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            flexShrink: 0
                          }}>
                            {rank + 1}
                          </div>

                          <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.teamName}</h4>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>ID: {item.id} | Leader: {item.leaderName}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          {(() => {
                            const singleJudgeMax = activeCriteria.reduce((sum, c) => sum + Number(c.maxPoints || 10), 0);
                            const assignedCount = assignedJudgesForSelectedEvent.length;
                            const judgeMultiplier = Math.max(1, assignedCount, item.judgeCount || 0);
                            const totalEventMaxScore = singleJudgeMax * judgeMultiplier;

                            return (
                              <>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: rank === 0 ? '#ef4a40' : '#4ade80' }}>
                                  {item.totalScore} / {totalEventMaxScore} pts
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {item.judgeCount} of {judgeMultiplier} Judge score(s)
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PUBLIC RESULTS REVEAL CONTROL PANEL */}
                  {currentEventLock && (
                    <div style={{
                      background: 'rgba(102, 84, 181, 0.15)',
                      border: '1px solid rgba(131, 114, 216, 0.4)',
                      borderRadius: 16,
                      padding: 20,
                      marginTop: 20
                    }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={18} color="#a395f3" /> Public Results Reveal Controls
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                        Click a button to broadcast & reveal that place on the public Results page live with a 3-second countdown!
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                        {[3, 2, 1].map(place => {
                          const isRevealed = judgingLocks[selectedEventId]?.revealedPlaces?.[place];
                          const label = place === 1 ? '1st Place' : place === 2 ? '2nd Place' : '3rd Place';
                          const color = place === 1 ? '#eab308' : place === 2 ? '#cbd5e1' : '#d97706';

                          return (
                            <button
                              key={place}
                              onClick={async () => {
                                try {
                                  await storeService.setRevealedPlace(selectedEventId, place, !isRevealed);
                                  await loadJudgeData();
                                  if (!isRevealed) {
                                    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
                                  }
                                } catch (e) {
                                  alert('Failed to update reveal status: ' + e.message);
                                }
                              }}
                              className={isRevealed ? 'btn-secondary' : 'btn-primary'}
                              style={{
                                padding: '12px 14px',
                                fontSize: '0.88rem',
                                borderColor: isRevealed ? 'rgba(74, 222, 128, 0.4)' : color,
                                background: isRevealed ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                                color: isRevealed ? '#4ade80' : '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6
                              }}
                            >
                              {isRevealed ? (
                                <>
                                  <CheckCircle size={16} color="#4ade80" /> {label} Revealed
                                </>
                              ) : (
                                <>
                                  <Trophy size={16} color={color} /> Reveal {label}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* JUDGE PASSWORD VERIFICATION LOCK MODAL */}
          {showJudgeLockModal && (
            <div className="modal-overlay" onClick={() => setShowJudgeLockModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, textAlign: 'center' }}>
                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'rgba(217, 119, 6, 0.2)',
                  border: '1px solid rgba(217, 119, 6, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto'
                }}>
                  <Lock size={28} color="#f59e0b" />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Confirm Judging Lock</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4, marginBottom: 16 }}>
                  Enter your judge password (<strong>{currentJudge.name}</strong>) to lock and freeze your evaluation for <strong>{selectedEventObj?.title}</strong>.
                </p>

                {judgeLockError && (
                  <div style={{
                    background: 'rgba(239, 74, 64, 0.15)',
                    border: '1px solid rgba(239, 74, 64, 0.4)',
                    color: '#ff8a82',
                    padding: '10px 14px',
                    borderRadius: 12,
                    fontSize: '0.85rem',
                    marginBottom: 14
                  }}>
                    {judgeLockError}
                  </div>
                )}

                <form onSubmit={handleLockMyJudging} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <input
                    type="password"
                    className="glass-input"
                    placeholder="Enter Your Judge Password"
                    value={judgeLockPassInput}
                    onChange={e => setJudgeLockPassInput(e.target.value)}
                    required
                    autoFocus
                  />

                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button type="button" onClick={() => setShowJudgeLockModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1, background: '#d97706', border: 'none' }}>Verify & Lock</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MANAGER VERIFICATION LOCK MODAL */}
          {showLockModal && (
            <div className="modal-overlay" onClick={() => setShowLockModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, textAlign: 'center' }}>
                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'rgba(239, 74, 64, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto'
                }}>
                  <ShieldAlert size={28} color="#ef4a40" />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manager Verification</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4, marginBottom: 20 }}>
                  Enter the Manager Password to end judging and lock score updates for this event.
                </p>

                {lockError && (
                  <div style={{ color: '#ff8a82', fontSize: '0.85rem', marginBottom: 14 }}>
                    {lockError}
                  </div>
                )}

                <form onSubmit={handleFinalizeEventJudging} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <input
                    type="password"
                    className="glass-input"
                    placeholder="Enter Manager Password"
                    value={managerVerificationPass}
                    onChange={e => setManagerVerificationPass(e.target.value)}
                    required
                  />

                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button type="button" onClick={() => setShowLockModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirm & Lock</button>
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

export default Judge;
