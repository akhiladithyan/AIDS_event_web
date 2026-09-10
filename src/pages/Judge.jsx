import React, { useState, useEffect } from 'react';
import { storeService } from '../services/store';
import confetti from 'canvas-confetti';
import { Award, Trophy, Lock, CheckCircle, Save, Star, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

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

  // Active scoring form for selected team
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [innovationScore, setInnovationScore] = useState(0);
  const [executionScore, setExecutionScore] = useState(0);
  const [presentationScore, setPresentationScore] = useState(0);
  const [qaScore, setQaScore] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // Manager Lock Verification Modal
  const [showLockModal, setShowLockModal] = useState(false);
  const [managerVerificationPass, setManagerVerificationPass] = useState('');
  const [lockError, setLockError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('neura_judge_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        handleLoginJudge(parsed.username, parsed.password);
      } catch (e) {}
    }
  }, []);

  const handleLoginJudge = async (uName, uPass) => {
    const judges = await storeService.getJudges();
    const found = judges.find(j => j.username === uName.trim() && j.password === uPass);
    if (found) {
      setCurrentJudge(found);
      setLoginError('');
      sessionStorage.setItem('neura_judge_session', JSON.stringify({ username: found.username, password: found.password }));
      await loadJudgeData();
    } else {
      setLoginError('Invalid Judge Username or Password. Try username: judge1 / password: j1');
    }
  };

  const loadJudgeData = async () => {
    const evts = await storeService.getEvents();
    setEvents(evts);
    if (evts.length > 0 && !selectedEventId) {
      setSelectedEventId(evts[0].id);
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

  const handleSelectTeamForScoring = (team) => {
    setSelectedTeam(team);
    // Check if score exists
    const key = `${selectedEventId}_${team.id}_${currentJudge.id}`;
    const existing = scores[key];
    if (existing) {
      setInnovationScore(existing.criteria.innovation || 0);
      setExecutionScore(existing.criteria.execution || 0);
      setPresentationScore(existing.criteria.presentation || 0);
      setQaScore(existing.criteria.qa || 0);
      setFeedbackText(existing.feedback || '');
    } else {
      setInnovationScore(10);
      setExecutionScore(10);
      setPresentationScore(10);
      setQaScore(10);
      setFeedbackText('');
    }
  };

  const handleSaveScoresSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !currentJudge) return;

    await storeService.saveScore({
      eventId: selectedEventId,
      teamId: selectedTeam.id,
      judgeId: currentJudge.id,
      criteria: {
        innovation: Number(innovationScore),
        execution: Number(executionScore),
        presentation: Number(presentationScore),
        qa: Number(qaScore)
      },
      feedback: feedbackText
    });

    await loadJudgeData();
    setSelectedTeam(null);
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

  // Compute Leaderboard Ranking
  const leaderboard = presentTeamsForSelectedEvent.map(t => {
    // Total aggregate score across all judges
    const teamScoreKeys = Object.keys(scores).filter(k => k.startsWith(`${selectedEventId}_${t.id}_`));
    const totalScore = teamScoreKeys.reduce((sum, key) => sum + (scores[key]?.totalScore || 0), 0);
    const judgeCount = teamScoreKeys.length;
    const avgScore = judgeCount > 0 ? (totalScore / judgeCount).toFixed(1) : 0;
    return { ...t, totalScore, avgScore, judgeCount };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const currentEventLock = judgingLocks[selectedEventId]?.isCompleted || false;

  return (
    <div style={{ maxWidth: 1180, margin: '40px auto', padding: '0 20px' }}>
      {!currentJudge ? (
        /* JUDGE LOGIN PORTAL */
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
              placeholder="Username (e.g. judge1)"
              value={judgeUser}
              onChange={e => setJudgeUser(e.target.value)}
              required
            />
            <input
              type="password"
              className="glass-input"
              placeholder="Password (e.g. j1)"
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <span className="badge-coral" style={{ marginBottom: 6, display: 'inline-block' }}>
                Evaluator: {currentJudge.name}
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Live Judging Console</h2>
            </div>

            {/* Event Selector & Finalize Lock Button */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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

              {!currentEventLock ? (
                <button
                  onClick={() => setShowLockModal(true)}
                  className="btn-primary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Lock size={16} /> Complete & Lock Judging
                </button>
              ) : (
                <span className="badge-green" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
                  <CheckCircle size={16} /> Judging Locked by Manager
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            {/* LEFT COLUMN: PRESENT TEAMS LIST */}
            <div className="glass-panel" style={{ padding: 24 }}>
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

                    return (
                      <div
                        key={t.id}
                        onClick={() => !currentEventLock && handleSelectTeamForScoring(t)}
                        className="glass-card"
                        style={{
                          padding: 18,
                          cursor: currentEventLock ? 'default' : 'pointer',
                          borderColor: selectedTeam?.id === t.id ? '#ef4a40' : 'rgba(255,255,255,0.1)',
                          background: selectedTeam?.id === t.id ? 'rgba(239, 74, 64, 0.15)' : 'rgba(255,255,255,0.04)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
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
                                {currentScore} / 40 pts
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 8 }}>
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
              {selectedTeam && !currentEventLock ? (
                /* SCORING FORM */
                (() => {
                  const scoreKey = `${selectedEventId}_${selectedTeam.id}_${currentJudge.id}`;
                  const isScoreFixed = Boolean(scores[scoreKey]);
                  return (
                    <div className="glass-panel" style={{ padding: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4a40', margin: 0 }}>
                          Evaluate: {selectedTeam.teamName}
                        </h3>
                        {isScoreFixed && (
                          <span className="badge-purple" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Lock size={13} /> Score Fixed
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                        {isScoreFixed
                          ? 'This team score has been submitted and fixed. Modifications are disabled.'
                          : 'Enter scores for each criterion out of 10 points.'}
                      </p>

                      <form onSubmit={handleSaveScoresSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.88rem' }}>
                            <span>Innovation & Originality</span>
                            <strong>{innovationScore} / 10 pts</strong>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            disabled={isScoreFixed}
                            value={innovationScore}
                            onChange={e => setInnovationScore(e.target.value)}
                            style={{ width: '100%', accentColor: '#ef4a40', opacity: isScoreFixed ? 0.6 : 1 }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.88rem' }}>
                            <span>Technical Execution & Feasibility</span>
                            <strong>{executionScore} / 10 pts</strong>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            disabled={isScoreFixed}
                            value={executionScore}
                            onChange={e => setExecutionScore(e.target.value)}
                            style={{ width: '100%', accentColor: '#ef4a40', opacity: isScoreFixed ? 0.6 : 1 }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.88rem' }}>
                            <span>Presentation & UI/UX Clarity</span>
                            <strong>{presentationScore} / 10 pts</strong>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            disabled={isScoreFixed}
                            value={presentationScore}
                            onChange={e => setPresentationScore(e.target.value)}
                            style={{ width: '100%', accentColor: '#ef4a40', opacity: isScoreFixed ? 0.6 : 1 }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.88rem' }}>
                            <span>Q&A & Defense</span>
                            <strong>{qaScore} / 10 pts</strong>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            disabled={isScoreFixed}
                            value={qaScore}
                            onChange={e => setQaScore(e.target.value)}
                            style={{ width: '100%', accentColor: '#ef4a40', opacity: isScoreFixed ? 0.6 : 1 }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Judge Feedback / Remarks</label>
                          <textarea
                            className="glass-input"
                            rows={3}
                            disabled={isScoreFixed}
                            placeholder="Constructive feedback for team..."
                            value={feedbackText}
                            onChange={e => setFeedbackText(e.target.value)}
                            style={{ opacity: isScoreFixed ? 0.6 : 1 }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                          <button type="button" onClick={() => setSelectedTeam(null)} className="btn-secondary">Close</button>
                          {!isScoreFixed ? (
                            <button type="submit" className="btn-primary">
                              <Save size={16} /> Submit & Fix Score ({Number(innovationScore) + Number(executionScore) + Number(presentationScore) + Number(qaScore)} pts)
                            </button>
                          ) : (
                            <div style={{
                              background: 'rgba(34, 197, 94, 0.2)',
                              border: '1px solid rgba(34, 197, 94, 0.5)',
                              color: '#4ade80',
                              padding: '10px 16px',
                              borderRadius: 12,
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}>
                              <Lock size={15} /> Score Fixed & Locked
                            </div>
                          )}
                        </div>
                      </form>
                    </div>
                  );
                })()
              ) : (
                /* LIVE EVENT LEADERBOARD */
                <div className="glass-panel" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, color: '#ef4a40' }}>
                    <Trophy size={20} />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Live Event Leaderboard</h3>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                    {currentEventLock ? 'Final Verified Results' : 'Live Average Scores across judges (Hidden from public)'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {leaderboard.map((item, rank) => (
                      <div
                        key={item.id}
                        className="glass-card"
                        style={{
                          padding: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
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
                            fontSize: '0.9rem'
                          }}>
                            {rank + 1}
                          </div>

                          <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.teamName}</h4>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>ID: {item.id} | Leader: {item.leaderName}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: rank === 0 ? '#ef4a40' : '#4ade80' }}>
                            {item.avgScore} pts
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.judgeCount} Judge score(s)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

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
