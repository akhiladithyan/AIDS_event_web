import { supabase, isSupabaseConfigured } from './supabase';

const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    title: 'Neural Hackathon 2026',
    category: 'Technical',
    teamSize: '2-4 Members',
    venue: 'AI Lab 3 (2nd Floor)',
    time: '10:00 AM - 04:00 PM',
    prize: '₹15,000 + Trophy',
    description: 'Build innovative AI solutions and LLM-powered applications within 6 hours. Problem statements will be released on spot.',
    rules: [
      'Bring your own laptops and required software installed.',
      'API keys will be provided for select models.',
      'Plagiarism or pre-built complete apps will lead to instant disqualification.'
    ],
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'evt-2',
    title: 'Data Science Symposium',
    category: 'Paper Presentation',
    teamSize: '1-2 Members',
    venue: 'Auditorium Hall B',
    time: '11:00 AM - 01:30 PM',
    prize: '₹10,000',
    description: 'Present research papers or case studies on Machine Learning, Computer Vision, NLP, or Big Data Analytics.',
    rules: [
      'Presentation duration: 8 mins + 2 mins Q&A.',
      'PPT must follow standard IEEE slide guidelines.',
      'Hard copy of abstract to be submitted before presentation.'
    ],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'evt-3',
    title: 'Prompt Matrix Challenge',
    category: 'AI Skills',
    teamSize: 'Individual / Pair',
    venue: 'DS Lab 1',
    time: '02:00 PM - 03:30 PM',
    prize: '₹7,500',
    description: 'Test your prompt engineering skills! Generate precise AI images, code, and complex outputs under tight latency constraints.',
    rules: [
      'Only specified LLM interfaces permitted.',
      'Evaluation based on prompt efficiency, output accuracy, and creative framing.'
    ],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'evt-4',
    title: 'Algorithmic Duel (Speed Coding)',
    category: 'Coding',
    teamSize: 'Individual',
    venue: 'Computer Center A',
    time: '10:30 AM - 12:30 PM',
    prize: '₹8,000',
    description: 'Head-to-head competitive coding battle testing algorithmic logic, data structures, and optimized execution time.',
    rules: [
      'Languages allowed: Python, C++, Java.',
      'Multiple rounds with increasing difficulty.'
    ],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop'
  }
];

const INITIAL_JUDGES = [
  { id: 'jd-1', username: 'judge1', password: 'j1', name: 'Dr. R. Vignesh (AI Expert)', assignedEvents: ['evt-1', 'evt-2', 'evt-3', 'evt-4'] },
  { id: 'jd-2', username: 'judge2', password: 'j2', name: 'Prof. S. Anitha (Data Scientist)', assignedEvents: ['evt-1', 'evt-2', 'evt-3', 'evt-4'] }
];

const INITIAL_PASSWORDS = {
  admin: 'admin123',
  manager: 'manager123'
};

const INITIAL_TEAMS = [
  {
    id: 'TM-9081',
    teamName: 'Cyber Neurons',
    eventId: 'evt-1',
    eventTitle: 'Neural Hackathon 2026',
    leaderId: 'STD-101',
    leaderName: 'Akhil Adithyan',
    leaderPhone: '+91 9876543210',
    leaderEmail: 'akhil@example.com',
    members: [
      { userId: 'STD-101', name: 'Akhil Adithyan', password: 'pass-101', role: 'Leader', qrToken: 'QR-STD-101-TM-9081' },
      { userId: 'STD-102', name: 'Priya Sharma', password: 'pass-102', role: 'Member', qrToken: 'QR-STD-102-TM-9081' },
      { userId: 'STD-103', name: 'Rohan Verma', password: 'pass-103', role: 'Member', qrToken: 'QR-STD-103-TM-9081' }
    ],
    qrCodeToken: 'QR-TM-9081',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_ATTENDANCE = {
  'TM-9081': { present: true, markedAt: new Date().toISOString(), markedBy: 'Manager' }
};

// Storage Helpers
const getStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Storage read error:', e);
    return fallback;
  }
};

const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error:', e);
  }
};

// Mappers for DB Snake Case <-> JS Camel Case
const mapEventFromDb = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  teamSize: row.team_size,
  venue: row.venue,
  time: row.time,
  prize: row.prize,
  description: row.description,
  rules: row.rules || [],
  image: row.image,
  createdAt: row.created_at
});

