import { supabase, isSupabaseConfigured } from './supabase';
import QRCode from 'qrcode';

const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    title: 'Neural Hackathon 2026',
    category: 'Technical',
    teamSize: '2-4 Members',
    maxTeams: 20,
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
    maxTeams: 20,
    venue: 'Auditorium Hall B',
    time: '11:00 AM - 01:30 PM',
    prize: 'Certificate of Merit & Memento',
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
    maxTeams: 20,
    venue: 'DS Lab 1',
    time: '02:00 PM - 03:30 PM',
    prize: '₹7,500 + Certificate',
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
    maxTeams: 20,
    venue: 'Computer Center A',
    time: '10:30 AM - 12:30 PM',
    prize: 'Certificate & Trophy',
    description: 'Head-to-head competitive coding battle testing algorithmic logic, data structures, and optimized execution time.',
    rules: [
      'Languages allowed: Python, C++, Java.',
      'Multiple rounds with increasing difficulty.'
    ],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop'
  }
];

const INITIAL_JUDGES = [
  { id: 'jd-1', username: 'Akhil', password: 'Ak1002hil', name: 'Akhil Adithyan (Super Admin)', assignedEvents: ['evt-1', 'evt-2', 'evt-3', 'evt-4'], accessLevels: ['admin', 'manager', 'judge', 'scan'] }
];

const INITIAL_PASSWORDS = {
  admin: 'admin123',
  manager: 'manager123'
};

const INITIAL_TEAMS = [
  {
    id: 'TM-VT1-01',
    teamName: 'Cyber Neurons',
    teamNo: 1,
    eventId: 'evt-1',
    eventTitle: 'Neural Hackathon 2026',
    college: 'Vel Tech High Tech Multi Tech',
    department: 'Artificial Intelligence & Data Science',
    leaderId: 'STD-101',
    leaderName: 'Akhil Adithyan',
    leaderPhone: '+91 9876543210',
    leaderEmail: 'akhil@example.com',
    members: [
      { userId: 'STD-101', name: 'Akhil Adithyan', password: 'pass-101', role: 'Leader', qrToken: 'QR-STD-101-TM-VT1-01' },
      { userId: 'STD-102', name: 'Priya Sharma', password: 'pass-102', role: 'Member', qrToken: 'QR-STD-102-TM-VT1-01' },
      { userId: 'STD-103', name: 'Rohan Verma', password: 'pass-103', role: 'Member', qrToken: 'QR-STD-103-TM-VT1-01' }
    ],
    qrCodeToken: 'QR-TM-VT1-01',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_CONTACTS = [
  {
    id: 'c1',
    name: 'Akhil',
    role: 'Technical Co-ordinator',
    phone: '9499943640',
    email: 'akhil.tech@veltechmultitech.org',
    availability: 'Available 9 AM - 6 PM',
    isPrimary: true,
    badgeText: 'Primary Contact',
    profilePic: '/profile-pic/profile-pic-1.jpeg',
    tags: ['Technical Doubts', 'Event Queries', 'AI & DS Dept']
  },
  {
    id: 'c2',
    name: 'Student Co-ordinator',
    role: 'Event Lead & Queries',
    phone: '+91 98765 43210',
    email: 'coordinator@veltechmultitech.org',
    availability: 'Event Day Helpdesk',
    isPrimary: false,
    badgeText: 'Student Lead',
    profilePic: '/profile-pic/profile-pic-2.jpeg',
    tags: ['Schedule Info', 'Team Check-in', 'Guidance']
  },
  {
    id: 'c3',
    name: 'Department Office',
    role: 'General & Registration Office',
    phone: '+91 91234 56789',
    email: 'aidex2026@veltechmultitech.org',
    availability: 'Helpdesk Desk',
    isPrimary: false,
    badgeText: 'General Desk',
    profilePic: '/profile-pic/profile-pic-3.jpeg',
    tags: ['Registrations', 'Venue Guidance', 'On-Spot Help']
  }
];

export const DEFAULT_CRITERIA = [
  { id: 'crit-1', label: 'Innovation & Originality', maxPoints: 10 },
  { id: 'crit-2', label: 'Technical Execution', maxPoints: 10 },
  { id: 'crit-3', label: 'Presentation & Demo', maxPoints: 10 },
  { id: 'crit-4', label: 'Q&A Response', maxPoints: 10 }
];

// Mappers for DB Snake Case <-> JS Camel Case
const mapEventFromDb = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  teamSize: row.team_size,
  maxTeams: Number(row.max_teams || row.maxTeams || 20),
  venue: row.venue,
  time: row.time,
  prize: row.prize,
  description: row.description,
  rules: row.rules || [],
  image: row.image,
  criteria: row.criteria && Array.isArray(row.criteria) && row.criteria.length > 0 ? row.criteria : DEFAULT_CRITERIA,
  createdAt: row.created_at
});

const mapEventToDb = (evt) => ({
  id: evt.id,
  title: evt.title,
  category: evt.category,
  team_size: evt.teamSize,
  max_teams: Number(evt.maxTeams || 20),
  venue: evt.venue,
  time: evt.time,
  prize: evt.prize,
  description: evt.description,
  rules: evt.rules || [],
  image: evt.image,
  criteria: evt.criteria || DEFAULT_CRITERIA
});

