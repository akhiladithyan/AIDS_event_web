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

// Initial Seed Team
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

// Main Store Service
export const storeService = {
  // EVENTS
  getEvents() {
    return getStorage('neura_events', INITIAL_EVENTS);
  },
  saveEvents(events) {
    setStorage('neura_events', events);
  },
  addEvent(event) {
    const events = this.getEvents();
    const newEvent = { ...event, id: 'evt-' + Date.now() };
    events.push(newEvent);
    this.saveEvents(events);
    return newEvent;
  },
  updateEvent(updatedEvent) {
    const events = this.getEvents().map(e => e.id === updatedEvent.id ? updatedEvent : e);
    this.saveEvents(events);
  },
  deleteEvent(id) {
    const events = this.getEvents().filter(e => e.id !== id);
    this.saveEvents(events);
  },

  // PASSWORDS
  getPasswords() {
    return getStorage('neura_passwords', INITIAL_PASSWORDS);
  },
  updatePasswords(passwords) {
    setStorage('neura_passwords', passwords);
  },

  // TEAMS & STUDENTS
  getTeams() {
    return getStorage('neura_teams', INITIAL_TEAMS);
  },
  saveTeams(teams) {
    setStorage('neura_teams', teams);
  },
  
  registerTeam({ teamName, eventId, leaderName, leaderPhone, leaderEmail, memberNames = [] }) {
    const events = this.getEvents();
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

    memberNames.filter(name => name.trim().length > 0).forEach((name, idx) => {
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

    const teams = this.getTeams();
    teams.push(newTeam);
    this.saveTeams(teams);

    // Sync to Supabase if available
    if (isSupabaseConfigured && supabase) {
      supabase.from('teams').insert([newTeam]).then(({ error }) => {
        if (error) console.warn('Supabase sync warning:', error);
      });
    }

    return newTeam;
  },

  deleteTeam(teamId) {
    const teams = this.getTeams().filter(t => t.id !== teamId);
    this.saveTeams(teams);
  },

  updateTeam(updatedTeam) {
    const teams = this.getTeams().map(t => t.id === updatedTeam.id ? updatedTeam : t);
    this.saveTeams(teams);
  },

  // ATTENDANCE
  getAttendance() {
    return getStorage('neura_attendance', INITIAL_ATTENDANCE);
  },
  markAttendance(teamOrUserToken, markedBy = 'Manager') {
    const attendance = this.getAttendance();
    const teams = this.getTeams();
    
    // Find matching team or member
    let targetTeam = teams.find(t => t.id === teamOrUserToken || t.qrCodeToken === teamOrUserToken);
    
    if (!targetTeam) {
      // Check individual member QR
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

    attendance[targetTeam.id] = {
      present: true,
      markedAt: new Date().toISOString(),
      markedBy
    };

    setStorage('neura_attendance', attendance);
    return { success: true, team: targetTeam, message: `Attendance marked for Team ${targetTeam.teamName}!` };
  },

  toggleAttendance(teamId) {
    const attendance = this.getAttendance();
    const current = attendance[teamId]?.present || false;
    attendance[teamId] = {
      present: !current,
      markedAt: new Date().toISOString(),
      markedBy: 'Manager Toggle'
    };
    setStorage('neura_attendance', attendance);
    return attendance[teamId];
  },

  // JUDGES & SCORES
  getJudges() {
    return getStorage('neura_judges', INITIAL_JUDGES);
  },
  saveJudges(judges) {
    setStorage('neura_judges', judges);
  },
  addJudge(judge) {
    const judges = this.getJudges();
    const newJudge = { ...judge, id: 'jd-' + Date.now() };
    judges.push(newJudge);
    this.saveJudges(judges);
    return newJudge;
  },

  getScores() {
    return getStorage('neura_scores', {});
  },
  saveScore({ eventId, teamId, judgeId, criteria, feedback }) {
    const scores = this.getScores();
    const key = `${eventId}_${teamId}_${judgeId}`;
    const totalScore = Object.values(criteria).reduce((sum, val) => sum + Number(val || 0), 0);
    
    scores[key] = {
      eventId,
      teamId,
      judgeId,
      criteria,
      totalScore,
      feedback,
      updatedAt: new Date().toISOString()
    };

    setStorage('neura_scores', scores);
    return scores[key];
  },

  // JUDGING LOCK STATUS
  getJudgingLock() {
    return getStorage('neura_judging_locks', {});
  },
  finalizeJudging(eventId) {
    const locks = this.getJudgingLock();
    locks[eventId] = { isCompleted: true, completedAt: new Date().toISOString() };
    setStorage('neura_judging_locks', locks);
  },

  // BACKUP EXPORT
  exportFullBackup() {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      events: this.getEvents(),
      teams: this.getTeams(),
      attendance: this.getAttendance(),
      judges: this.getJudges(),
      scores: this.getScores(),
      locks: this.getJudgingLock()
    };
    return JSON.stringify(backupData, null, 2);
  }
};
