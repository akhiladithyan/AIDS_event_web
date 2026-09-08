import { supabase, isSupabaseConfigured } from './supabase';
import QRCode from 'qrcode';

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
  qrCodeUrl: row.qr_code_url || '',
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
  qr_code_token: team.qrCodeToken,
  qr_code_url: team.qrCodeUrl || ''
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
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured in .env');
    }
    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: true });
    if (error) {
      console.error('Supabase fetch events error:', error);
      throw error;
    }
    if (!data || data.length === 0) {
      const insertRows = INITIAL_EVENTS.map(mapEventToDb);
      const { error: seedError } = await supabase.from('events').insert(insertRows);
      if (seedError) console.error('Error seeding initial events:', seedError);
      return INITIAL_EVENTS;
    }
    return data.map(mapEventFromDb);
  },

  async addEvent(event) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');
    const newEvent = { ...event, id: event.id || 'evt-' + Date.now() };
    const { error } = await supabase.from('events').insert([mapEventToDb(newEvent)]);
    if (error) {
      console.error('Supabase add event error:', error);
      throw error;
    }
    return newEvent;
  },

  async updateEvent(updatedEvent) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.from('events').update(mapEventToDb(updatedEvent)).eq('id', updatedEvent.id);
    if (error) {
      console.error('Supabase update event error:', error);
      throw error;
    }
  },

  async deleteEvent(id) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete event error:', error);
      throw error;
    }
  },

  // 2. PASSWORDS
  async getPasswords() {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase.from('passwords').select('*').eq('id', 'system').maybeSingle();
    if (error) {
      console.error('Supabase fetch passwords error:', error);
      throw error;
    }
    if (!data) {
      const { error: seedErr } = await supabase.from('passwords').upsert([{ id: 'system', admin: 'admin123', manager: 'manager123' }]);
      if (seedErr) console.error('Error seeding passwords:', seedErr);
      return INITIAL_PASSWORDS;
    }
    return { admin: data.admin, manager: data.manager };
  },

  async updatePasswords(passwords) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.from('passwords').upsert([{ id: 'system', admin: passwords.admin, manager: passwords.manager }]);
    if (error) {
      console.error('Supabase update passwords error:', error);
      throw error;
    }
  },

  // 3. TEAMS & STUDENTS
  async getTeams() {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: true });
    if (error) {
      console.error('Supabase fetch teams error:', error);
      throw error;
    }
    if (!data || data.length === 0) {
      await this.getEvents();
      const insertRows = INITIAL_TEAMS.map(mapTeamToDb);
      const { error: seedErr } = await supabase.from('teams').insert(insertRows);
      if (seedErr) console.error('Error seeding teams:', seedErr);
      return INITIAL_TEAMS;
    }
    return data.map(mapTeamFromDb);
  },

  async registerTeam({ teamName, eventId, leaderName, leaderPhone, leaderEmail, memberNames = [] }) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const events = await this.getEvents();
    const targetEvent = events.find(e => e.id === eventId) || { title: 'AI & DS Event' };
    const allTeams = await this.getTeams();

    // 1. Filter existing teams for this event
    const existingEventTeams = allTeams.filter(t => t.eventId === eventId);
    
    // 2. Enforce Max 20 Teams Limit per Event
    if (existingEventTeams.length >= 20) {
      throw new Error(`Registration Full! Maximum 20 teams allowed per event for "${targetEvent.title}".`);
    }

    // 3. Duplicate Participant Check for the Same Event
    const cleanLeaderName = leaderName.trim();
    const cleanMemberNames = memberNames.filter(n => n && n.trim().length > 0).map(n => n.trim());
    const incomingNames = [cleanLeaderName, ...cleanMemberNames];

    for (const existingTeam of existingEventTeams) {
      const registeredNames = [
        existingTeam.leaderName,
        ...(existingTeam.members || []).map(m => m.name)
      ].filter(Boolean).map(n => n.toLowerCase().trim());

      for (const incName of incomingNames) {
        if (registeredNames.includes(incName.toLowerCase())) {
          throw new Error(`Participant "${incName}" is already registered in "${existingTeam.teamName}" for ${targetEvent.title}! Duplicate registrations for the same event are not allowed.`);
        }
      }
    }

    // 4. Sequential Team ID Format: TM-EVT-01 to TM-EVT-20
    const nextNum = existingEventTeams.length + 1;
    const numStr = String(nextNum).padStart(2, '0');
    const evtCode = eventId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-3) || 'E1';
    const teamId = `TM-${evtCode}-${numStr}`;
    const qrCodeToken = `QR-${teamId}`;

    const leaderUserId = 'STD-' + Math.floor(100 + Math.random() * 900);
    const leaderPassword = 'pass-' + Math.floor(100 + Math.random() * 900);

    const members = [
      {
        userId: leaderUserId,
        name: cleanLeaderName,
        password: leaderPassword,
        role: 'Leader',
        qrToken: `QR-${leaderUserId}-${teamId}`
      }
    ];

    cleanMemberNames.forEach((name) => {
      const uId = 'STD-' + Math.floor(100 + Math.random() * 900);
      const uPass = 'pass-' + Math.floor(100 + Math.random() * 900);
      members.push({
        userId: uId,
        name,
        password: uPass,
        role: 'Member',
        qrToken: `QR-${uId}-${teamId}`
      });
    });

    // 5. Generate QR Code Data URL for Supabase storage
    let qrCodeUrl = '';
    try {
      qrCodeUrl = await QRCode.toDataURL(qrCodeToken, { width: 300, margin: 2 });
    } catch (err) {
      console.warn('Failed to generate QR Data URL:', err);
    }

    const newTeam = {
      id: teamId,
      teamName,
      eventId,
      eventTitle: targetEvent.title,
      leaderId: leaderUserId,
      leaderName: cleanLeaderName,
      leaderPhone: leaderPhone || '',
      leaderEmail: leaderEmail || '',
      members,
      qrCodeToken,
      qrCodeUrl,
      createdAt: new Date().toISOString()
    };

    const { error } = await supabase.from('teams').insert([mapTeamToDb(newTeam)]);
    if (error) {
      console.error('Supabase register team error:', error);
      throw error;
    }

    return newTeam;
  },

  async updateTeamMembers(teamId, updatedMembers, managerPassword) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const curPass = await this.getPasswords();
    if (managerPassword !== curPass.manager && managerPassword !== curPass.admin) {
      throw new Error('Incorrect Manager Password Confirmation! Action cancelled.');
    }

    const teams = await this.getTeams();
    const target = teams.find(t => t.id === teamId);
    if (!target) throw new Error('Team not found.');

    target.members = updatedMembers;
    const leader = updatedMembers.find(m => m.role === 'Leader') || updatedMembers[0];
    if (leader) {
      target.leaderId = leader.userId;
      target.leaderName = leader.name;
    }

    const { error } = await supabase.from('teams').update(mapTeamToDb(target)).eq('id', teamId);
    if (error) {
      console.error('Supabase update team members error:', error);
      throw error;
    }

    return target;
  },

  async deleteTeam(teamId) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) {
      console.error('Supabase delete team error:', error);
      throw error;
    }
  },

  async updateTeam(updatedTeam) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const { error } = await supabase.from('teams').update(mapTeamToDb(updatedTeam)).eq('id', updatedTeam.id);
    if (error) {
      console.error('Supabase update team error:', error);
      throw error;
    }
  },

  // 4. ATTENDANCE
  async getAttendance() {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase.from('attendance').select('*');
    if (error) {
      console.error('Supabase fetch attendance error:', error);
      throw error;
    }

    const attMap = {};
    if (data) {
      data.forEach(row => {
        attMap[row.team_id] = {
          present: row.present,
          markedAt: row.marked_at,
          markedBy: row.marked_by
        };
      });
    }
    return attMap;
  },

  async markAttendance(teamOrUserToken, markedBy = 'Manager') {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

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
    const { error } = await supabase.from('attendance').upsert([{
      team_id: targetTeam.id,
      present: true,
      marked_at: markedAt,
      marked_by: markedBy
    }]);

    if (error) {
      console.error('Supabase mark attendance error:', error);
      throw error;
    }

    return { success: true, team: targetTeam, message: `Attendance marked for Team ${targetTeam.teamName}!` };
  },

  async toggleAttendance(teamId) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const attendance = await this.getAttendance();
    const current = attendance[teamId]?.present || false;
    const markedAt = new Date().toISOString();
    const newPresentState = !current;

    const { error } = await supabase.from('attendance').upsert([{
      team_id: teamId,
      present: newPresentState,
      marked_at: markedAt,
      marked_by: 'Manager Toggle'
    }]);

    if (error) {
      console.error('Supabase toggle attendance error:', error);
      throw error;
    }

    return {
      present: newPresentState,
      markedAt,
      markedBy: 'Manager Toggle'
    };
  },

  // 5. JUDGES & SCORES
  async getJudges() {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase.from('judges').select('*');
    if (error) {
      console.error('Supabase fetch judges error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      const insertRows = INITIAL_JUDGES.map(mapJudgeToDb);
      const { error: seedErr } = await supabase.from('judges').insert(insertRows);
      if (seedErr) console.error('Error seeding judges:', seedErr);
      return INITIAL_JUDGES;
    }

    return data.map(mapJudgeFromDb);
  },

  async addJudge(judge) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const newJudge = { ...judge, id: judge.id || 'jd-' + Date.now() };
    const { error } = await supabase.from('judges').insert([mapJudgeToDb(newJudge)]);
    if (error) {
      console.error('Supabase add judge error:', error);
      throw error;
    }

    return newJudge;
  },

  async getScores() {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase.from('scores').select('*');
    if (error) {
      console.error('Supabase fetch scores error:', error);
      throw error;
    }

    const scoresMap = {};
    if (data) {
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
    }
    return scoresMap;
  },

  async saveScore({ eventId, teamId, judgeId, criteria, feedback }) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const scores = await this.getScores();
    const key = `${eventId}_${teamId}_${judgeId}`;
    const scoreId = scores[key]?.id || `sc-${Date.now()}`;
    const totalScore = Object.values(criteria).reduce((sum, val) => sum + Number(val || 0), 0);
    const updatedAt = new Date().toISOString();

    const { error } = await supabase.from('scores').upsert([{
      id: scoreId,
      event_id: eventId,
      team_id: teamId,
      judge_id: judgeId,
      criteria,
      total_score: totalScore,
      feedback,
      updated_at: updatedAt
    }]);

    if (error) {
      console.error('Supabase save score error:', error);
      throw error;
    }

    return {
      id: scoreId,
      eventId,
      teamId,
      judgeId,
      criteria,
      totalScore,
      feedback,
      updatedAt
    };
  },

  // 6. JUDGING LOCK STATUS
  async getJudgingLock() {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase.from('judging_locks').select('*');
    if (error) {
      console.error('Supabase fetch judging locks error:', error);
      throw error;
    }

    const locksMap = {};
    if (data) {
      data.forEach(row => {
        locksMap[row.event_id] = {
          isCompleted: row.is_completed,
          completedAt: row.completed_at
        };
      });
    }
    return locksMap;
  },

  async finalizeJudging(eventId) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const completedAt = new Date().toISOString();
    const { error } = await supabase.from('judging_locks').upsert([{
      event_id: eventId,
      is_completed: true,
      completed_at: completedAt
    }]);

    if (error) {
      console.error('Supabase finalize judging lock error:', error);
      throw error;
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