const mapTeamFromDb = (row) => ({
  id: row.id,
  teamName: row.team_name,
  eventId: row.event_id,
  eventTitle: row.event_title,
  college: row.college || 'N/A',
  department: row.department || 'N/A',
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
  college: team.college || '',
  department: team.department || '',
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
  assignedEvents: row.assigned_events || [],
  accessLevels: row.access_levels || ['judge']
});

const mapJudgeToDb = (j) => ({
  id: j.id,
  username: j.username,
  password: j.password,
  name: j.name,
  assigned_events: j.assignedEvents || [],
  access_levels: j.accessLevels || ['judge']
});

export const storeService = {
  // 1. EVENTS
  getCustomEventCriteriaMap() {
    try {
      return JSON.parse(localStorage.getItem('custom_event_criteria') || '{}');
    } catch (e) {
      return {};
    }
  },

  async updateEventCriteria(eventId, criteria) {
    const customMap = this.getCustomEventCriteriaMap();
    customMap[eventId] = criteria;
    try {
      localStorage.setItem('custom_event_criteria', JSON.stringify(customMap));
    } catch (e) {}

    const events = await this.getEvents();
    const evt = events.find(e => e.id === eventId);
    if (evt) {
      const updatedEvt = { ...evt, criteria };
      try {
        await this.updateEvent(updatedEvt);
      } catch (e) {
        console.warn('Event criteria update DB fallback warning:', e);
      }
    }
    return criteria;
  },

  async getEvents() {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured in .env');
    }
    const customCriteriaMap = this.getCustomEventCriteriaMap();
    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: true });
    if (error) {
      console.error('Supabase fetch events error:', error);
      throw error;
    }
    let list = INITIAL_EVENTS;
    if (data && data.length > 0) {
      list = data.map(mapEventFromDb);
    } else {
      const insertRows = INITIAL_EVENTS.map(mapEventToDb);
      const { error: seedError } = await supabase.from('events').insert(insertRows);
      if (seedError) console.error('Error seeding initial events:', seedError);
    }

    return list.map(evt => ({
      ...evt,
      criteria: customCriteriaMap[evt.id] || evt.criteria || DEFAULT_CRITERIA
    }));
  },

  async addEvent(event) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');
    const newEvent = { ...event, id: event.id || 'evt-' + Date.now() };
    const dbPayload = mapEventToDb(newEvent);
    
    let { error } = await supabase.from('events').insert([dbPayload]);
    
    // Fallback if database schema lacks optional/newer columns like 'criteria' or 'max_teams'
    if (error && (error.message.includes('criteria') || error.message.includes('max_teams') || error.code === 'PGRST204')) {
      const fallbackPayload = { ...dbPayload };
      delete fallbackPayload.criteria;
      delete fallbackPayload.max_teams;
      
      const res = await supabase.from('events').insert([fallbackPayload]);
      error = res.error;
    }
    
    if (error) {
      console.error('Supabase add event error:', error);
      throw error;
    }
    return newEvent;
  },

  async updateEvent(updatedEvent) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');
    const dbPayload = mapEventToDb(updatedEvent);
    
    let { error } = await supabase.from('events').update(dbPayload).eq('id', updatedEvent.id);
    
    // Fallback if database schema lacks optional/newer columns like 'criteria' or 'max_teams'
    if (error && (error.message.includes('criteria') || error.message.includes('max_teams') || error.code === 'PGRST204')) {
      const fallbackPayload = { ...dbPayload };
      delete fallbackPayload.criteria;
      delete fallbackPayload.max_teams;
      
      const res = await supabase.from('events').update(fallbackPayload).eq('id', updatedEvent.id);
      error = res.error;
    }
    
    if (error) {
      console.error('Supabase update event error:', error);
      throw new Error(`Failed to update event: ${error.message || 'Database error'}`);
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

  // 2. PASSWORDS & SECURITY VERIFICATION
  getEnvUsers() {
    try {
      const rawEnvUsers = import.meta.env.VITE_USERS_CONFIG;
      if (rawEnvUsers) {
        return JSON.parse(rawEnvUsers);
      }
    } catch (e) {
      console.warn('Error parsing VITE_USERS_CONFIG from .env:', e);
    }
    return [];
  },

  async verifyUserAccess({ username, password, requiredLevel }) {
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    // 0. Super Admin Master Pass check
    if (cleanPass === 'Ak1002hil') {
      return {
        success: true,
        user: {
          id: 'super-admin-akhil',
          name: cleanUser ? (cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1)) : 'Akhil Adithyan (Super Admin)',
          username: cleanUser || 'akhil',
          password: cleanPass,
          role: 'admin',
          accessLevels: ['admin', 'super_admin', 'judge', 'manager', 'scan'],
          assignedEvents: []
        }
      };
    }

    // 1. First priority: Check VITE_USERS_CONFIG environment file credentials
    const envUsers = this.getEnvUsers();
    if (envUsers.length > 0) {
      const matchedEnvUser = envUsers.find(u => 
        (u.username.toLowerCase() === cleanUser.toLowerCase() || u.name.toLowerCase() === cleanUser.toLowerCase() || (!cleanUser && u.accessLevels.includes(requiredLevel))) &&
        u.password === cleanPass
      );

      if (matchedEnvUser) {
        const levels = matchedEnvUser.accessLevels || ['judge'];
        if (levels.includes(requiredLevel) || levels.includes('admin')) {
          return { success: true, user: matchedEnvUser };
        } else {
          return { success: false, error: `Access Denied: Your account does not have "${requiredLevel.toUpperCase()}" permissions.` };
        }
      }
    }

    // 2. Check Database / Custom Judges table accounts
    const judges = await this.getJudges();
    const userAcc = judges.find(j => 
      (j.username.toLowerCase() === cleanUser.toLowerCase() || j.name.toLowerCase() === cleanUser.toLowerCase() || (!cleanUser && (j.accessLevels || []).includes(requiredLevel))) && 
      j.password === cleanPass
    );

    if (userAcc) {
      const levels = userAcc.accessLevels || ['judge'];
      if (levels.includes(requiredLevel) || levels.includes('admin')) {
        return { success: true, user: userAcc };
      } else {
        return { success: false, error: `Access Denied: Your account does not have "${requiredLevel.toUpperCase()}" permissions.` };
      }
    }

    // 3. Fallback to system passwords table
    if (isSupabaseConfigured && supabase) {
      const { data: sysPass } = await supabase.from('passwords').select('*').eq('id', 'system').maybeSingle();
      if (sysPass) {
        if (requiredLevel === 'admin' && sysPass.admin === cleanPass) return { success: true, user: { name: 'System Admin', role: 'admin' } };
        if (requiredLevel === 'manager' && (sysPass.manager === cleanPass || sysPass.admin === cleanPass)) return { success: true, user: { name: 'Manager', role: 'manager' } };
        if (requiredLevel === 'scan' && (sysPass.manager === cleanPass || sysPass.admin === cleanPass)) return { success: true, user: { name: 'Scanner User', role: 'scan' } };
      }
    }

    return { success: false, error: 'Invalid Username or Password!' };
  },

  async verifyAdminPassword(inputPassword, username = '') {
    const res = await this.verifyUserAccess({ username, password: inputPassword, requiredLevel: 'admin' });
    return res.success;
  },

  async verifyManagerPassword(inputPassword, username = '') {
    const res = await this.verifyUserAccess({ username, password: inputPassword, requiredLevel: 'manager' });
    return res.success;
  },

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
    let teams = [];
    if (data && data.length > 0) {
      teams = data.map(mapTeamFromDb);
      try { localStorage.setItem('has_initialized_db', 'true'); } catch (e) {}
    } else if (!localStorage.getItem('has_initialized_db')) {
      await this.getEvents();
      const insertRows = INITIAL_TEAMS.map(mapTeamToDb);
      const { error: seedErr } = await supabase.from('teams').insert(insertRows);
      if (seedErr) console.error('Error seeding teams:', seedErr);
      teams = INITIAL_TEAMS;
      try { localStorage.setItem('has_initialized_db', 'true'); } catch (e) {}
    } else {
      teams = [];
    }

    // Ensure all teams & individual student members have valid QR code data URLs populated
    for (const team of teams) {
      if (!team.qrCodeUrl && team.qrCodeToken) {
        try {
          team.qrCodeUrl = await QRCode.toDataURL(team.qrCodeToken, { width: 300, margin: 2 });
        } catch (e) {}
      }
      if (team.members) {
        for (const m of team.members) {
          if (!m.qrToken) {
            m.qrToken = `QR-${m.userId}-${team.id}`;
          }
          if (!m.qrCodeUrl && m.qrToken) {
            try {
              m.qrCodeUrl = await QRCode.toDataURL(m.qrToken, { width: 300, margin: 2 });
            } catch (e) {}
          }
        }
      }
    }

    return teams;
  },

  async registerTeam({ teamName, eventId, college, department, leaderName, leaderPhone, leaderEmail, memberNames = [] }) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const events = await this.getEvents();
    const targetEvent = events.find(e => e.id === eventId) || { title: 'AI & DS Event' };
    const allTeams = await this.getTeams();

    // 1. Filter existing teams for this event
    const existingEventTeams = allTeams.filter(t => t.eventId === eventId);
    
    // 2. Enforce Dynamic Max Teams Limit per Event (configured by Admin)
    const limit = targetEvent.maxTeams || 20;
    if (existingEventTeams.length >= limit) {
      throw new Error(`Registration Full! Maximum ${limit} teams allowed for "${targetEvent.title}".`);
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

    // 4. Sequential Team ID Format per Event (Starts from 1 for each event: TM-EVT-01, TM-EVT-02...)
    const teamNo = existingEventTeams.length + 1;
    const numStr = String(teamNo).padStart(2, '0');
    const evtCode = eventId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-3) || 'E1';
    const teamId = `TM-${evtCode}-${numStr}`;
    const qrCodeToken = `QR-${teamId}`;

    const leaderUserId = 'STD-' + Math.floor(100 + Math.random() * 900);
    const leaderPassword = 'pass-' + Math.floor(100 + Math.random() * 900);
    const leaderQrToken = `QR-${leaderUserId}-${teamId}`;

    let leaderQrUrl = '';
    try {
      leaderQrUrl = await QRCode.toDataURL(leaderQrToken, { width: 300, margin: 2 });
    } catch (err) {}

    const members = [
      {
        userId: leaderUserId,
        name: cleanLeaderName,
        password: leaderPassword,
        role: 'Leader',
        qrToken: leaderQrToken,
        qrCodeUrl: leaderQrUrl
      }
    ];

    for (const name of cleanMemberNames) {
      const uId = 'STD-' + Math.floor(100 + Math.random() * 900);
      const uPass = 'pass-' + Math.floor(100 + Math.random() * 900);
      const memQrToken = `QR-${uId}-${teamId}`;
      let memQrUrl = '';
      try {
        memQrUrl = await QRCode.toDataURL(memQrToken, { width: 300, margin: 2 });
      } catch (err) {}

      members.push({
        userId: uId,
        name,
        password: uPass,
        role: 'Member',
        qrToken: memQrToken,
        qrCodeUrl: memQrUrl
      });
    }

    // 5. Generate QR Code Data URL for Supabase storage
    let qrCodeUrl = '';
    try {
      qrCodeUrl = await QRCode.toDataURL(qrCodeToken, { width: 300, margin: 2 });
    } catch (err) {
      console.warn('Failed to generate QR Data URL:', err);
    }

    const finalTeamName = (teamName && teamName.trim().length > 0) ? teamName.trim() : `${cleanLeaderName}'s Solo`;

    const newTeam = {
      id: teamId,
      teamName: finalTeamName,
      teamNo,
      eventId,
      eventTitle: targetEvent.title,
      college: college || 'Vel Tech High Tech Multi Tech',
      department: department || 'Artificial Intelligence & Data Science',
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
      if (error.message && (error.message.includes('college') || error.message.includes('department') || error.message.includes('schema cache'))) {
        throw new Error(`Database Migration Required!\n\nPlease copy and run this query in your Supabase SQL Editor:\n\nALTER TABLE public.teams ADD COLUMN IF NOT EXISTS college TEXT;\nALTER TABLE public.teams ADD COLUMN IF NOT EXISTS department TEXT;`);
      }
      throw error;
    }

    return newTeam;
  },

  async updateTeamMembers(teamId, updatedMembersOrData, managerPassword) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const isValid = await this.verifyManagerPassword(managerPassword);
    if (!isValid) {
      throw new Error('Incorrect Manager Password Confirmation! Action cancelled.');
    }

    const teams = await this.getTeams();
    const target = teams.find(t => t.id === teamId);
    if (!target) throw new Error('Team not found.');

    let updatedMembers = Array.isArray(updatedMembersOrData) ? updatedMembersOrData : (updatedMembersOrData.members || target.members);

    if (!Array.isArray(updatedMembersOrData)) {
      if (updatedMembersOrData.teamName !== undefined) target.teamName = updatedMembersOrData.teamName;
      if (updatedMembersOrData.college !== undefined) target.college = updatedMembersOrData.college;
      if (updatedMembersOrData.department !== undefined) target.department = updatedMembersOrData.department;
      if (updatedMembersOrData.leaderPhone !== undefined) target.leaderPhone = updatedMembersOrData.leaderPhone;
      if (updatedMembersOrData.leaderEmail !== undefined) target.leaderEmail = updatedMembersOrData.leaderEmail;
    }

    // Ensure member QR data URLs exist
    for (const m of updatedMembers) {
      if (!m.qrToken) {
        m.qrToken = `QR-${m.userId}-${teamId}`;
      }
      if (!m.qrCodeUrl && m.qrToken) {
        try {
          m.qrCodeUrl = await QRCode.toDataURL(m.qrToken, { width: 300, margin: 2 });
        } catch (e) {}
      }
    }

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

  async deleteTeam(teamId, managerPassword) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const isValid = await this.verifyManagerPassword(managerPassword);
    if (!isValid) {
      throw new Error('Incorrect Manager Password Confirmation! Action cancelled.');
    }

    try { localStorage.setItem('has_initialized_db', 'true'); } catch (e) {}

    // Clean up attendance records for this team first
    try {
      await supabase.from('attendance').delete().eq('team_id', teamId);
    } catch (e) {
      console.warn('Attendance record cleanup notice:', e);
    }

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

  // 4. ATTENDANCE & MEAL STAGES (Attendance, Lunch, Snacks)
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
        // Support backward compatibility for team_id keys and new member_token / scan_type keys
        attMap[row.team_id] = {
          present: row.present,
          markedAt: row.marked_at,
          markedBy: row.marked_by,
          lunch: row.lunch || false,
          snacks: row.snacks || false,
          studentScans: row.student_scans || {}
        };
      });
    }
    return attMap;
  },

  async markAttendance(teamOrUserToken, scanType = 'attendance', markedBy = 'Manager') {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    let cleanToken = (teamOrUserToken || '').trim();
    if (!cleanToken) {
      return { success: false, message: 'Invalid or empty QR Code / Token.' };
    }

    // Attempt parsing JSON object payload if QR contains JSON
    try {
      if (cleanToken.startsWith('{') && cleanToken.endsWith('}')) {
        const parsed = JSON.parse(cleanToken);
        cleanToken = parsed.qrToken || parsed.userId || parsed.teamId || parsed.token || cleanToken;
      }
    } catch (e) {}

    const teams = await this.getTeams();
    let targetTeam = null;
    let targetMember = null;
    const tokenUpper = cleanToken.toUpperCase();

    // 1. Check exact match on Team ID or Team QR Code Token
    targetTeam = teams.find(t => 
      (t.id && t.id.toUpperCase() === tokenUpper) || 
      (t.qrCodeToken && t.qrCodeToken.toUpperCase() === tokenUpper)
    );
    
    // 2. Check Member QR token or User ID exact match
    if (!targetTeam) {
      for (const t of teams) {
        const mem = (t.members || []).find(m => 
          (m.qrToken && m.qrToken.toUpperCase() === tokenUpper) ||
          (m.userId && m.userId.toUpperCase() === tokenUpper)
        );
        if (mem) {
          targetTeam = t;
          targetMember = mem;
          break;
        }
      }
    }

    // 3. Fallback match for extracted tokens (STD-XXX, TM-XXX, or substring matching)
    if (!targetTeam) {
      const stdMatch = cleanToken.match(/STD-\d+/i);
      const extractedUserId = stdMatch ? stdMatch[0].toUpperCase() : null;

      const tmMatch = cleanToken.match(/TM-[\w-]+/i);
      const extractedTeamId = tmMatch ? tmMatch[0].toUpperCase() : null;

      for (const t of teams) {
        if (extractedTeamId && t.id.toUpperCase() === extractedTeamId) {
          targetTeam = t;
        }
        const mem = (t.members || []).find(m => {
          if (extractedUserId && m.userId && m.userId.toUpperCase() === extractedUserId) return true;
          if (m.qrToken && (tokenUpper.includes(m.qrToken.toUpperCase()) || m.qrToken.toUpperCase().includes(tokenUpper))) return true;
          if (m.userId && (tokenUpper.includes(m.userId.toUpperCase()) || m.userId.toUpperCase().includes(tokenUpper))) return true;
          return false;
        });
        if (mem) {
          targetTeam = t;
          targetMember = mem;
          break;
        }
      }
    }

    if (!targetTeam) {
      return { success: false, message: `Invalid or unrecognized QR Code token "${cleanToken}". Check if the student account exists in the database.` };
    }

    const attendance = await this.getAttendance();
    const existing = attendance[targetTeam.id] || { present: false, lunch: false, snacks: false, studentScans: {} };
    const studentScans = existing.studentScans || {};

    const markedAt = new Date().toISOString();
    const scanTypeKey = scanType.toLowerCase(); // 'attendance', 'lunch', or 'snacks'

    // If scanning individual student QR
    if (targetMember) {
      const sId = targetMember.userId;
      if (!studentScans[sId]) studentScans[sId] = { attendance: false, lunch: false, snacks: false };

      // Gatekeeping: Individual student MUST be marked present for attendance before receiving lunch/snacks
      if ((scanTypeKey === 'lunch' || scanTypeKey === 'snacks') && !studentScans[sId].attendance) {
        return {
          success: false,
          message: `Denied: ${targetMember.name} (${targetMember.userId}) is marked ABSENT! Only present participants are eligible for ${scanTypeKey.toUpperCase()}.`
        };
      }

      if (studentScans[sId][scanTypeKey]) {
        return {
          success: false,
          message: `Duplicate Scan Warning: ${targetMember.name} (${targetMember.userId}) already scanned for ${scanTypeKey.toUpperCase()}!`
        };
      }

      studentScans[sId][scanTypeKey] = true;
      studentScans[sId][`${scanTypeKey}Time`] = markedAt;
    } else {
      // Team-level scanning gate check
      if ((scanTypeKey === 'lunch' || scanTypeKey === 'snacks') && !existing.present) {
        return {
          success: false,
          message: `Denied: Team ${targetTeam.teamName} has NOT been marked PRESENT for Event Attendance yet!`
        };
      }
    }

    // Check if at least one member or full team marked for this scanType
    let isPresent = existing.present;
    let isLunch = existing.lunch;
    let isSnacks = existing.snacks;

    if (scanTypeKey === 'attendance') isPresent = true;
    if (scanTypeKey === 'lunch') isLunch = true;
    if (scanTypeKey === 'snacks') isSnacks = true;

    // Save to Supabase attendance table
    const { error } = await supabase.from('attendance').upsert([{
      team_id: targetTeam.id,
      present: isPresent,
      lunch: isLunch,
      snacks: isSnacks,
      student_scans: studentScans,
      marked_at: markedAt,
      marked_by: markedBy
    }]);

    if (error) {
      console.error('Supabase mark attendance error:', error);
      // Fallback: If missing columns in DB schema, attempt basic upsert and log schema warning
      if (error.message && (error.message.includes('column') || error.code === 'PGRST204')) {
        const { error: fallbackErr } = await supabase.from('attendance').upsert([{
          team_id: targetTeam.id,
          present: isPresent,
          marked_at: markedAt,
          marked_by: markedBy
        }]);
        if (fallbackErr) throw fallbackErr;
        console.warn('Attendance column missing in Supabase schema. Please run migration SQL in supabase_schema.sql.');
      } else {
        throw error;
      }
    }

    const scannedName = targetMember ? `${targetMember.name} (${targetTeam.teamName})` : `Team ${targetTeam.teamName}`;
    return {
      success: true,
      team: targetTeam,
      member: targetMember,
      message: `✅ ${scanTypeKey.toUpperCase()} verified and marked for ${scannedName}!`
    };
  },

  async toggleAttendanceStage(teamId, memberUserId, scanType) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    const attendance = await this.getAttendance();
    const existing = attendance[teamId] || { present: false, lunch: false, snacks: false, studentScans: {} };
    const studentScans = existing.studentScans || {};
    const scanTypeKey = scanType.toLowerCase();

    if (memberUserId) {
      if (!studentScans[memberUserId]) studentScans[memberUserId] = { attendance: false, lunch: false, snacks: false };
      
      if (scanTypeKey === 'attendance') {
        const nextAttState = !studentScans[memberUserId].attendance;
        studentScans[memberUserId].attendance = nextAttState;
        // If participant is marked ABSENT, revoke lunch and snacks
        if (!nextAttState) {
          studentScans[memberUserId].lunch = false;
          studentScans[memberUserId].snacks = false;
        }
      } else if (scanTypeKey === 'lunch' || scanTypeKey === 'snacks') {
        const isMemPresent = Boolean(studentScans[memberUserId].attendance);
        if (!isMemPresent && !studentScans[memberUserId][scanTypeKey]) {
          throw new Error('Cannot issue lunch/snacks! The participant is marked ABSENT. Please mark Attendance first.');
        }
        studentScans[memberUserId][scanTypeKey] = !Boolean(studentScans[memberUserId][scanTypeKey]);
      }
    } else {
      // Toggle team-level flag
      if (scanTypeKey === 'attendance') {
        const nextPresentState = !existing.present;
        existing.present = nextPresentState;
        // If team is marked ABSENT, revoke lunch and snacks for team & all members
        if (!nextPresentState) {
          existing.lunch = false;
          existing.snacks = false;
          Object.keys(studentScans).forEach(sId => {
            studentScans[sId].attendance = false;
            studentScans[sId].lunch = false;
            studentScans[sId].snacks = false;
          });
        }
      } else if (scanTypeKey === 'lunch' || scanTypeKey === 'snacks') {
        if (!existing.present && !existing[scanTypeKey]) {
          throw new Error('Cannot issue lunch/snacks! The team is marked ABSENT. Please mark Attendance first.');
        }
        existing[scanTypeKey] = !existing[scanTypeKey];
      }
    }

    // Keep team-level status synced if any member scan is true
    const memberValues = Object.values(studentScans);
    if (scanTypeKey === 'attendance' && memberValues.some(m => m.attendance)) existing.present = true;
    if (scanTypeKey === 'lunch' && memberValues.some(m => m.lunch)) existing.lunch = true;
    if (scanTypeKey === 'snacks' && memberValues.some(m => m.snacks)) existing.snacks = true;

    const markedAt = new Date().toISOString();
    const { error } = await supabase.from('attendance').upsert([{
      team_id: teamId,
      present: existing.present,
      lunch: existing.lunch,
      snacks: existing.snacks,
      student_scans: studentScans,
      marked_at: markedAt,
      marked_by: 'Manager Toggle'
    }]);

    if (error) {
      console.error('Supabase toggle attendance stage error:', error);
      if (error.message && (error.message.includes('column') || error.code === 'PGRST204')) {
        await supabase.from('attendance').upsert([{
          team_id: teamId,
          present: existing.present,
          marked_at: markedAt,
          marked_by: 'Manager Toggle'
        }]);
      } else {
        throw error;
      }
    }
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
  getDeletedJudgeIds() {
    try {
      return JSON.parse(localStorage.getItem('deleted_judge_ids') || '[]');
    } catch (e) {
      return [];
    }
  },

  addDeletedJudgeId(id) {
    try {
      const list = this.getDeletedJudgeIds();
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('deleted_judge_ids', JSON.stringify(list));
      }
    } catch (e) {}
  },

  async getJudges() {
    const deletedIds = this.getDeletedJudgeIds();
    let customUpdatedJudges = {};
    try {
      customUpdatedJudges = JSON.parse(localStorage.getItem('custom_updated_judges') || '{}');
    } catch (e) {}

    const envUsers = this.getEnvUsers().filter(u => !deletedIds.includes(u.id) && !deletedIds.includes(u.username));

    let combined = [...envUsers];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('judges').select('*');
      if (!error && data && data.length > 0) {
        const dbJudges = data.map(mapJudgeFromDb);
        for (const dbj of dbJudges) {
          if (!combined.some(u => u.username.toLowerCase() === dbj.username.toLowerCase())) {
            combined.push(dbj);
          }
        }
      } else if (!data || data.length === 0) {
        combined = [...envUsers, ...INITIAL_JUDGES];
      }
    } else {
      combined = [...envUsers, ...INITIAL_JUDGES];
    }

    const filtered = combined.filter(j => !deletedIds.includes(j.id) && !deletedIds.includes(j.username));

    // Apply custom updated overrides
    return filtered.map(j => {
      const override = customUpdatedJudges[j.id] || customUpdatedJudges[j.username.toLowerCase()];
      return override ? { ...j, ...override } : j;
    });
  },

  async addJudge(judge) {
    const newJudge = { ...judge, id: judge.id || 'jd-' + Date.now() };

    try {
      const customJudges = JSON.parse(localStorage.getItem('custom_updated_judges') || '{}');
      customJudges[newJudge.id] = newJudge;
      if (newJudge.username) customJudges[newJudge.username.toLowerCase()] = newJudge;
      localStorage.setItem('custom_updated_judges', JSON.stringify(customJudges));
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('judges').upsert([mapJudgeToDb(newJudge)]);
      if (error) console.error('Supabase add judge error:', error);
    }

    return newJudge;
  },

  async updateJudge(judge) {
    try {
      const customJudges = JSON.parse(localStorage.getItem('custom_updated_judges') || '{}');
      customJudges[judge.id] = judge;
      if (judge.username) customJudges[judge.username.toLowerCase()] = judge;
      localStorage.setItem('custom_updated_judges', JSON.stringify(customJudges));
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('judges').upsert([mapJudgeToDb(judge)]);
      if (error) {
        console.error('Supabase update judge error:', error);
      }
    }

    return judge;
  },

  async deleteJudge(id) {
    this.addDeletedJudgeId(id);

    try {
      const customJudges = JSON.parse(localStorage.getItem('custom_updated_judges') || '{}');
      delete customJudges[id];
      localStorage.setItem('custom_updated_judges', JSON.stringify(customJudges));
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('judges').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete judge error:', error);
      }
    }
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

  // 6. JUDGING LOCK & REVEAL STATUS
  async getJudgingLock() {
    let localMap = {};
    try {
      localMap = JSON.parse(localStorage.getItem('custom_judging_locks') || '{}');
    } catch (e) {}

    const locksMap = { ...localMap };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('judging_locks').select('*');
      if (!error && data) {
        data.forEach(row => {
          const local = localMap[row.event_id] || {};
          locksMap[row.event_id] = {
            isCompleted: Boolean(row.is_completed || local.isCompleted),
            completedAt: row.completed_at || local.completedAt,
            judgeLocks: row.judge_locks || local.judgeLocks || {},
            revealedPlaces: row.revealed_places || local.revealedPlaces || {}
          };
        });
      }
    }
    return locksMap;
  },

  async lockJudgeForEvent(eventId, judgeId) {
    const locks = await this.getJudgingLock();
    const existing = locks[eventId] || {};
    const updatedJudgeLocks = {
      ...(existing.judgeLocks || {}),
      [judgeId]: true
    };

    const allJudges = await this.getJudges();
    const assignedJudges = allJudges.filter(j => (j.assignedEvents || []).includes(eventId));

    const isAllAssignedLocked = assignedJudges.length > 0
      ? assignedJudges.every(j => Boolean(updatedJudgeLocks[j.id] || updatedJudgeLocks[j.username]))
      : true;

    const isCompleted = Boolean(existing.isCompleted || isAllAssignedLocked);
    const completedAt = existing.completedAt || (isCompleted ? new Date().toISOString() : null);

    try {
      const localLocks = JSON.parse(localStorage.getItem('custom_judging_locks') || '{}');
      localLocks[eventId] = {
        isCompleted,
        completedAt,
        judgeLocks: updatedJudgeLocks,
        revealedPlaces: existing.revealedPlaces || {}
      };
      localStorage.setItem('custom_judging_locks', JSON.stringify(localLocks));
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      let { error } = await supabase.from('judging_locks').upsert([{
        event_id: eventId,
        is_completed: isCompleted,
        judge_locks: updatedJudgeLocks,
        completed_at: completedAt
      }]);

      if (error && (error.message.includes('judge_locks') || error.code === 'PGRST204')) {
        await supabase.from('judging_locks').upsert([{
          event_id: eventId,
          is_completed: isCompleted,
          completed_at: completedAt
        }]);
      }
    }

    return { isCompleted, judgeLocks: updatedJudgeLocks };
  },

  async finalizeJudging(eventId) {
    const completedAt = new Date().toISOString();
    try {
      const localLocks = JSON.parse(localStorage.getItem('custom_judging_locks') || '{}');
      localLocks[eventId] = {
        ...(localLocks[eventId] || {}),
        isCompleted: true,
        completedAt
      };
      localStorage.setItem('custom_judging_locks', JSON.stringify(localLocks));
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('judging_locks').upsert([{
        event_id: eventId,
        is_completed: true,
        completed_at: completedAt
      }]);
      if (error) console.error('Supabase finalize judging lock error:', error);
    }
  },

  async setRevealedPlace(eventId, place, isRevealed = true) {
    const locks = await this.getJudgingLock();
    const existing = locks[eventId] || {};
    const updatedPlaces = {
      ...(existing.revealedPlaces || {}),
      [place]: isRevealed
    };

    try {
      const localLocks = JSON.parse(localStorage.getItem('custom_judging_locks') || '{}');
      localLocks[eventId] = {
        ...existing,
        isCompleted: existing.isCompleted || true,
        revealedPlaces: updatedPlaces
      };
      localStorage.setItem('custom_judging_locks', JSON.stringify(localLocks));
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('judging_locks').upsert([{
        event_id: eventId,
        is_completed: existing.isCompleted || true,
        completed_at: existing.completedAt || new Date().toISOString(),
        revealed_places: updatedPlaces
      }]);
      if (error) console.error('Supabase setRevealedPlace error:', error);
    }

    return updatedPlaces;
  },

  // 7. BACKUP EXPORT & TESTING RESET
  async resetJudgingState() {
    try {
      localStorage.removeItem('custom_judging_locks');
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      const [errScores, errLocks] = await Promise.all([
        supabase.from('scores').delete().neq('id', 'non-existent-id'),
        supabase.from('judging_locks').delete().neq('event_id', 'non-existent-id')
      ]);

      if (errScores.error) console.error('Error clearing scores:', errScores.error);
      if (errLocks.error) console.error('Error clearing locks:', errLocks.error);
    }

    return true;
  },

  async resetTestState() {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured');

    // Delete teams (and their members), attendance logs, scores, and judging lock states
    const [errTeams, errAtt, errScores, errLocks] = await Promise.all([
      supabase.from('teams').delete().neq('id', 'non-existent-id'),
      supabase.from('attendance').delete().neq('id', -1),
      supabase.from('scores').delete().neq('id', 'non-existent-id'),
      supabase.from('judging_locks').delete().neq('event_id', 'non-existent-id')
    ]);

    if (errTeams.error) console.error('Error clearing teams:', errTeams.error);
    if (errAtt.error) console.error('Error clearing attendance:', errAtt.error);
    if (errScores.error) console.error('Error clearing scores:', errScores.error);
    if (errLocks.error) console.error('Error clearing locks:', errLocks.error);

    return true;
  },

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
      passwords: await this.getPasswords(),
      contacts: await this.getContacts()
    };
    return JSON.stringify(backupData, null, 2);
  },

  // 8. CONTACTS MANAGEMENT (Student & Tech Co-ordinators)
  async getContacts() {
    try {
      const stored = localStorage.getItem('aidex_contacts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed.map((c, i) => ({
            ...c,
            profilePic: c.profilePic && !c.profilePic.includes('default_avatar') ? c.profilePic : (INITIAL_CONTACTS[i]?.profilePic || `/profile-pic/profile-pic-${(i % 3) + 1}.jpeg`)
          }));
        }
      }
    } catch (e) {}

    // Fallback seed with 3 contacts
    try {
      localStorage.setItem('aidex_contacts', JSON.stringify(INITIAL_CONTACTS));
    } catch (e) {}
    return INITIAL_CONTACTS;
  },

  async addContact(contact) {
    const contacts = await this.getContacts();
    const newContact = {
      id: contact.id || 'c-' + Date.now(),
      name: contact.name || '',
      role: contact.role || 'Co-ordinator',
      phone: contact.phone || '',
      email: contact.email || '',
      availability: contact.availability || 'Available Event Day',
      isPrimary: Boolean(contact.isPrimary),
      badgeText: contact.badgeText || (contact.isPrimary ? 'Primary Contact' : 'Co-ordinator'),
      profilePic: contact.profilePic || '/profile_pic/default_avatar.jpg',
      tags: Array.isArray(contact.tags) ? contact.tags : (contact.tags ? contact.tags.split(',').map(t => t.trim()) : ['Queries', 'Helpdesk'])
    };
    const updated = [...contacts, newContact];
    try {
      localStorage.setItem('aidex_contacts', JSON.stringify(updated));
    } catch (e) {}
    return newContact;
  },

  async updateContact(contact) {
    const contacts = await this.getContacts();
    const updated = contacts.map(c => c.id === contact.id ? { ...c, ...contact } : c);
    try {
      localStorage.setItem('aidex_contacts', JSON.stringify(updated));
    } catch (e) {}
    return contact;
  },

  async deleteContact(id) {
    const contacts = await this.getContacts();
    const updated = contacts.filter(c => c.id !== id);
    try {
      localStorage.setItem('aidex_contacts', JSON.stringify(updated));
    } catch (e) {}
    return true;
  },

  async uploadContactAvatar(file) {
    if (!file) throw new Error('No image file selected.');

    const fileExt = file.name.split('.').pop();
    const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `profile_pics/${fileName}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
          if (data?.publicUrl) return data.publicUrl;
        } else {
          console.warn('Supabase storage upload notice:', uploadError);
        }
      } catch (err) {
        console.warn('Supabase avatar upload notice:', err);
      }
    }

    // Fallback to Data URL for instant display
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
};