const mapEventToDb = (evt) => ({
  id: evt.id,
  title: evt.title,
  category: evt.category,
  team_size: evt.teamSize,
  venue: evt.venue,
  time: evt.time,
  prize: evt.prize,
  description: evt.description,
  rules: evt.rules || [],
  image: evt.image
});

const mapTeamFromDb = (row) => ({
  id: row.id,
  teamName: row.team_name,
  eventId: row.event_id,
  eventTitle: row.event_title,
  leaderId: row.leader_id,
  leaderName: row.leader_name,
  leaderPhone: row.leader_phone,
  leaderEmail: row.leader_email,
  members: row.members || [],
  qrCodeToken: row.qr_code_token,
  createdAt: row.created_at
});

const mapTeamToDb = (team) => ({
  id: team.id,
  team_name: team.teamName,
  event_id: team.eventId,
  event_title: team.eventTitle,
  leader_id: team.leaderId,
  leader_name: team.leaderName,
  leader_phone: team.leaderPhone,
  leader_email: team.leaderEmail,
  members: team.members || [],
  qr_code_token: team.qrCodeToken
});

const mapJudgeFromDb = (row) => ({
  id: row.id,
  username: row.username,
  password: row.password,
  name: row.name,
  assignedEvents: row.assigned_events || []
});

const mapJudgeToDb = (j) => ({
  id: j.id,
  username: j.username,
  password: j.password,
  name: j.name,
  assigned_events: j.assignedEvents || []
});

