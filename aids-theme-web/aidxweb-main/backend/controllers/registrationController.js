import SoloRegistration from '../models/SoloRegistration.js';
import TeamRegistration from '../models/TeamRegistration.js';
import EventModel from '../models/Event.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { generateSecureStudentCredentials, createSignedQrToken } from '../utils/tokenSigner.js';
import { sendRegistrationEmail } from '../utils/emailService.js';

const getEventCode = (eventTitle = '', eventId = '') => {
  if (eventId && typeof eventId === 'string' && eventId.startsWith('evt-')) {
    return eventId.replace('evt-', '').toUpperCase().slice(0, 4);
  }
  const clean = String(eventTitle).replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0].slice(0, 2) + words[1].slice(0, 2)).toUpperCase();
  }
  return clean.slice(0, 4).toUpperCase() || 'EVT';
};

export const toScanKey = (uid) => String(uid || '').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');

// --- Solo Registration ---
export const registerSolo = async (req, res) => {
    try {
        const { name, email, phone, password: customPassword, college, department, year, degree, event, paymentScreenshot, transactionId } = req.body;

        // Basic Validation
        if (!name || !email || !phone || !college || !department || !year || !event || !event.id) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        // Check if Event is Closed
        let dbEvent = null;
        if (event.id) {
            dbEvent = await EventModel.findOne({ id: event.id });
            if (!dbEvent && event.id.length === 24) {
                try { dbEvent = await EventModel.findById(event.id); } catch (e) { }
            }
        }

        if (dbEvent && dbEvent.isRegistrationClosed) {
            return res.status(400).json({ success: false, error: "Registrations for this event are closed." });
        }

        // Check for Slots Full
        if (dbEvent && dbEvent.maxSlots && dbEvent.maxSlots > 0 && dbEvent.registeredCount >= dbEvent.maxSlots) {
            return res.status(400).json({ success: false, error: "Event is full. No more slots available." });
        }

        const eventTitle = dbEvent?.title || event.title || 'Event';
        const eventId = dbEvent?.id || event.id || 'evt-1';
        const eventCode = getEventCode(eventTitle, eventId);

        const soloCount = await SoloRegistration.countDocuments({
            $or: [{ 'event.id': eventId }, { 'event.title': eventTitle }]
        });
        const teamCount = await TeamRegistration.countDocuments({
            $or: [{ 'event.id': eventId }, { 'event.title': eventTitle }]
        });

        const seqNum = String(soloCount + teamCount + 1).padStart(2, '0');
        const teamId = `TM-${eventCode}-${seqNum}`;
        
        // Email is used as the Student User ID
        const cleanEmail = email.toLowerCase().trim();
        const userId = cleanEmail;
        const password = (customPassword || '').trim() || generateSecureStudentCredentials().password;
        const qrToken = createSignedQrToken(userId, teamId);
        const barcode = `BC-${teamId}-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`;

        // Ensure student User account is created or updated
        try {
            let userAccount = await User.findOne({ email: cleanEmail });
            if (!userAccount) {
                userAccount = new User({
                    name,
                    email: cleanEmail,
                    passwordHash: password,
                    role: 'student',
                    phone: phone || '',
                    college: college || '',
                    department: department || '',
                    degree: degree || '',
                    year: year || ''
                });
                await userAccount.save();
            }
        } catch (uErr) {
            console.warn('Warning updating student user profile:', uErr.message);
        }

        const newRegistration = new SoloRegistration({
            name,
            email: cleanEmail,
            phone,
            college,
            department,
            year,
            degree,
            event: {
                id: eventId,
                title: eventTitle,
                image: dbEvent?.image?.url || event.image || ''
            },
            teamId,
            userId,
            password,
            qrToken,
            paymentScreenshot,
            transactionId: transactionId || `TXN_${Date.now()}`,
            paymentStatus: 'Free',
            verificationStatus: 'approved',
            isActive: true
        });

        await newRegistration.save();

        // Increment Registered Count
        if (dbEvent) {
            await EventModel.findByIdAndUpdate(dbEvent._id, { $inc: { registeredCount: 1 } });
        }

        // Initialize Attendance record with safe key
        const studentScansMap = {
            [toScanKey(userId)]: { userId, memberName: name, present: false, lunch: false, snacks: false }
        };
        const newAtt = new Attendance({
            teamId,
            present: false,
            lunch: false,
            snacks: false,
            studentScans: studentScansMap
        });
        await newAtt.save().catch((err) => console.error('Error saving solo attendance:', err));

        // Asynchronous email delivery (non-blocking)
        sendRegistrationEmail({
            toEmail: cleanEmail,
            studentName: name,
            teamName: `${name} (Solo)`,
            eventTitle,
            userId,
            password,
            qrToken,
            teamId
        }).catch(err => console.error('Email error:', err));

        console.log(`✅ Solo Registration: ${name} [${userId} | ${teamId}] for ${eventTitle}`);
        res.status(201).json({
            success: true,
            message: "Registration successful! Pass created (Pending Verification).",
            data: {
                registration: newRegistration,
                teamId,
                userId,
                password,
                qrToken,
                barcode,
                name,
                role: 'Leader',
                teamName: `${name} (Solo)`,
                event: { id: eventId, title: eventTitle },
                college,
                department,
                verificationStatus: 'pending',
                allMembers: [{
                    name,
                    userId,
                    email: cleanEmail,
                    role: 'Leader',
                    password,
                    qrToken,
                    barcode
                }]
            }
        });

    } catch (error) {
        console.error("❌ Solo Registration Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Team Registration ---
export const registerTeam = async (req, res) => {
    try {
        const { teamName, teamLeader, members = [], event, paymentScreenshot, transactionId } = req.body;

        // Basic Validation
        if (!teamName || !teamLeader || !event || !event.id) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        // Validate Team Leader
        if (!teamLeader.name || !teamLeader.phone || !teamLeader.email) {
            return res.status(400).json({ success: false, error: "Team Leader name, email, and phone are required." });
        }

        // Check if Event is Closed
        let dbEvent = null;
        if (event.id) {
            dbEvent = await EventModel.findOne({ id: event.id });
            if (!dbEvent && event.id.length === 24) {
                try { dbEvent = await EventModel.findById(event.id); } catch (e) { }
            }
        }

        if (dbEvent && dbEvent.isRegistrationClosed) {
            return res.status(400).json({ success: false, error: "Registrations for this event are closed." });
        }

        // Check for Slots Full
        if (dbEvent && dbEvent.maxSlots && dbEvent.maxSlots > 0 && dbEvent.registeredCount >= dbEvent.maxSlots) {
            return res.status(400).json({ success: false, error: "Event is full. No more slots available." });
        }

        const eventTitle = dbEvent?.title || event.title || 'Event';
        const eventId = dbEvent?.id || event.id || 'evt-1';
        const eventCode = getEventCode(eventTitle, eventId);

        const existingCount = await TeamRegistration.countDocuments({
            $or: [{ 'event.id': eventId }, { 'event.title': eventTitle }]
        });
        const soloCount = await SoloRegistration.countDocuments({
            $or: [{ 'event.id': eventId }, { 'event.title': eventTitle }]
        });

        const seqNum = String(existingCount + soloCount + 1).padStart(2, '0');
        const teamId = `TM-${eventCode}-${seqNum}`;

        // Leader credentials: email as userId, student-chosen password
        const leaderEmail = teamLeader.email.toLowerCase().trim();
        const leaderUserId = leaderEmail;
        const leaderPassword = (teamLeader.password || '').trim() || generateSecureStudentCredentials().password;
        const leaderQrToken = createSignedQrToken(leaderUserId, teamId);

        const leaderBarcode = `BC-${teamId}-${leaderEmail.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`;

        // Ensure leader User account is created or updated
        try {
            let leaderAccount = await User.findOne({ email: leaderEmail });
            if (!leaderAccount) {
                leaderAccount = new User({
                    name: teamLeader.name,
                    email: leaderEmail,
                    passwordHash: leaderPassword,
                    role: 'student',
                    phone: teamLeader.phone || '',
                    college: teamLeader.college || '',
                    department: teamLeader.department || '',
                    year: teamLeader.year || ''
                });
                await leaderAccount.save();
            }
        } catch (uErr) {
            console.warn('Warning updating leader user account:', uErr.message);
        }

        const formattedLeader = {
            ...teamLeader,
            email: leaderEmail,
            userId: leaderUserId,
            role: 'Leader',
            password: leaderPassword,
            qrToken: leaderQrToken,
            barcode: leaderBarcode
        };

        // Every member gets their own separate email userId, custom password, individual QR token and Barcode
        const formattedMembers = await Promise.all((members || []).map(async (m, idx) => {
            const mEmail = (m.email || '').toLowerCase().trim() || `member${idx + 1}.${leaderEmail}`;
            const mUserId = mEmail;
            const mPassword = (m.password || '').trim() || generateSecureStudentCredentials().password;
            const mQrToken = createSignedQrToken(mUserId, teamId);
            const mBarcode = `BC-${teamId}-${mEmail.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`;

            // Ensure member User account is created or updated
            try {
                let memberAccount = await User.findOne({ email: mEmail });
                if (!memberAccount) {
                    memberAccount = new User({
                        name: m.name || `Member ${idx + 2}`,
                        email: mEmail,
                        passwordHash: mPassword,
                        role: 'student',
                        phone: m.phone || '',
                        college: teamLeader.college || '',
                        department: teamLeader.department || '',
                        year: teamLeader.year || ''
                    });
                    await memberAccount.save();
                }
            } catch (mErr) {
                console.warn('Warning updating member user account:', mErr.message);
            }

            return {
                ...m,
                email: mEmail,
                userId: mUserId,
                role: 'Member',
                password: mPassword,
                qrToken: mQrToken,
                barcode: mBarcode
            };
        }));

        const newRegistration = new TeamRegistration({
            teamId,
            teamName,
            teamLeader: formattedLeader,
            members: formattedMembers,
            event: {
                id: eventId,
                title: eventTitle,
                image: dbEvent?.image?.url || event.image || ''
            },
            college: teamLeader.college || '',
            department: teamLeader.department || '',
            paymentScreenshot,
            transactionId: transactionId || `TXN_${Date.now()}`,
            paymentStatus: 'Free',
            verificationStatus: 'approved',
            isActive: true
        });

        await newRegistration.save();

        // Increment Registered Count
        if (dbEvent) {
            await EventModel.findByIdAndUpdate(dbEvent._id, { $inc: { registeredCount: 1 } });
        }

        // Initialize Attendance document with independent tracking for EACH individual member
        const studentScansMap = {
            [toScanKey(leaderUserId)]: { userId: leaderUserId, memberName: teamLeader.name, present: false, lunch: false, snacks: false }
        };
        formattedMembers.forEach(m => {
            studentScansMap[toScanKey(m.userId)] = { userId: m.userId, memberName: m.name, present: false, lunch: false, snacks: false };
        });

        const newAtt = new Attendance({
            teamId,
            present: false,
            lunch: false,
            snacks: false,
            studentScans: studentScansMap
        });
        await newAtt.save().catch((err) => console.error('Error saving team attendance:', err));

        // Asynchronous email delivery to leader and members
        if (leaderEmail) {
            sendRegistrationEmail({
                toEmail: leaderEmail,
                studentName: teamLeader.name,
                teamName,
                eventTitle,
                userId: leaderUserId,
                password: leaderPassword,
                qrToken: leaderQrToken,
                teamId
            }).catch(err => console.error('Leader email error:', err));
        }

        formattedMembers.forEach(m => {
            if (m.email) {
                sendRegistrationEmail({
                    toEmail: m.email,
                    studentName: m.name,
                    teamName,
                    eventTitle,
                    userId: m.userId,
                    password: m.password,
                    qrToken: m.qrToken,
                    teamId
                }).catch(err => console.error('Member email error:', err));
            }
        });

        console.log(`✅ Team Registration: ${teamName} [${teamId}] with leader ${teamLeader.name} [${leaderUserId}] & ${formattedMembers.length} separate member passes`);
        res.status(201).json({
            success: true,
            message: "Team Registration successful! Separate passes generated for every team member.",
            data: {
                registration: newRegistration,
                teamId,
                userId: leaderUserId,
                password: leaderPassword,
                qrToken: leaderQrToken,
                barcode: leaderBarcode,
                name: teamLeader.name,
                role: 'Leader',
                teamName,
                event: { id: eventId, title: eventTitle },
                college: teamLeader.college,
                department: teamLeader.department,
                allMembers: [formattedLeader, ...formattedMembers]
            }
        });

    } catch (error) {
        console.error("❌ Team Registration Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Admin: Get Solo Registrations ---
export const getSoloRegistrations = async (req, res) => {
    try {
        const registrations = await SoloRegistration.find().sort({ createdAt: -1 });
        res.json({ success: true, data: registrations });
    } catch (error) {
        console.error("❌ Fetch Solo Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Admin: Get Team Registrations ---
export const getTeamRegistrations = async (req, res) => {
    try {
        const registrations = await TeamRegistration.find().sort({ createdAt: -1 });
        res.json({ success: true, data: registrations });
    } catch (error) {
        console.error("❌ Fetch Team Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
