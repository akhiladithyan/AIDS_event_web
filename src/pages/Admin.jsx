import React, { useState, useEffect } from 'react';
import { storeService } from '../services/store';
import { isSupabaseConfigured } from '../services/supabase';
import { ShieldCheck, Plus, Edit, Trash2, Download, Database, Key, CheckCircle, Lock, Save, RefreshCw, ChevronDown, ChevronUp, Users } from 'lucide-react';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passError, setPassError] = useState('');
  
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [activeTab, setActiveTab] = useState('events');
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  // New Event Form Modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technical');
  const [teamSize, setTeamSize] = useState('2-4 Members');
  const [venue, setVenue] = useState('');
  const [time, setTime] = useState('');
  const [prize, setPrize] = useState('');
  const [description, setDescription] = useState('');
  const [rulesStr, setRulesStr] = useState('');
  const [image, setImage] = useState('');

  // Passwords Form State
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newManagerPass, setNewManagerPass] = useState('');

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('neura_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      loadAdminData();
    }
  }, []);

  const loadAdminData = async () => {
    const evts = await storeService.getEvents();
    const tms = await storeService.getTeams();
    const pass = await storeService.getPasswords();
    setEvents(evts);
    setTeams(tms);
    setPasswords(pass);
    setNewAdminPass(pass.admin);
    setNewManagerPass(pass.manager);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const curPass = await storeService.getPasswords();
    if (password === curPass.admin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('neura_admin_auth', 'true');
      setPassError('');
      await loadAdminData();
    } else {
      setPassError('Incorrect Admin Password!');
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const rules = rulesStr.split('\n').filter(r => r.trim().length > 0);
    const eventObj = {
      id: editingEventId || undefined,
      title,
      category,
      teamSize,
      venue,
      time,
      prize,
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
  };

  const handleEditClick = (evt) => {
    setEditingEventId(evt.id);
    setTitle(evt.title);
    setCategory(evt.category);
    setTeamSize(evt.teamSize);
    setVenue(evt.venue);
    setTime(evt.time);
    setPrize(evt.prize);
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

  const handleSavePasswords = async (e) => {
    e.preventDefault();
    await storeService.updatePasswords({
      admin: newAdminPass,
      manager: newManagerPass
    });
    alert('System passwords updated successfully!');
    await loadAdminData();
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
    let csv = 'Team ID,Team Name,Event Title,Leader Name,Leader Phone,Member Name,User ID,Role\n';
    teams.forEach(t => {
      t.members.forEach(m => {
        csv += `"${t.id}","${t.teamName}","${t.eventTitle}","${t.leaderName}","${t.leaderPhone}","${m.name}","${m.userId}","${m.role}"\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neura_registered_students_${Date.now()}.csv`;
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
            Enter the admin security password to alter events and database records.
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
              placeholder="Admin Password (Default: admin123)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn-primary" style={{ padding: '14px' }}>
              Unlock Admin Portal <Lock size={16} />
            </button>
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
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Event & Database Manager</h2>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleDownloadJSON} className="btn-secondary">
                <Download size={16} /> Export JSON Backup
              </button>
              <button onClick={handleDownloadCSV} className="btn-primary">
                <Download size={16} /> Download CSV Roster
              </button>
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
              <button
                onClick={() => setActiveTab('events')}
                className={activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Manage Events ({events.length})
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={activeTab === 'teams' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Registered Teams ({teams.length})
              </button>
              <button
                onClick={() => setActiveTab('passwords')}
                className={activeTab === 'passwords' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Passwords
              </button>
            </div>
          </div>

          {/* TAB 1: MANAGE EVENTS */}
          {activeTab === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Events Catalog</h3>
                <button
                  onClick={() => {
                    setEditingEventId(null);
                    setTitle('');
                    setCategory('Technical');
                    setTeamSize('2-4 Members');
                    setVenue('');
                    setTime('');
                    setPrize('');
                    setDescription('');
                    setRulesStr('');
                    setImage('');
                    setShowEventModal(true);
                  }}
                  className="btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                >
                  <Plus size={16} /> Add New Event
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {events.map(evt => (
                  <div key={evt.id} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge-purple">{evt.category}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleEditClick(evt)}
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 8, padding: 6, cursor: 'pointer' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(evt.id)}
                          style={{ background: 'rgba(239, 74, 64, 0.25)', border: 'none', color: '#ff8a82', borderRadius: 8, padding: 6, cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{evt.title}</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {evt.description}
                    </p>

                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>Prize: <strong style={{ color: '#ef4a40' }}>{evt.prize}</strong></div>
                      <div>Venue: <strong>{evt.venue}</strong></div>
                      <div>Time: <strong>{evt.time}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: REGISTERED TEAMS */}
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
                    <th style={{ padding: '12px 16px' }}>Action</th>
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
                          <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                            <button
                              onClick={async () => {
                                if (confirm(`Remove team ${t.teamName}?`)) {
                                  await storeService.deleteTeam(t.id);
                                  await loadAdminData();
                                }
                              }}
                              style={{ background: 'rgba(239,74,64,0.2)', border: 'none', color: '#ff8a82', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>

                        {/* SLIDE DOWN PERSON DETAILS BREAKDOWN */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} style={{ padding: '16px 20px', background: 'rgba(12, 8, 24, 0.7)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Users size={18} color="#4ade80" />
                                <strong style={{ fontSize: '1rem', color: '#fff' }}>Detailed Person Roster ({t.teamName})</strong>
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
                                      <div>Password: <code style={{ color: '#fbbf24' }}>{m.password}</code></div>
                                      <div>QR Token: <span style={{ fontSize: '0.72rem', wordBreak: 'break-all', opacity: 0.8 }}>{m.qrToken}</span></div>
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

          {/* TAB 3: PASSWORDS CONFIG */}
          {activeTab === 'passwords' && (
            <div className="glass-panel" style={{ maxWidth: 500, padding: 32 }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 }}>System Passwords</h3>
              <form onSubmit={handleSavePasswords} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    /admin Access Password
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
                    /manager Access Password
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    value={newManagerPass}
                    onChange={e => setNewManagerPass(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
                  <Save size={16} /> Save Passwords
                </button>
              </form>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Category</label>
                      <input type="text" className="glass-input" value={category} onChange={e => setCategory(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Team Size</label>
                      <input type="text" className="glass-input" value={teamSize} onChange={e => setTeamSize(e.target.value)} required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Venue</label>
                      <input type="text" className="glass-input" value={venue} onChange={e => setVenue(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Timing</label>
                      <input type="text" className="glass-input" value={time} onChange={e => setTime(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Prize</label>
                      <input type="text" className="glass-input" value={prize} onChange={e => setPrize(e.target.value)} required />
                    </div>
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
                    <button type="button" onClick={() => setShowEventModal(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save Event</button>
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
