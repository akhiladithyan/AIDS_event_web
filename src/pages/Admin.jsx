import React, { useState, useEffect } from 'react';
import { storeService } from '../services/store';
import { isSupabaseConfigured } from '../services/supabase';
import PillButton from '../components/PillButton';
import { ShieldCheck, Plus, Edit, Trash2, Download, Database, Lock, ChevronDown, ChevronUp, Users } from 'lucide-react';

const Admin = () => {
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passError, setPassError] = useState('');
  
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('events');
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  // New Event Form Modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technical');
  const [teamSize, setTeamSize] = useState('1 Member (Solo)');
  const [maxTeams, setMaxTeams] = useState(20);
  const [venue, setVenue] = useState('');
  const [time, setTime] = useState('');
  const [hasCashPrize, setHasCashPrize] = useState(true);
  const [prizeAmount, setPrizeAmount] = useState('');
  const [description, setDescription] = useState('');
  const [rulesStr, setRulesStr] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    // Mandatory password lock: Require password entry on every page visit
    setIsAuthenticated(false);
  }, []);

  const loadAdminData = async () => {
    const evts = await storeService.getEvents();
    const tms = await storeService.getTeams();
    setEvents(evts);
    setTeams(tms);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await storeService.verifyUserAccess({ username: usernameInput, password, requiredLevel: 'admin' });
      if (res.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('neura_admin_auth', 'true');
        setPassError('');
        await loadAdminData();
      } else {
        setPassError(res.error || 'Access Denied! Admin permissions required.');
      }
    } catch (err) {
      setPassError(err.message || 'Authentication error');
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const rules = rulesStr.split('\n').filter(r => r.trim().length > 0);
      const computedPrize = hasCashPrize
        ? (prizeAmount.trim() ? (prizeAmount.trim().startsWith('₹') ? prizeAmount.trim() : `₹${prizeAmount.trim()}`) : 'Cash Prize')
        : 'No Cash Prize';

      const eventObj = {
        id: editingEventId || undefined,
        title,
        category,
        teamSize,
        maxTeams: Number(maxTeams || 20),
        venue,
        time,
        prize: computedPrize,
        hasCashPrize,
        prizeAmount: hasCashPrize ? prizeAmount : '',
        description,
        rules,
        image: image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop'
      };

      if (editingEventId) {
        await storeService.updateEvent(eventObj);
      } else {
        await storeService.addEvent(eventObj);
      }

      setShowEventModal(false);
      await loadAdminData();
      alert(`Event "${title}" saved successfully!`);
    } catch (err) {
      console.error("Save event error:", err);
      alert(err.message || "Failed to save event changes.");
    }
  };

  const handleEditClick = (evt) => {
    setEditingEventId(evt.id);
    setTitle(evt.title);
    setCategory(evt.category === 'Non-Technical' || evt.category === 'Non Technical' ? 'Non-Technical' : 'Technical');
    setTeamSize(evt.teamSize);
    setMaxTeams(evt.maxTeams || 20);
    setVenue(evt.venue);
    setTime(evt.time);

    const isNoPrize = evt.hasCashPrize === false ||
      (evt.prize && (evt.prize.toLowerCase().includes('no cash') || (evt.prize.toLowerCase().includes('certificate') && !evt.prize.includes('₹'))));

    if (isNoPrize) {
      setHasCashPrize(false);
      setPrizeAmount('');
    } else {
      setHasCashPrize(true);
      if (evt.prizeAmount) {
        setPrizeAmount(evt.prizeAmount);
      } else {
        const cleaned = (evt.prize || '').replace(/^₹\s*/, '');
        setPrizeAmount(cleaned);
      }
    }

    setDescription(evt.description);
    setRulesStr(evt.rules ? evt.rules.join('\n') : '');
    setImage(evt.image || '');
    setShowEventModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await storeService.deleteEvent(id);
      await loadAdminData();
    }
  };

  const handleDownloadJSON = async () => {
    const jsonStr = await storeService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neura_backup_${Date.now()}.json`;
    a.click();
  };

  const handleDownloadCSV = () => {
    let csv = 'Event Title,Team No,Team ID,Team Name,College,Department,Participant Name,Role,User ID,Phone,Email,Registration Date\n';
    teams.forEach(t => {
      const regDate = t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A';
      (t.members || []).forEach(m => {
        csv += `"${t.eventTitle}","${t.teamNo || 1}","${t.id}","${t.teamName}","${t.college || 'N/A'}","${t.department || 'N/A'}","${m.name}","${m.role}","${m.userId}","${t.leaderPhone || ''}","${t.leaderEmail || ''}","${regDate}"\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neura_registered_students_complete_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 20px' }}>
      {!isAuthenticated ? (
        /* ADMIN LOGIN MODAL */
        <div className="glass-panel" style={{ maxWidth: 440, margin: '60px auto', padding: 36, textAlign: 'center' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(239, 74, 64, 0.25)',
            border: '1px solid rgba(239, 74, 64, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <ShieldCheck size={30} color="#ef4a40" />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admin Authentication</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, marginBottom: 24 }}>
            Enter the admin security password to alter events and view records.
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
              Unlock Admin Portal <Lock size={16} />
            </PillButton>
          </form>
        </div>
      ) : (
        /* ADMIN DASHBOARD CONSOLE */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <span className="badge-coral" style={{ marginBottom: 6, display: 'inline-block' }}>
                System Administration
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Event & Roster Manager</h2>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <PillButton onClick={handleDownloadJSON} variant="secondary">
                <Download size={16} /> Export JSON Backup
              </PillButton>
              <PillButton onClick={handleDownloadCSV} variant="primary">
                <Download size={16} /> Download CSV Roster
              </PillButton>
            </div>
          </div>

          {/* Status Bar */}
          <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Database size={20} color="#6654b5" />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Database Status:</strong>{' '}
                <span style={{ color: isSupabaseConfigured ? '#4ade80' : '#a395f3', fontWeight: 600 }}>
                  {isSupabaseConfigured ? 'Live Supabase Cloud Connected' : 'Local Storage Engine Active (Full Local Mode)'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <PillButton
                onClick={() => setActiveTab('events')}
                variant={activeTab === 'events' ? 'active' : 'secondary'}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Manage Events ({events.length})
              </PillButton>
              <PillButton
                onClick={() => setActiveTab('teams')}
                variant={activeTab === 'teams' ? 'active' : 'secondary'}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Registered Teams ({teams.length})
              </PillButton>
            </div>
          </div>

          {/* TAB 1: MANAGE EVENTS */}
          {activeTab === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Events Catalog</h3>
                <PillButton
                  onClick={() => {
                    setEditingEventId(null);
                    setTitle('');
                    setCategory('Technical');
                    setTeamSize('1 Member (Solo)');
                    setVenue('');
                    setTime('');
                    setHasCashPrize(true);
                    setPrizeAmount('');
                    setDescription('');
                    setRulesStr('');
                    setImage('');
                    setShowEventModal(true);
                  }}
                  variant="primary"
                >
                  <Plus size={16} /> Add New Event
                </PillButton>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {events.map(evt => (
                  <div key={evt.id} className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <span className={evt.category === 'Technical' ? 'badge-purple' : 'badge-pink'} style={{ fontSize: '0.75rem', marginBottom: 6, display: 'inline-block' }}>
                            {evt.category}
                          </span>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{evt.title}</h4>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600, background: 'rgba(74, 222, 128, 0.1)', padding: '4px 8px', borderRadius: 8 }}>
                          {evt.teamSize}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {evt.description}
                      </p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                        <div><strong>Venue:</strong> {evt.venue}</div>
                        <div><strong>Timing:</strong> {evt.time}</div>
                        <div><strong>Prize:</strong> <span style={{ color: '#fbbf24', fontWeight: 600 }}>{evt.prize}</span></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
                      <PillButton onClick={() => handleEditClick(evt)} variant="secondary" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}>
                        <Edit size={14} /> Edit
                      </PillButton>
                      <PillButton onClick={() => handleDeleteClick(evt.id)} variant="danger" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}>
                        <Trash2 size={14} /> Delete
                      </PillButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: REGISTERED TEAMS (VIEW ONLY) */}
          {activeTab === 'teams' && (
            <div className="glass-panel" style={{ padding: 24, overflowX: 'auto' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16 }}>All Registered Teams</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-subtle)' }}>
                    <th style={{ padding: '12px 16px' }}>Team ID</th>
                    <th style={{ padding: '12px 16px' }}>Team Name</th>
                    <th style={{ padding: '12px 16px' }}>Event</th>
                    <th style={{ padding: '12px 16px' }}>Leader</th>
                    <th style={{ padding: '12px 16px' }}>Members</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(t => {
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
                          <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#ef4a40' }}>{t.id}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {isExpanded ? <ChevronUp size={16} color="#a395f3" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
                              {t.teamName}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#a395f3' }}>{t.eventTitle}</td>
                          <td style={{ padding: '14px 16px' }}>
                            {t.leaderName} <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>{t.leaderPhone}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className="badge-purple" style={{ fontSize: '0.75rem' }}>
                              {t.members.length} Members
                            </span>
                          </td>
                        </tr>

                        {/* SLIDE DOWN PERSON DETAILS BREAKDOWN */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} style={{ padding: '16px 20px', background: 'rgba(12, 8, 24, 0.7)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Users size={18} color="#4ade80" />
                                <strong style={{ fontSize: '1rem', color: '#fff' }}>Registered Roster ({t.teamName})</strong>
                              </div>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                                {t.members.map((m, idx) => (
                                  <div key={m.userId || idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                      <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{m.name}</strong>
                                      <span className={m.role === 'Leader' ? 'badge-purple' : 'badge-pink'} style={{ fontSize: '0.72rem' }}>
                                        {m.role}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                      <div>User ID: <code style={{ color: '#4ade80' }}>{m.userId}</code></div>
                                    </div>
                                  </div>
                                ))}
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
          )}

          {/* EDIT / CREATE EVENT MODAL */}
          {showEventModal && (
            <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 20 }}>
                  {editingEventId ? 'Edit Event Details' : 'Add New Event'}
                </h3>
                <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Event Title *</label>
                    <input type="text" className="glass-input" value={title} onChange={e => setTitle(e.target.value)} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Category *</label>
                      <select
                        className="glass-input"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        required
                        style={{ background: '#150d2e', color: '#fff' }}
                      >
                        <option value="Technical" style={{ background: '#150d2e' }}>Technical</option>
                        <option value="Non-Technical" style={{ background: '#150d2e' }}>Non-Technical</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Team Size *</label>
                      <select
                        className="glass-input"
                        value={teamSize}
                        onChange={e => setTeamSize(e.target.value)}
                        required
                        style={{ background: '#150d2e', color: '#fff' }}
                      >
                        <option value="1 Member (Solo)" style={{ background: '#150d2e' }}>1 Member (Solo)</option>
                        <option value="2 Members" style={{ background: '#150d2e' }}>2 Members</option>
                        <option value="3 Members" style={{ background: '#150d2e' }}>3 Members</option>
                        <option value="4 Members" style={{ background: '#150d2e' }}>4 Members</option>
                        <option value="5 Members" style={{ background: '#150d2e' }}>5 Members</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Available Spots (Max Teams)</label>
                      <input type="number" min="1" max="100" className="glass-input" value={maxTeams} onChange={e => setMaxTeams(e.target.value)} required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: hasCashPrize ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Venue</label>
                      <input type="text" className="glass-input" value={venue} onChange={e => setVenue(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Timing</label>
                      <input type="text" className="glass-input" value={time} onChange={e => setTime(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Cash Prize?</label>
                      <select
                        className="glass-input"
                        value={hasCashPrize ? 'yes' : 'no'}
                        onChange={e => {
                          const val = e.target.value === 'yes';
                          setHasCashPrize(val);
                          if (!val) setPrizeAmount('');
                        }}
                        style={{ background: '#150d2e', color: '#fff' }}
                      >
                        <option value="yes" style={{ background: '#150d2e' }}>Yes (Has Cash Prize)</option>
                        <option value="no" style={{ background: '#150d2e' }}>No (Certificates / Trophies Only)</option>
                      </select>
                    </div>
                    {hasCashPrize && (
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Prize Amount (₹)</label>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="e.g. 15,000"
                          value={prizeAmount}
                          onChange={e => setPrizeAmount(e.target.value)}
                          required={hasCashPrize}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Description</label>
                    <textarea className="glass-input" rows={3} value={description} onChange={e => setDescription(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Rules (One per line)</label>
                    <textarea className="glass-input" rows={3} value={rulesStr} onChange={e => setRulesStr(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                    <PillButton type="button" onClick={() => setShowEventModal(false)} variant="secondary">Cancel</PillButton>
                    <PillButton type="submit" variant="primary">Save Event</PillButton>
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

export default Admin;
