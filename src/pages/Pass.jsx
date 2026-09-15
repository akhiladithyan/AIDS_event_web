import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeService } from '../services/store';
import PillButton from '../components/PillButton';
import { ShieldCheck, Plus, Edit, Trash2, Key, Award, Lock, Save, Users, RefreshCw, RotateCcw, ArrowLeft } from 'lucide-react';

const Pass = () => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [judges, setJudges] = useState([]);
  const [events, setEvents] = useState([]);
  const [systemPasswords, setSystemPasswords] = useState({});

  // Modal State for Adding/Editing User Access Cards
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAccessLevels, setSelectedAccessLevels] = useState(['judge']);
  const [selectedAssignedEvents, setSelectedAssignedEvents] = useState([]);

  // Reset Judging State Modal
  const [showResetJudgingModal, setShowResetJudgingModal] = useState(false);
  const [confirmJudgingPassInput, setConfirmJudgingPassInput] = useState('');
  const [resetJudgingError, setResetJudgingError] = useState('');

  // Event Point Table Criteria State
  const [selectedCriteriaEventId, setSelectedCriteriaEventId] = useState('');
  const [editingCriteriaList, setEditingCriteriaList] = useState([]);

  // System Master Passwords State
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newManagerPass, setNewManagerPass] = useState('');

  const [teams, setTeams] = useState([]);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

  // Delete Team Password Confirmation Modal State
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [deletePassInput, setDeletePassInput] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    // Require strict re-authentication on every page visit for /pass
    setIsAuthenticated(false);
  }, []);

  const loadPassData = async () => {
    const jdgs = await storeService.getJudges();
    const evts = await storeService.getEvents();
    const pass = await storeService.getPasswords();
    const tms = await storeService.getTeams();
    setJudges(jdgs);
    setEvents(evts);
    setSystemPasswords(pass);
    setTeams(tms || []);
    setNewAdminPass(pass.admin);
    setNewManagerPass(pass.manager);

    if (evts.length > 0) {
      const activeEvtId = selectedCriteriaEventId || evts[0].id;
      setSelectedCriteriaEventId(activeEvtId);
      const activeEvt = evts.find(e => e.id === activeEvtId) || evts[0];
      setEditingCriteriaList(activeEvt?.criteria || []);
    }
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
      await loadPassData();
    } catch (err) {
      setDeleteError(err.message || 'Incorrect Manager / Admin Password!');
    }
  };

  const handleEventCriteriaSelectChange = (evtId) => {
    setSelectedCriteriaEventId(evtId);
    const targetEvt = events.find(e => e.id === evtId);
    setEditingCriteriaList(targetEvt?.criteria || []);
  };

  const handleSaveCriteriaSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCriteriaEventId) return;

    try {
      await storeService.updateEventCriteria(selectedCriteriaEventId, editingCriteriaList);
      await loadPassData();
      alert("✅ Point Table & Evaluation Criteria updated successfully for event!");
    } catch (err) {
      console.error("Save criteria error:", err);
      alert(err.message || "Failed to update criteria point table.");
    }
  };

  const handleSuperLogin = async (e) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim();
    const cleanPass = passwordInput.trim();

    // Strict Super Admin Verification: User ID "Akhil" & Password "Ak1002hil"
    if (cleanUser.toLowerCase() === 'akhil' && cleanPass === 'Ak1002hil') {
      setIsAuthenticated(true);
      setAuthError('');
      await loadPassData();
    } else {
      setAuthError('Access Denied! Only Super Admin (User ID: Akhil / Password: Ak1002hil) can access /pass.');
    }
  };

  const handleSaveUserAccount = async (e) => {
    e.preventDefault();
    try {
      const userObj = {
        id: editingId || undefined,
        name: name.trim(),
        username: username.trim(),
        password: password.trim(),
        accessLevels: selectedAccessLevels,
        assignedEvents: selectedAssignedEvents
      };

      if (editingId) {
        await storeService.updateJudge(userObj);
      } else {
        await storeService.addJudge(userObj);
      }

      setShowModal(false);
      await loadPassData();
      alert(`User access credentials for "${name}" saved successfully!`);
    } catch (err) {
      console.error("Save account error:", err);
      alert(err.message || "Failed to save user access card.");
    }
  };

  const handleDeleteUserAccount = async (id, userNameStr) => {
    if (confirm(`Are you sure you want to delete access card for "${userNameStr}"?`)) {
      await storeService.deleteJudge(id);
      await loadPassData();
    }
  };

  const handleSaveSystemPasswords = async (e) => {
    e.preventDefault();
    await storeService.updatePasswords({
      admin: newAdminPass,
      manager: newManagerPass
    });
    alert('System master passwords updated successfully!');
    await loadPassData();
  };

  const handleResetTestData = async () => {
    if (confirm("⚠️ CAUTION: Are you sure you want to reset all test data?\n\nThis will PERMANENTLY delete:\n• All registered teams & member profiles\n• Attendance, lunch & snacks logs\n• All judge evaluation scores & locked judging states\n\nEvent cards, system passwords, and user access cards will NOT be deleted.")) {
      try {
        await storeService.resetTestState();
        await loadPassData();
        alert("✅ Test environment reset successful!\nAll team registrations, attendance, and judging scores have been cleared.");
      } catch (err) {
        console.error("Reset test data error:", err);
        alert(err.message || "Failed to reset test state.");
      }
    }
  };

  const handleConfirmResetJudging = async (e) => {
    e.preventDefault();
    const cleanPass = confirmJudgingPassInput.trim();

    // Verify confirmation password against Super Admin password ('Ak1002hil') or Admin master password
    if (cleanPass === 'Ak1002hil' || cleanPass === systemPasswords.admin || cleanPass === passwordInput.trim()) {
      try {
        await storeService.resetJudgingState();
        setShowResetJudgingModal(false);
        setConfirmJudgingPassInput('');
        setResetJudgingError('');
        await loadPassData();
        alert("✅ Judging state reset successful!\nAll evaluation scores, judge points, locked states, and published results have been cleared.");
      } catch (err) {
        console.error("Reset judging state error:", err);
        setResetJudgingError(err.message || "Failed to reset judging state.");
      }
    } else {
      setResetJudgingError("❌ Incorrect password! Please enter your valid Super Admin or Admin password.");
    }
  };

  return (
    <div style={{ maxWidth: 1180, margin: '40px auto', padding: '0 20px' }}>
      <Link to="/" className="btn-secondary" style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>
      {!isAuthenticated ? (
        /* SUPER ADMIN AUTHENTICATION GATE */
        <div className="glass-panel" style={{ maxWidth: 440, margin: '60px auto', padding: 36, textAlign: 'center' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(234, 179, 8, 0.2)',
            border: '1px solid rgba(234, 179, 8, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Key size={32} color="#eab308" />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Super Admin Security Gate</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, marginBottom: 24 }}>
            Enter Super Admin credentials to configure access cards.
          </p>

          {authError && (
            <div style={{
              background: 'rgba(239, 74, 64, 0.15)',
              border: '1px solid rgba(239, 74, 64, 0.4)',
              color: '#ff8a82',
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: '0.88rem',
              marginBottom: 18
            }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleSuperLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="text"
              className="glass-input"
              placeholder="User ID / Username"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              required
            />
            <input
              type="password"
              className="glass-input"
              placeholder="Password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              required
            />

            <PillButton type="submit" variant="primary" style={{ padding: '14px', width: '100%' }}>
              Unlock Access Manager <Lock size={16} />
            </PillButton>
          </form>
        </div>
      ) : (
        /* SUPER ADMIN CONSOLE */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <span className="badge-purple" style={{ marginBottom: 6, display: 'inline-block' }}>
                🔑 Super Admin Authorization Console
              </span>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 900 }}>User Accounts & Access Levels</h1>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <PillButton
                onClick={() => {
                  setConfirmJudgingPassInput('');
                  setResetJudgingError('');
                  setShowResetJudgingModal(true);
                }}
                variant="danger"
                style={{ background: 'rgba(245, 158, 11, 0.25)', border: '1px solid rgba(245, 158, 11, 0.6)', color: '#fbbf24' }}
              >
                <RotateCcw size={16} /> Reset Judging State
              </PillButton>
              <PillButton
                onClick={handleResetTestData}
                variant="danger"
                style={{ background: 'rgba(239, 74, 64, 0.25)', border: '1px solid rgba(239, 74, 64, 0.6)', color: '#ff8a82' }}
              >
                <RefreshCw size={16} /> Reset Test Data
              </PillButton>
              <PillButton
                onClick={() => {
                  setIsAuthenticated(false);
                  setUsernameInput('');
                  setPasswordInput('');
                }}
                variant="secondary"
              >
                <Lock size={16} /> Lock Portal
              </PillButton>
            </div>
          </div>

          {/* USER ACCESS CARDS CONTROL PANEL */}
          <div className="glass-panel" style={{ padding: 28, marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Active User Access Cards ({judges.length})</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Create, update, or revoke passwords, user IDs, and permissions for each team member or evaluator.
                </p>
              </div>

              <PillButton
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setUsername('');
                  setPassword('');
                  setSelectedAccessLevels(['judge', 'manager', 'scan']);
                  setSelectedAssignedEvents(events.map(e => e.id));
                  setShowModal(true);
                }}
                variant="primary"
              >
                <Plus size={16} /> Create User Credentials
              </PillButton>
            </div>

            {/* USER ACCESS CARDS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {judges.map(j => {
                const assignedTitles = (j.assignedEvents || []).map(evtId => {
                  const found = events.find(e => e.id === evtId);
                  return found ? found.title : evtId;
                });

                return (
                  <div key={j.id} className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: 'rgba(34, 197, 94, 0.15)',
                          border: '1px solid rgba(34, 197, 94, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ShieldCheck size={22} color="#22c55e" />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{j.name}</h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{j.id}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => {
                            setEditingId(j.id);
                            setName(j.name);
                            setUsername(j.username);
                            setPassword(j.password);
                            setSelectedAccessLevels(j.accessLevels || ['judge']);
                            setSelectedAssignedEvents(j.assignedEvents || []);
                            setShowModal(true);
                          }}
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 8, padding: 6, cursor: 'pointer' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUserAccount(j.id, j.name)}
                          style={{ background: 'rgba(239, 74, 64, 0.25)', border: 'none', color: '#ff8a82', borderRadius: 8, padding: 6, cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* CREDENTIALS BOX */}
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 14,
                      padding: '12px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      fontSize: '0.88rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>User ID / Username:</span>
                        <code style={{ color: '#22c55e', fontWeight: 700 }}>{j.username}</code>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Password:</span>
                        <code style={{ color: '#fbbf24', fontWeight: 700 }}>{j.password}</code>
                      </div>
                    </div>

                    {/* GRANTED PERMISSIONS */}
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                        Granted Access Levels:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(j.accessLevels || ['judge']).map((lvl, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              padding: '3px 10px',
                              borderRadius: 100,
                              textTransform: 'uppercase',
                              background: lvl === 'admin' ? 'rgba(239, 74, 64, 0.2)' : lvl === 'manager' ? 'rgba(163, 149, 243, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                              border: lvl === 'admin' ? '1px solid rgba(239, 74, 64, 0.5)' : lvl === 'manager' ? '1px solid rgba(163, 149, 243, 0.5)' : '1px solid rgba(34, 197, 94, 0.5)',
                              color: lvl === 'admin' ? '#ff8a82' : lvl === 'manager' ? '#a395f3' : '#4ade80'
                            }}
                          >
                            🔑 {lvl}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ASSIGNED EVENTS */}
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                        Assigned Judging Events ({(j.assignedEvents || []).length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {assignedTitles.length > 0 ? (
                          assignedTitles.map((t, idx) => (
                            <span key={idx} className="badge-purple" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                              {t}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>No specific event limits</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REGISTERED TEAMS & SINGLE TEAM REMOVAL */}
          {(() => {
            const filteredTeams = teams.filter(t => {
              if (!teamSearchQuery.trim()) return true;
              const q = teamSearchQuery.toLowerCase().trim();
              return (
                (t.id && t.id.toLowerCase().includes(q)) ||
                (t.teamName && t.teamName.toLowerCase().includes(q)) ||
                (t.leaderName && t.leaderName.toLowerCase().includes(q)) ||
                (t.eventTitle && t.eventTitle.toLowerCase().includes(q))
              );
            });

            return (
              <div className="glass-panel" style={{ padding: 28, marginBottom: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>👥 Registered Teams ({teams.length}) — Delete Individual Teams</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Search and delete 1 specific team individually without resetting all other team registrations or test data.
                    </p>
                  </div>

                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Search team ID, name, leader..."
                    style={{ width: 280 }}
                    value={teamSearchQuery}
                    onChange={e => setTeamSearchQuery(e.target.value)}
                  />
                </div>

                {filteredTeams.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No teams registered or matching search criteria.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', textAlign: 'left', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 14px' }}>Team ID & Name</th>
                          <th style={{ padding: '12px 14px' }}>Event</th>
                          <th style={{ padding: '12px 14px' }}>Leader</th>
                          <th style={{ padding: '12px 14px' }}>Members</th>
                          <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeams.map(t => (
                          <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <td style={{ padding: '12px 14px' }}>
                              <strong style={{ color: '#fff', display: 'block' }}>{t.teamName}</strong>
                              <code style={{ color: '#1ce604', fontSize: '0.78rem' }}>{t.id}</code>
                            </td>
                            <td style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.85)' }}>{t.eventTitle}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 700, color: '#fff' }}>{t.leaderName}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.leaderPhone}</div>
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                              {(t.members || []).length} participants
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteSingleTeam(t)}
                                style={{
                                  background: 'rgba(239, 74, 64, 0.25)',
                                  border: '1px solid rgba(239, 74, 64, 0.5)',
                                  color: '#ff8a82',
                                  padding: '6px 14px',
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <Trash2 size={14} /> Delete Team
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* EVENT POINT TABLES & EVALUATION CRITERIA CLASSIFICATION */}
          <div className="glass-panel" style={{ padding: 28, marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>📊 Event Point Tables & Evaluation Criteria</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Customize evaluation metrics and maximum score allocation for each individual event.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Event:</span>
                <select
                  className="glass-input"
                  style={{ width: 260 }}
                  value={selectedCriteriaEventId}
                  onChange={e => handleEventCriteriaSelectChange(e.target.value)}
                >
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id} style={{ background: '#150d2e' }}>
                      {evt.title} ({evt.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleSaveCriteriaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {editingCriteriaList.map((crit, idx) => (
                  <div
                    key={crit.id || idx}
                    className="glass-card"
                    style={{
                      padding: '14px 18px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 140px 42px',
                      gap: 14,
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.3)'
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Criterion #{idx + 1} Label
                      </label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="e.g. Innovation, Technical Architecture, etc."
                        value={crit.label}
                        onChange={e => {
                          const updated = [...editingCriteriaList];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setEditingCriteriaList(updated);
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Max Points
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="glass-input"
                        value={crit.maxPoints}
                        onChange={e => {
                          const updated = [...editingCriteriaList];
                          updated[idx] = { ...updated[idx], maxPoints: Number(e.target.value || 1) };
                          setEditingCriteriaList(updated);
                        }}
                        required
                      />
                    </div>

                    <div style={{ paddingTop: 20 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (editingCriteriaList.length <= 1) {
                            alert("An event point table must have at least 1 evaluation criterion.");
                            return;
                          }
                          setEditingCriteriaList(editingCriteriaList.filter((_, i) => i !== idx));
                        }}
                        style={{ background: 'rgba(239, 74, 64, 0.25)', border: 'none', color: '#ff8a82', borderRadius: 8, padding: 8, cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <PillButton
                  type="button"
                  onClick={() => {
                    setEditingCriteriaList([
                      ...editingCriteriaList,
                      { id: 'crit-' + Date.now(), label: `Criterion ${editingCriteriaList.length + 1}`, maxPoints: 10 }
                    ]);
                  }}
                  variant="secondary"
                >
                  <Plus size={16} /> Add Criterion Metric
                </PillButton>

                <PillButton type="submit" variant="primary">
                  <Save size={16} /> Save Point Table ({editingCriteriaList.reduce((sum, c) => sum + Number(c.maxPoints || 0), 0)} Total Max Pts)
                </PillButton>
              </div>
            </form>
          </div>

          {/* MASTER SYSTEM PASSWORDS PANEL */}
          <div className="glass-panel" style={{ maxWidth: 540, padding: 28 }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>System Master Passwords</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Fallback master passwords for root emergency access.
            </p>
            <form onSubmit={handleSaveSystemPasswords} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Fallback Admin Master Password
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={newAdminPass}
                  onChange={e => setNewAdminPass(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Fallback Manager Master Password
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={newManagerPass}
                  onChange={e => setNewManagerPass(e.target.value)}
                  required
                />
              </div>
              <PillButton type="submit" variant="primary" style={{ marginTop: 8 }}>
                <Save size={16} /> Save Master Passwords
              </PillButton>
            </form>
          </div>

          {/* CREATE / EDIT USER MODAL */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 20 }}>
                  {editingId ? 'Edit User Credentials & Access Levels' : 'Create New User Access Card'}
                </h3>
                <form onSubmit={handleSaveUserAccount} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>User Full Name *</label>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="e.g. Akhil Adithyan / Staff Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>User ID / Username *</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="e.g. Akhil or staff1"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Password *</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="e.g. Ak1002hil"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* ACCESS LEVEL SELECTION */}
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                      Grant Access Levels / Permissions *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                      {[
                        { level: 'admin', label: '🛡️ Admin (/admin)', desc: 'Full event & user management' },
                        { level: 'manager', label: '📊 Manager (/manager)', desc: 'Attendance & team editing' },
                        { level: 'judge', label: '⚖️ Judge (/judge)', desc: 'Live scoring matrix' },
                        { level: 'scan', label: '📷 Scanner (/scan)', desc: 'Mobile QR check-in portal' }
                      ].map(item => {
                        const isChecked = selectedAccessLevels.includes(item.level);
                        return (
                          <label key={item.level} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '0.86rem' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              style={{ accentColor: '#22c55e', width: 16, height: 16, marginTop: 2 }}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedAccessLevels([...selectedAccessLevels, item.level]);
                                } else {
                                  setSelectedAccessLevels(selectedAccessLevels.filter(l => l !== item.level));
                                }
                              }}
                            />
                            <div>
                              <strong style={{ color: '#fff', display: 'block' }}>{item.label}</strong>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* EVENT PERMISSIONS */}
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                      Assign Permitted Events for Judging
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                      {events.map(evt => {
                        const isChecked = selectedAssignedEvents.includes(evt.id);
                        return (
                          <label key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.88rem' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              style={{ accentColor: '#22c55e', width: 16, height: 16 }}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedAssignedEvents([...selectedAssignedEvents, evt.id]);
                                } else {
                                  setSelectedAssignedEvents(selectedAssignedEvents.filter(id => id !== evt.id));
                                }
                              }}
                            />
                            <span>{evt.title} <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>({evt.category})</span></span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                    <PillButton type="button" onClick={() => setShowModal(false)} variant="secondary">Cancel</PillButton>
                    <PillButton type="submit" variant="primary">Save Access Card</PillButton>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* RESET JUDGING STATE CONFIRMATION MODAL */}
          {showResetJudgingModal && (
            <div className="modal-overlay" onClick={() => setShowResetJudgingModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <RotateCcw size={22} color="#fbbf24" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Reset Judging State</h3>
                    <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>Testing & Evaluation Reset</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                  ⚠️ This will PERMANENTLY clear all judge evaluation scores, total points, locked judging statuses, and revealed winner places across all events.
                  <br /><br />
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ Registered teams and user access accounts will be kept.</span>
                </p>

                {resetJudgingError && (
                  <div style={{
                    background: 'rgba(239, 74, 64, 0.15)',
                    border: '1px solid rgba(239, 74, 64, 0.4)',
                    color: '#ff8a82',
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: '0.88rem',
                    marginBottom: 16
                  }}>
                    {resetJudgingError}
                  </div>
                )}

                <form onSubmit={handleConfirmResetJudging} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Enter Password to Confirm Action *
                    </label>
                    <input
                      type="password"
                      className="glass-input"
                      placeholder="Super Admin or Admin Password"
                      value={confirmJudgingPassInput}
                      onChange={e => setConfirmJudgingPassInput(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                    <PillButton type="button" onClick={() => setShowResetJudgingModal(false)} variant="secondary">
                      Cancel
                    </PillButton>
                    <PillButton type="submit" variant="danger" style={{ background: '#d97706', border: 'none', color: '#fff' }}>
                      Confirm Reset
                    </PillButton>
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
                    <span style={{ fontSize: '0.8rem', color: '#ff8a82', fontWeight: 600 }}>Manager / Admin Password Required</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                  You are about to delete team <strong style={{ color: '#fff' }}>"{teamToDelete.teamName}" ({teamToDelete.id})</strong>.
                  <br /><br />
                  <span style={{ color: '#ff8a82', fontWeight: 600 }}>⚠️ This action will permanently remove this 1 team from the database.</span>
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
                      placeholder="Enter Manager or Admin Password"
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

export default Pass;