export const storeService = {
  // 1. EVENTS
  async getEvents() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          const events = data.map(mapEventFromDb);
          setStorage('neura_events', events);
          return events;
        }
        if (!error && data && data.length === 0) {
          for (const evt of INITIAL_EVENTS) {
            await supabase.from('events').insert([mapEventToDb(evt)]);
          }
          setStorage('neura_events', INITIAL_EVENTS);
          return INITIAL_EVENTS;
        }
      } catch (e) {
        console.warn('Supabase fetch events error:', e);
      }
    }
    return getStorage('neura_events', INITIAL_EVENTS);
  },

  async addEvent(event) {
    const newEvent = { ...event, id: event.id || 'evt-' + Date.now() };
    const localEvents = getStorage('neura_events', INITIAL_EVENTS);
    localEvents.push(newEvent);
    setStorage('neura_events', localEvents);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('events').insert([mapEventToDb(newEvent)]);
      } catch (e) {
        console.warn('Supabase add event error:', e);
      }
    }
    return newEvent;
  },

  async updateEvent(updatedEvent) {
    const localEvents = getStorage('neura_events', INITIAL_EVENTS).map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setStorage('neura_events', localEvents);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('events').update(mapEventToDb(updatedEvent)).eq('id', updatedEvent.id);
      } catch (e) {
        console.warn('Supabase update event error:', e);
      }
    }
  },

  async deleteEvent(id) {
    const localEvents = getStorage('neura_events', INITIAL_EVENTS).filter(e => e.id !== id);
    setStorage('neura_events', localEvents);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('events').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete event error:', e);
      }
    }
  },

  // 2. PASSWORDS
  async getPasswords() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('passwords').select('*').eq('id', 'system').single();
        if (!error && data) {
          const pass = { admin: data.admin, manager: data.manager };
          setStorage('neura_passwords', pass);
          return pass;
        } else {
          await supabase.from('passwords').upsert([{ id: 'system', admin: 'admin123', manager: 'manager123' }]);
        }
      } catch (e) {
        console.warn('Supabase fetch passwords error:', e);
      }
    }
    return getStorage('neura_passwords', INITIAL_PASSWORDS);
  },

  async updatePasswords(passwords) {
    setStorage('neura_passwords', passwords);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('passwords').upsert([{ id: 'system', admin: passwords.admin, manager: passwords.manager }]);
      } catch (e) {
        console.warn('Supabase update passwords error:', e);
      }
    }
  },

  // 3. TEAMS & STUDENTS
  async getTeams() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          const teams = data.map(mapTeamFromDb);
          setStorage('neura_teams', teams);
          return teams;
        }
        if (!error && data && data.length === 0) {
          for (const t of INITIAL_TEAMS) {
            await supabase.from('teams').insert([mapTeamToDb(t)]);
          }
          setStorage('neura_teams', INITIAL_TEAMS);
          return INITIAL_TEAMS;
        }
      } catch (e) {
        console.warn('Supabase fetch teams error:', e);
      }
    }
    return getStorage('neura_teams', INITIAL_TEAMS);
  },

  async registerTeam({ teamName, eventId, leaderName, leaderPhone, leaderEmail, memberNames = [] }) {
    const events = await this.getEvents();
    const targetEvent = events.find(e => e.id === eventId) || { title: 'AI & DS Event' };
    const teamId = 'TM-' + Math.floor(1000 + Math.random() * 9000);
    const qrCodeToken = `QR-${teamId}`;

    const leaderUserId = 'STD-' + Math.floor(100 + Math.random() * 900);
    const leaderPassword = 'pass-' + Math.floor(100 + Math.random() * 900);

    const members = [
      {
        userId: leaderUserId,
        name: leaderName,
        password: leaderPassword,
        role: 'Leader',
        qrToken: `QR-${leaderUserId}-${teamId}`
      }
    ];

    memberNames.filter(name => name.trim().length > 0).forEach((name) => {
      const uId = 'STD-' + Math.floor(100 + Math.random() * 900);
      const uPass = 'pass-' + Math.floor(100 + Math.random() * 900);
      members.push({
        userId: uId,
        name: name.trim(),
        password: uPass,
        role: 'Member',
        qrToken: `QR-${uId}-${teamId}`
      });
    });

    const newTeam = {
      id: teamId,
      teamName,
      eventId,
      eventTitle: targetEvent.title,
      leaderId: leaderUserId,
      leaderName,
      leaderPhone,
      leaderEmail,
      members,
      qrCodeToken,
      createdAt: new Date().toISOString()
    };

    const teams = getStorage('neura_teams', INITIAL_TEAMS);
    teams.push(newTeam);
    setStorage('neura_teams', teams);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('teams').insert([mapTeamToDb(newTeam)]);
      } catch (e) {
        console.warn('Supabase register team error:', e);
      }
    }

    return newTeam;
  },

  async deleteTeam(teamId) {
    const teams = getStorage('neura_teams', INITIAL_TEAMS).filter(t => t.id !== teamId);
    setStorage('neura_teams', teams);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('teams').delete().eq('id', teamId);
      } catch (e) {
        console.warn('Supabase delete team error:', e);
      }
    }
  },

  async updateTeam(updatedTeam) {
    const teams = getStorage('neura_teams', INITIAL_TEAMS).map(t => t.id === updatedTeam.id ? updatedTeam : t);
    setStorage('neura_teams', teams);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('teams').update(mapTeamToDb(updatedTeam)).eq('id', updatedTeam.id);
      } catch (e) {
        console.warn('Supabase update team error:', e);
      }
    }
  },

  // 4. ATTENDANCE
  async getAttendance() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('attendance').select('*');
        if (!error && data) {
          const attMap = {};
          data.forEach(row => {
            attMap[row.team_id] = {
              present: row.present,
              markedAt: row.marked_at,
              markedBy: row.marked_by
            };
          });
          setStorage('neura_attendance', attMap);
          return attMap;
        }
      } catch (e) {
        console.warn('Supabase fetch attendance error:', e);
      }
    }
    return getStorage('neura_attendance', INITIAL_ATTENDANCE);
  },

  async markAttendance(teamOrUserToken, markedBy = 'Manager') {
    const attendance = await this.getAttendance();
    const teams = await this.getTeams();
    
    let targetTeam = teams.find(t => t.id === teamOrUserToken || t.qrCodeToken === teamOrUserToken);
    
    if (!targetTeam) {
      for (const t of teams) {
        if (t.members.some(m => m.qrToken === teamOrUserToken || m.userId === teamOrUserToken)) {
          targetTeam = t;
          break;
        }
      }
    }

    if (!targetTeam) {
      return { success: false, message: 'Invalid QR Code or Team Code.' };
    }

    const markedAt = new Date().toISOString();
    attendance[targetTeam.id] = {
      present: true,
      markedAt,
      markedBy
    };

    setStorage('neura_attendance', attendance);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('attendance').upsert([{
          team_id: targetTeam.id,
          present: true,
          marked_at: markedAt,
          marked_by: markedBy
        }]);
      } catch (e) {
        console.warn('Supabase mark attendance error:', e);
      }
    }

    return { success: true, team: targetTeam, message: `Attendance marked for Team ${targetTeam.teamName}!` };
  },

  async toggleAttendance(teamId) {
    const attendance = await this.getAttendance();
    const current = attendance[teamId]?.present || false;
    const markedAt = new Date().toISOString();
    const newPresentState = !current;

    attendance[teamId] = {
      present: newPresentState,
      markedAt,
      markedBy: 'Manager Toggle'
    };
    setStorage('neura_attendance', attendance);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('attendance').upsert([{
          team_id: teamId,
          present: newPresentState,
          marked_at: markedAt,
          marked_by: 'Manager Toggle'
        }]);
      } catch (e) {
        console.warn('Supabase toggle attendance error:', e);
      }
    }

    return attendance[teamId];
  },

  // 5. JUDGES & SCORES
  async getJudges() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('judges').select('*');
        if (!error && data && data.length > 0) {
          const judges = data.map(mapJudgeFromDb);
          setStorage('neura_judges', judges);
          return judges;
        }
        if (!error && data && data.length === 0) {
          for (const j of INITIAL_JUDGES) {
            await supabase.from('judges').insert([mapJudgeToDb(j)]);
          }
          setStorage('neura_judges', INITIAL_JUDGES);
          return INITIAL_JUDGES;
        }
      } catch (e) {
        console.warn('Supabase fetch judges error:', e);
      }
    }
    return getStorage('neura_judges', INITIAL_JUDGES);
  },

  async addJudge(judge) {
    const newJudge = { ...judge, id: judge.id || 'jd-' + Date.now() };
    const judges = getStorage('neura_judges', INITIAL_JUDGES);
    judges.push(newJudge);
    setStorage('neura_judges', judges);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('judges').insert([mapJudgeToDb(newJudge)]);
      } catch (e) {
        console.warn('Supabase add judge error:', e);
      }
    }
    return newJudge;
  },

  async getScores() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('scores').select('*');
        if (!error && data) {
          const scoresMap = {};
          data.forEach(row => {
            const key = `${row.event_id}_${row.team_id}_${row.judge_id}`;
            scoresMap[key] = {
              id: row.id,
              eventId: row.event_id,
              teamId: row.team_id,
              judgeId: row.judge_id,
              criteria: row.criteria,
              totalScore: Number(row.total_score || 0),
              feedback: row.feedback,
              updatedAt: row.updated_at
            };
          });
          setStorage('neura_scores', scoresMap);
          return scoresMap;
        }
      } catch (e) {
        console.warn('Supabase fetch scores error:', e);
      }
    }
    return getStorage('neura_scores', {});
  },

  async saveScore({ eventId, teamId, judgeId, criteria, feedback }) {
    const scores = getStorage('neura_scores', {});
    const key = `${eventId}_${teamId}_${judgeId}`;
    const scoreId = scores[key]?.id || `sc-${Date.now()}`;
    const totalScore = Object.values(criteria).reduce((sum, val) => sum + Number(val || 0), 0);
    const updatedAt = new Date().toISOString();
    
    scores[key] = {
      id: scoreId,
      eventId,
      teamId,
      judgeId,
      criteria,
      totalScore,
      feedback,
      updatedAt
    };

    setStorage('neura_scores', scores);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('scores').upsert([{
          id: scoreId,
          event_id: eventId,
          team_id: teamId,
          judge_id: judgeId,
          criteria,
          total_score: totalScore,
          feedback,
          updated_at: updatedAt
        }]);
      } catch (e) {
        console.warn('Supabase save score error:', e);
      }
    }

    return scores[key];
  },

  // 6. JUDGING LOCK STATUS
  async getJudgingLock() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('judging_locks').select('*');
        if (!error && data) {
          const locksMap = {};
          data.forEach(row => {
            locksMap[row.event_id] = {
              isCompleted: row.is_completed,
              completedAt: row.completed_at
            };
          });
          setStorage('neura_judging_locks', locksMap);
          return locksMap;
        }
      } catch (e) {
        console.warn('Supabase fetch judging locks error:', e);
      }
    }
    return getStorage('neura_judging_locks', {});
  },

  async finalizeJudging(eventId) {
    const locks = getStorage('neura_judging_locks', {});
    const completedAt = new Date().toISOString();
    locks[eventId] = { isCompleted: true, completedAt };
    setStorage('neura_judging_locks', locks);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('judging_locks').upsert([{
          event_id: eventId,
          is_completed: true,
          completed_at: completedAt
        }]);
      } catch (e) {
        console.warn('Supabase finalize judging lock error:', e);
      }
    }
  },

  // 7. BACKUP EXPORT
  async exportFullBackup() {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      events: await this.getEvents(),
      teams: await this.getTeams(),
      attendance: await this.getAttendance(),
      judges: await this.getJudges(),
      scores: await this.getScores(),
      locks: await this.getJudgingLock(),
      passwords: await this.getPasswords()
    };
    return JSON.stringify(backupData, null, 2);
  }
};

