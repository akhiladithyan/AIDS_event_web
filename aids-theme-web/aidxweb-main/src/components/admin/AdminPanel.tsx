import React, { useState, useEffect } from 'react';
import {
    FaTimes,
    FaSave,
    FaPlus,
    FaTrash,
    FaArrowLeft,
    FaCheck,
    FaDownload,
    FaImage,
    FaUsers,
    FaList,
    FaFont,
    FaFileAlt,
    FaEye,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { FileUploader } from './FileUploader';
import config from '../../config';
import { Content, Event, TeamMember, Registration, MediaAsset } from '../../types/admin';

// Default / Empty States
const emptyEvent: Event = {
    id: '',
    title: '',
    date: '',
    time: '',
    description: '',
    image: null,
    category: 'Cultural',
    participationType: 'Solo',
    teamSize: '',
    coordinatorPhone: '', // Event coordinator contact
    isPassEvent: true, // Default to Pass-based pricing
    isFree: false, // Default to Paid
    ticketTiers: [],
    entryFee: 0,
    rules: [],
    maxSlots: 100,
    registeredCount: 0,
    isRegistrationClosed: false,
    importantNote: ''
};

const emptyTeamMember: TeamMember = {
    name: '',
    role: '',
    category: 'Volunteers / Core Committee',
    image: null,
    instagram: '',
    linkedin: '',
    isActive: true,
    order: 0
};

const teamCategories = [
    'Faculty Coordinators',
    'Student Coordinators',
    'Event Coordinators',
    'Club Members',
    "AIDEX'26 Club",
    'Cultural Team',
    'Technical Team',
    'Design & Media Team',
    'Volunteers / Core Committee',
];

interface AdminPanelProps {
    content: Content;
    setContent: (content: Content) => void;
    events: Event[];
    setEvents: (events: Event[]) => void;
    settings: { registrationOpen: boolean };
    setSettings: (settings: { registrationOpen: boolean }) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ content, setContent, events, setEvents, settings, setSettings, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newEvent, setNewEvent] = useState<Event>(emptyEvent);

    const [newGalleryUrl, setNewGalleryUrl] = useState('');
    const [newRule, setNewRule] = useState('');
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [newTeamMember, setNewTeamMember] = useState<TeamMember>(emptyTeamMember);
    const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [isLoadingRegs, setIsLoadingRegs] = useState(false);
    const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all'); // 'all' or eventId

    // Registration View Modal State
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

    // --- NEW: Search / Filter / Bulk Verify state ---
    const [regSearch, setRegSearch] = useState('');
    const [regStatusFilter, setRegStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
    const [selectedRegIds, setSelectedRegIds] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // --- NEW: Announcement state ---
    const [announcement, setAnnouncement] = useState('');
    const [announcementActive, setAnnouncementActive] = useState(false);
    const [announcementSaving, setAnnouncementSaving] = useState(false);

    // --- NEW: Winners state ---
    const [winnersEventId, setWinnersEventId] = useState<string>('');
    const [winnersForm, setWinnersForm] = useState<{ place: number; name: string; teamName: string }[]>([
        { place: 1, name: '', teamName: '' },
        { place: 2, name: '', teamName: '' },
        { place: 3, name: '', teamName: '' },
    ]);
    const [winnersSaving, setWinnersSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (activeTab === 'registrations') fetchRegistrations();
            if (activeTab === 'team') fetchTeamMembers();
            if (activeTab === 'announcement') fetchAnnouncement();
            if (activeTab === 'winners' && !winnersEventId && events.length > 0) {
                const firstEventId = events[0].id;
                setWinnersEventId(firstEventId);
                loadWinnersForEvent(firstEventId);
            }
        }
    }, [isOpen, activeTab]);

    const fetchTeamMembers = async () => {
        try {
            const res = await fetch(`${config.API_URL}/team`);
            const data = await res.json();
            if (data.success) setTeamMembers(data.data);
        } catch (error) {
            console.error("Failed to fetch team", error);
        }
    };

    const fetchRegistrations = async () => {
        setIsLoadingRegs(true);
        try {
            const [soloRes, teamRes, legacyRes] = await Promise.all([
                fetch(`${config.API_URL}/admin/registrations/solo`).catch(() => null),
                fetch(`${config.API_URL}/admin/registrations/team`).catch(() => null),
                fetch(`${config.API_URL}/admin/registrations`).catch(() => null)
            ]);

            const soloData = soloRes ? await soloRes.json().catch(() => ({})) : {};
            const teamData = teamRes ? await teamRes.json().catch(() => ({})) : {};
            const legacyData = legacyRes ? await legacyRes.json().catch(() => ({})) : {};

            let combined: Registration[] = [];
            const seenIds = new Set<string>();

            if (soloData.success && Array.isArray(soloData.data)) {
                soloData.data.forEach((r: any) => {
                    const eventObj = r.event || {};
                    const id = r._id || r.id;
                    if (id) seenIds.add(id);
                    combined.push({
                        ...r,
                        _id: id || Math.random().toString(),
                        participationType: 'Solo',
                        eventId: eventObj.id || r.eventId,
                        eventName: eventObj.title || r.eventName || events.find(e => e.id === (eventObj.id || r.eventId))?.title || "Unknown Event"
                    });
                });
            }

            if (teamData.success && Array.isArray(teamData.data)) {
                teamData.data.forEach((t: any) => {
                    const eventObj = t.event || {};
                    const id = t._id || t.id;
                    if (id) seenIds.add(id);
                    combined.push({
                        ...t,
                        _id: id || Math.random().toString(),
                        participationType: 'Team',
                        name: `${t.teamName || 'Team'} (Team)`,
                        email: t.teamLeader?.email || "N/A",
                        phone: t.teamLeader?.phone || "N/A",
                        college: t.teamLeader?.college || "N/A",
                        department: t.teamLeader?.department || "N/A",
                        year: t.teamLeader?.year || "N/A",
                        degree: "N/A",
                        course: "N/A",
                        teamLeader: t.teamLeader,
                        members: t.members,
                        eventId: eventObj.id || t.eventId,
                        eventName: eventObj.title || t.eventName || events.find(e => e.id === (eventObj.id || t.eventId))?.title || "Unknown Event"
                    });
                });
            }

            if (legacyData.success && Array.isArray(legacyData.data)) {
                legacyData.data.forEach((l: any) => {
                    const id = l._id || l.id;
                    if (id && !seenIds.has(id)) {
                        seenIds.add(id);
                        combined.push({
                            ...l,
                            _id: id,
                            participationType: l.teamName ? 'Team' : 'Solo',
                            eventName: l.eventName || events.find(e => e.id === l.eventId)?.title || l.eventId || "Unknown Event"
                        });
                    }
                });
            }

            // Sort by Date (newest first)
            combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

            setRegistrations(combined);
            return combined;
        } catch (error) {
            console.error("Failed to load registrations", error);
            alert("Failed to load registrations data");
            return [];
        } finally {
            setIsLoadingRegs(false);
        }
    };

    // --- Cloudinary Logic ---
    const [cloudinaryImages, setCloudinaryImages] = useState<any[]>([]);
    const [isLoadingCloudinary, setIsLoadingCloudinary] = useState(false);

    const fetchCloudinaryImages = async () => {
        setIsLoadingCloudinary(true);
        try {
            const res = await fetch(`${config.API_URL}/admin/cloudinary`);
            const data = await res.json();
            if (data.success) {
                setCloudinaryImages(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch cloudinary images", error);
        }
        setIsLoadingCloudinary(false);
    };

    const handleDeleteCloudinary = async (public_id: string) => {
        if (!window.confirm("Are you sure? This will break any links using this image!")) return;
        try {
            const encodedId = encodeURIComponent(public_id);
            const res = await fetch(`${config.API_URL}/admin/cloudinary/${encodedId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setCloudinaryImages(prev => prev.filter(img => img.public_id !== public_id));
            } else {
                alert("Failed to delete: " + data.error);
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert("Delete failed");
        }
    };

    useEffect(() => {
        if (isOpen && activeTab === 'cloudinary') {
            fetchCloudinaryImages();
        }
    }, [isOpen, activeTab]);

    // --- NEW: Fetch current announcement from content ---
    const fetchAnnouncement = async () => {
        try {
            const res = await fetch(`${config.API_URL}/content`);
            const data = await res.json();
            if (data.success && data.data) {
                setAnnouncement(data.data.announcement || '');
                setAnnouncementActive(!!data.data.announcementActive);
            }
        } catch (e) { console.error('Failed to fetch announcement', e); }
    };

    const saveAnnouncement = async () => {
        setAnnouncementSaving(true);
        try {
            const res = await fetch(`${config.API_URL}/content/announcement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ announcement, announcementActive }),
            });
            const data = await res.json();
            if (data.success) {
                alert(announcementActive ? '✅ Announcement published!' : '✅ Announcement hidden.');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (e: any) {
            alert(`Failed: ${e.message}`);
        } finally {
            setAnnouncementSaving(false);
        }
    };

    // --- NEW: Winners handlers ---
    const loadWinnersForEvent = async (eventId: string) => {
        const event = events.find(e => e.id === eventId || (e as any)._id === eventId);
        if (event && (event as any).winners) {
            const w = (event as any).winners as { place: number; name: string; teamName: string }[];
            setWinnersForm([
                w.find(x => x.place === 1) || { place: 1, name: '', teamName: '' },
                w.find(x => x.place === 2) || { place: 2, name: '', teamName: '' },
                w.find(x => x.place === 3) || { place: 3, name: '', teamName: '' },
            ]);
        } else {
            setWinnersForm([
                { place: 1, name: '', teamName: '' },
                { place: 2, name: '', teamName: '' },
                { place: 3, name: '', teamName: '' },
            ]);
        }
    };

    const saveWinners = async () => {
        if (!winnersEventId) { alert('Please select an event.'); return; }
        setWinnersSaving(true);
        try {
            const res = await fetch(`${config.API_URL}/events/winners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: winnersEventId, winners: winnersForm.filter(w => w.name || w.teamName) }),
            });
            const data = await res.json();
            if (data.success) {
                alert('✅ Winners saved and published!');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (e: any) {
            alert(`Failed: ${e.message}`);
        } finally {
            setWinnersSaving(false);
        }
    };

    // --- NEW: Bulk verify/reject ---
    const handleBulkVerify = async (isActive: boolean) => {
        if (selectedRegIds.size === 0) { alert('No registrations selected.'); return; }
        if (!window.confirm(`${isActive ? 'Verify' : 'Reject'} ${selectedRegIds.size} registration(s)?`)) return;
        setIsBulkProcessing(true);
        try {
            const res = await fetch(`${config.API_URL}/admin/verify-bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationIds: Array.from(selectedRegIds), isActive }),
            });
            const data = await res.json();
            if (data.success) {
                // Optimistic UI update
                setRegistrations(prev =>
                    prev.map(r => selectedRegIds.has(r._id) ? { ...r, isActive } : r)
                );
                setSelectedRegIds(new Set());
                alert(`✅ ${data.updatedCount} registration(s) ${isActive ? 'verified' : 'rejected'}.`);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (e: any) {
            alert(`Failed: ${e.message}`);
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const saveContentToBackend = async (newContent: Content, silent = false) => {
        try {
            // 🛡️ SANITIZATION: Ensure all media assets are objects before sending
            const sanitizedContent = { ...newContent };

            // 1. Sanitize Gallery Images
            if (Array.isArray(sanitizedContent.galleryImages)) {
                sanitizedContent.galleryImages = sanitizedContent.galleryImages.map(img => {
                    // @ts-ignore - handling string legacy data
                    if (typeof img === 'string') {
                        const urlString = img as string;
                        // Auto-detect type roughly
                        const isVid = urlString.match(/\.(mp4|webm|ogg)$/i);
                        return { url: urlString, type: isVid ? 'video' : 'image' } as MediaAsset;
                    }
                    return img;
                }).filter(Boolean); // Remove nulls/undefined
            }

            // 2. Sanitize Hero Media
            // @ts-ignore - handling string legacy data
            if (sanitizedContent.heroBackgroundMedia && typeof sanitizedContent.heroBackgroundMedia === 'string') {
                const img = sanitizedContent.heroBackgroundMedia as unknown as string;
                const isVid = img.match(/\.(mp4|webm|ogg)$/i);
                sanitizedContent.heroBackgroundMedia = { url: img, type: isVid ? 'video' : 'image' } as MediaAsset;
            }

            const res = await fetch(`${config.API_URL}/content/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: sanitizedContent }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Server Error");

            if (!silent) alert("Changes Saved to Database!");
        } catch (error: any) {
            console.error("Failed to save content", error);
            alert(`Error saving content: ${error.message}`);
        }
    };

    const saveEventsToBackend = async (newEvents: Event[]) => {
        try {
            await fetch(`${config.API_URL}/events/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: newEvents }),
            });
        } catch (error) {
            console.error("Failed to save events", error);
        }
    };


    // --- TEAM MEMBER CRUD HANDLERS ---
    const handleSaveTeamMember = async () => {
        try {
            const { name, role, category, image, instagram, linkedin } = newTeamMember;

            if (!name || !role || !category) {
                alert("Name, role, and category are required!");
                return;
            }

            if (editingTeamId) {
                // Update existing member
                const res = await fetch(`${config.API_URL}/team/update/${editingTeamId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, role, category, image, instagram, linkedin }),
                });
                const data = await res.json();

                if (data.success) {
                    // Update local state
                    setTeamMembers(prev => prev.map(m => m._id === editingTeamId ? data.data : m));
                    alert("Team member updated successfully!");
                } else {
                    alert(`Error: ${data.error}`);
                }
            } else {
                // Add new member
                const res = await fetch(`${config.API_URL}/team/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, role, category, image, instagram, linkedin }),
                });
                const data = await res.json();

                if (data.success) {
                    // Add to local state
                    setTeamMembers(prev => [...prev, data.data]);
                    alert("Team member added successfully!");
                } else {
                    alert(`Error: ${data.error}`);
                }
            }

            // Reset form
            setNewTeamMember(emptyTeamMember);
            setIsAddingTeamMember(false);
            setEditingTeamId(null);
        } catch (error: any) {
            console.error("Failed to save team member", error);
            alert(`Failed to save: ${error.message}`);
        }
    };

    const handleDeleteTeamMember = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this team member?")) return;

        try {
            const res = await fetch(`${config.API_URL}/team/delete/${encodeURIComponent(id)}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success || res.ok) {
                // Remove from local state
                setTeamMembers(prev => prev.filter(m => m._id !== id && m.id !== id && m.name !== id));
                alert("Team member deleted successfully!");
            } else {
                alert(`Error: ${data.error || 'Failed to delete'}`);
            }
        } catch (error: any) {
            console.error("Failed to delete team member", error);
            // Still update state locally as fallback
            setTeamMembers(prev => prev.filter(m => m._id !== id && m.id !== id && m.name !== id));
            alert("Team member deleted from view!");
        }
    };

    const handleEditTeamMember = (member: TeamMember) => {
        setNewTeamMember(member);
        setEditingTeamId(member._id || null);
        setIsAddingTeamMember(true);
    };

    const cancelTeamEdit = () => {
        setNewTeamMember(emptyTeamMember);
        setIsAddingTeamMember(false);
        setEditingTeamId(null);
    };

    // --- CSV Export ---
    const handleDownloadCSV = async () => {
        let listToExport = registrations;

        if (listToExport.length === 0) {
            listToExport = await fetchRegistrations();
        }

        if (selectedEventFilter !== 'all' && selectedEventFilter !== 'all-list') {
            listToExport = listToExport.filter(r => r.eventId === selectedEventFilter);
        }

        if (listToExport.length === 0) {
            alert("No registrations available to export!");
            return;
        }

        const headers = [
            "Reg ID", "Role", "Name", "Email", "Phone", "College", "Department", "Year", "Degree", "Course",
            "Event", "Participation Type", "Team Name", "Status", "Payment Status", "Transaction ID", "ID Card URL", "Payment Screenshot", "Date Registered"
        ];

        const escapeCsv = (val: any) => {
            if (val === undefined || val === null) return '""';
            const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `"${str.replace(/"/g, '""')}"`;
        };

        const csvRows = [headers.join(',')];

        listToExport.forEach(reg => {
            const pType = reg.participationType || (reg.teamName ? 'Team' : 'Solo');
            const eventName = reg.eventName || events.find(e => e.id === reg.eventId)?.title || reg.eventId || "Unknown Event";
            const screenshotUrl = reg.paymentScreenshotUrl || (reg as any).paymentScreenshot || "";
            const txnId = (reg as any).transactionId || "";
            const dateStr = reg.createdAt ? new Date(reg.createdAt).toLocaleString('en-IN') : "N/A";

            if (pType === 'Team') {
                const leader = (reg as any).teamLeader;
                if (leader) {
                    const row = [
                        escapeCsv(reg._id),
                        escapeCsv("Team Leader"),
                        escapeCsv(leader.name || reg.name),
                        escapeCsv(leader.email || reg.email),
                        escapeCsv(leader.phone || reg.phone),
                        escapeCsv(leader.college || reg.college),
                        escapeCsv(leader.department || (reg as any).department),
                        escapeCsv(leader.year || (reg as any).year),
                        escapeCsv("N/A"),
                        escapeCsv("N/A"),
                        escapeCsv(eventName),
                        escapeCsv("Team"),
                        escapeCsv(reg.teamName || "N/A"),
                        escapeCsv(reg.isActive ? "Verified" : "Pending"),
                        escapeCsv(reg.paymentStatus || "Pending"),
                        escapeCsv(txnId),
                        escapeCsv(leader.idCardUrl || (reg as any).idCardUrl || ""),
                        escapeCsv(screenshotUrl),
                        escapeCsv(dateStr)
                    ];
                    csvRows.push(row.join(','));
                }

                if (Array.isArray((reg as any).members)) {
                    (reg as any).members.forEach((member: any, idx: number) => {
                        const row = [
                            escapeCsv(reg._id),
                            escapeCsv(`Member ${idx + 1}`),
                            escapeCsv(member.name),
                            escapeCsv(member.email),
                            escapeCsv(member.phone),
                            escapeCsv(member.college),
                            escapeCsv(member.department),
                            escapeCsv(member.year),
                            escapeCsv("N/A"),
                            escapeCsv("N/A"),
                            escapeCsv(eventName),
                            escapeCsv("Team"),
                            escapeCsv(reg.teamName || "N/A"),
                            escapeCsv(reg.isActive ? "Verified" : "Pending"),
                            escapeCsv(reg.paymentStatus || "Pending"),
                            escapeCsv(txnId),
                            escapeCsv(member.idCardUrl || ""),
                            escapeCsv(""),
                            escapeCsv(dateStr)
                        ];
                        csvRows.push(row.join(','));
                    });
                }
            } else {
                // Solo Row
                const row = [
                    escapeCsv(reg._id),
                    escapeCsv("Individual"),
                    escapeCsv(reg.name),
                    escapeCsv(reg.email),
                    escapeCsv(reg.phone),
                    escapeCsv(reg.college),
                    escapeCsv((reg as any).department || ""),
                    escapeCsv((reg as any).year || ""),
                    escapeCsv((reg as any).degree || ""),
                    escapeCsv((reg as any).course || ""),
                    escapeCsv(eventName),
                    escapeCsv("Solo"),
                    escapeCsv("N/A"),
                    escapeCsv(reg.isActive ? "Verified" : "Pending"),
                    escapeCsv((reg as any).paymentStatus || "Pending"),
                    escapeCsv(txnId),
                    escapeCsv((reg as any).idCardUrl || ""),
                    escapeCsv(screenshotUrl),
                    escapeCsv(dateStr)
                ];
                csvRows.push(row.join(','));
            }
        });

        // Add UTF-8 BOM so Excel opens Unicode properly without encoding issues
        const rawContent = '\uFEFF' + csvRows.join('\n');
        const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rawContent);

        const cleanFilter = (selectedEventFilter !== 'all' && selectedEventFilter !== 'all-list')
            ? String(selectedEventFilter).replace(/[^a-zA-Z0-9_-]/g, '_')
            : 'all';

        const fileName = `aidex_registrations_${cleanFilter}_${new Date().toISOString().slice(0, 10)}.csv`;

        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Registration Verification ---
    const handleVerifyRegistration = async (reg: Registration) => {
        // Optimistic Update
        const updatedRegs = registrations.map(r => r._id === reg._id ? { ...r, isActive: true } : r);
        setRegistrations(updatedRegs);
        if (selectedRegistration && selectedRegistration._id === reg._id) {
            setSelectedRegistration({ ...selectedRegistration, isActive: true });
        }

        try {
            await fetch(`${config.API_URL}/admin/verify-registration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationId: reg._id, isActive: true })
            });
            console.log("Verified user:", reg.name);
            // alert(`User ${reg.name} Verified!`); // Optional: Remove alert for smoother UX
        } catch (error) {
            console.error("Verification failed", error);
            alert("Verification failed");
            // Revert optimistic update
            setRegistrations(registrations);
        }
    };


    if (!isOpen) return null;

    const handleContentChange = (key: keyof Content, value: any) => {
        setContent({ ...content, [key]: value });
    };

    const handlePriceChange = (tier: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setContent({
            ...content,
            ticketPrices: {
                ...content.ticketPrices,
                [tier]: numValue
            }
        });
    };

    const handleAddGalleryItem = async () => {
        if (newGalleryUrl.trim()) {
            const currentImages = content.galleryImages || [];
            const newImage: MediaAsset = { url: newGalleryUrl.trim(), type: 'image' };
            const updatedImages = [...currentImages, newImage];
            const newContentObj = { ...content, galleryImages: updatedImages };
            setContent(newContentObj);
            setNewGalleryUrl('');
            await saveContentToBackend(newContentObj, true);
        }
    };

    const handleDeleteGalleryItem = async (index: number) => {
        if (window.confirm("Delete this image permanently?")) {
            const currentImages = content.galleryImages || [];
            const updatedGallery = currentImages.filter((_, i) => i !== index);
            const newContentObj = { ...content, galleryImages: updatedGallery };
            setContent(newContentObj);
            await saveContentToBackend(newContentObj, true);
        }
    };

    const handleAddFaq = async () => {
        if (newFaq.question.trim() && newFaq.answer.trim()) {
            const currentFaqs = content.faqs || [];
            const updatedFaqs = [...currentFaqs, newFaq];
            const newContentObj = { ...content, faqs: updatedFaqs };
            setContent(newContentObj);
            setNewFaq({ question: '', answer: '' });
            await saveContentToBackend(newContentObj, true);
        }
    };

    const handleDeleteFaq = async (index: number) => {
        if (window.confirm("Delete this FAQ?")) {
            const currentFaqs = content.faqs || [];
            const updatedFaqs = currentFaqs.filter((_, i) => i !== index);
            const newContentObj = { ...content, faqs: updatedFaqs };
            setContent(newContentObj);
            await saveContentToBackend(newContentObj, true);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            const updatedEvents = events.filter((e) => e.id !== id && (e as any)._id !== id && e.title !== id);
            setEvents(updatedEvents);

            try {
                const res = await fetch(`${config.API_URL}/events/delete/${encodeURIComponent(id)}`, {
                    method: 'DELETE',
                });
                const data = await res.json();
                if (!data.success) {
                    await saveEventsToBackend(updatedEvents);
                }
            } catch (error) {
                await saveEventsToBackend(updatedEvents);
            }
            alert("Event deleted successfully!");
        }
    };

    const handleEditEvent = (event: Event) => {
        setNewEvent({
            ...event,
            ticketTiers: event.ticketTiers || [],
            rules: event.rules || [],
            maxSlots: event.maxSlots || 100,
            registeredCount: event.registeredCount || 0,
            // Ensure defaults for new fields
            isPassEvent: event.isPassEvent !== undefined ? event.isPassEvent : true,
            entryFee: event.entryFee || 0
        });
        setEditingId(event.id);
        setIsAddingEvent(true);
    };

    const handleSaveEvent = () => {
        if (!newEvent.title || !newEvent.description) {
            alert("Please fill in all required fields (Title, Description)");
            return;
        }

        let updatedEvents;
        if (editingId) {
            updatedEvents = events.map((e) =>
                e.id === editingId ? { ...newEvent, id: editingId, image: newEvent.image || e.image } : e
            );
        } else {
            const eventToAdd: Event = {
                ...newEvent,
                id: Date.now().toString(),
                image:
                    newEvent.image ||
                    { url: 'https://images.unsplash.com/photo-1514525253440-b393452e8d03?q=80&w=2070&auto=format&fit=crop', type: 'image' }
            };
            updatedEvents = [...events, eventToAdd];
        }

        setEvents(updatedEvents);
        saveEventsToBackend(updatedEvents);
        alert("Event Saved Successfully!");
        resetForm();
    };

    const resetForm = () => {
        setIsAddingEvent(false);
        setNewEvent(emptyEvent);
        setEditingId(null);
        setNewRule('');
    };

    const toggleTicketTier = (tier: string) => {
        if (newEvent.ticketTiers.includes(tier)) {
            setNewEvent({ ...newEvent, ticketTiers: newEvent.ticketTiers.filter((t) => t !== tier) });
        } else {
            setNewEvent({ ...newEvent, ticketTiers: [...newEvent.ticketTiers, tier] });
        }
    };

    const handleAddRule = () => {
        if (newRule.trim()) {
            setNewEvent({ ...newEvent, rules: [...(newEvent.rules || []), newRule.trim()] });
            setNewRule('');
        }
    };

    const handleRemoveRule = (index: number) => {
        setNewEvent({ ...newEvent, rules: newEvent.rules.filter((_, i) => i !== index) });
    };

    // --- TEAM MEMBER LOGIC (Handlers defined above) ---

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 md:p-6 text-white">
            <div className="bg-[#111] border border-white/10 w-full max-w-6xl h-full md:max-h-[90vh] overflow-hidden rounded-2xl flex flex-col shadow-2xl relative">

                {/* HEADER */}
                <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-[#151515]">
                    <div className="flex items-center gap-3">
                        {isAddingEvent && (
                            <button
                                onClick={resetForm}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                title="Back"
                            >
                                <FaArrowLeft size={20} className="text-gray-400" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {isAddingEvent ? (editingId ? 'Edit Event' : 'Create New Event') : 'Admin Dashboard'}
                            </h2>
                            <p className="text-gray-400 text-xs md:text-sm">
                                {isAddingEvent ? 'Enter event details below' : 'Manage website content dynamically'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                        title="Close"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* NAVIGATION TABS */}
                {!isAddingEvent && !isAddingTeamMember && (
                    <div className="flex border-b border-white/10 overflow-x-auto">
                        {['general', 'events', 'registrations', 'team', 'faq', 'cloudinary', 'analytics', 'announcement', 'winners'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 min-w-[120px] py-4 text-sm font-medium transition-colors capitalize ${activeTab === tab
                                    ? 'bg-[#39ff88]/20 text-[#39ff88] border-b-2 border-[#39ff88] font-bold'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab === 'general' ? 'General Settings'
                                    : tab === 'faq' ? 'Manage FAQs'
                                    : tab === 'analytics' ? '📊 Analytics'
                                    : tab === 'announcement' ? '📣 Announcement'
                                    : tab === 'winners' ? '🏆 Winners'
                                    : tab}
                            </button>
                        ))}
                    </div>
                )}

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0f0f0f]">
                    {/* --- GENERAL SETTINGS --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/5 space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">Global Preferences</h3>

                                <div className="flex items-center justify-between p-4 bg-[#222] rounded-lg">
                                    <div>
                                        <h4 className="font-bold text-white">Enable Ticket Pass System</h4>
                                        <p className="text-sm text-gray-400">If enabled, events can be linked to Diamond/Gold/Silver passes.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={content.isTicketPassEnabled !== false}
                                            onChange={(e) => {
                                                const newVal = e.target.checked;
                                                setContent({ ...content, isTicketPassEnabled: newVal });
                                                saveContentToBackend({ ...content, isTicketPassEnabled: newVal }, true);
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                {/* Registration Open/Close Toggle */}
                                <div className="flex items-center justify-between p-4 bg-[#222] rounded-lg border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            {settings?.registrationOpen ? <FaCheck className="text-green-400" /> : <FaTimes className="text-red-400" />}
                                            Registration Status
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            {settings?.registrationOpen
                                                ? "Registrations are currently OPEN taking new entries."
                                                : "Registrations are CLOSED. No new entries accepted."}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings?.registrationOpen ?? true}
                                            onChange={async (e) => {
                                                const newVal = e.target.checked;
                                                // Optimistic update
                                                setSettings({ ...settings, registrationOpen: newVal });

                                                try {
                                                    const res = await fetch(`${config.API_URL}/settings/update`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ registrationOpen: newVal }),
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        // alert(`Registrations are now ${newVal ? 'OPEN' : 'CLOSED'}`);
                                                    } else {
                                                        alert("Failed to update settings");
                                                        setSettings({ ...settings, registrationOpen: !newVal }); // Revert
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    setSettings({ ...settings, registrationOpen: !newVal }); // Revert
                                                    alert("Error updating settings");
                                                }
                                            }}
                                        />
                                        <div className={`w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings?.registrationOpen ? 'peer-checked:bg-green-600' : 'peer-checked:bg-red-600'}`}></div>
                                    </label>
                                </div>

                                {/* Global Payment Toggle */}
                                <div className="flex items-center justify-between p-4 bg-[#222] rounded-lg">
                                    <div>
                                        <h4 className="font-bold text-white">Accept Payments Online</h4>
                                        <p className="text-sm text-gray-400">Enable or disable payment processing globally.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={content.isPaymentEnabled !== false}
                                            onChange={(e) => {
                                                const newVal = e.target.checked;
                                                setContent({ ...content, isPaymentEnabled: newVal });
                                                saveContentToBackend({ ...content, isPaymentEnabled: newVal }, true);
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Ticket Prices */}
                            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/5 space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">Ticket Prices</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['diamond', 'gold', 'silver'].map((tier) => (
                                        <div key={tier} className="space-y-2">
                                            <label className="text-gray-400 text-sm capitalize">{tier} Pass (₹)</label>
                                            <input
                                                type="number"
                                                value={content.ticketPrices?.[tier] || 0}
                                                onChange={(e) => {
                                                    const newPrices = { ...(content.ticketPrices || {}), [tier]: parseInt(e.target.value) || 0 };
                                                    const newContent = { ...content, ticketPrices: newPrices };
                                                    setContent(newContent);
                                                    saveContentToBackend(newContent, true);
                                                }}
                                                className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Configuration */}
                            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/5 space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">Payment Configuration</h3>

                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm">UPI ID</label>
                                    <input
                                        type="text"
                                        value={content.upiId || ''}
                                        onChange={(e) => {
                                            const newContent = { ...content, upiId: e.target.value };
                                            setContent(newContent);
                                            saveContentToBackend(newContent, true);
                                        }}
                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                        placeholder="yourname@upi"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-400 text-sm mb-2 uppercase tracking-wider font-bold">Event Description *</label>
                                    <textarea
                                        className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors h-32"
                                        placeholder="Describe the event..."
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    />
                                </div>

                                {/* Important Note Field */}
                                <div className="md:col-span-2">
                                    <label className="block text-yellow-400 text-sm mb-2 uppercase tracking-wider font-bold flex items-center gap-2">
                                        <span className="bg-yellow-400/20 p-1 rounded">⚠️</span> Important Note
                                    </label>
                                    <textarea
                                        className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-4 text-yellow-100 placeholder-yellow-500/50 focus:outline-none focus:border-yellow-500 transition-colors h-24"
                                        placeholder="E.g. Laptop is mandatory. Strict dress code."
                                        value={newEvent.importantNote || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, importantNote: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">If filled, this note will be shown as a popup before the event details.</p>
                                </div>
                                <div className="space-y-2">
                                    <FileUploader
                                        label="Payment QR Code"
                                        initialUrl={content.qrCodeUrl ? { url: content.qrCodeUrl, type: 'image' } : null}
                                        onUpload={(asset) => {
                                            if (asset) {
                                                const newContent = { ...content, qrCodeUrl: asset.url };
                                                setContent(newContent);
                                                saveContentToBackend(newContent, true);
                                            }
                                        }}
                                        folder="payment"
                                    />
                                    {content.qrCodeUrl && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-400 mb-2">Current QR Code:</p>
                                            <img src={content.qrCodeUrl} alt="Payment QR" className="w-48 h-48 object-contain bg-white rounded-lg p-2" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Management */}
                            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/5 space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">Gallery & Glimpses</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Paste Image/Video URL"
                                            value={newGalleryUrl}
                                            onChange={(e) => setNewGalleryUrl(e.target.value)}
                                            className="flex-1 bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                        />
                                        <FileUploader
                                            label="Upload"
                                            onUpload={(asset) => {
                                                if (asset) {
                                                    const currentImages = content.galleryImages || [];
                                                    const newContentObj = { ...content, galleryImages: [...currentImages, asset] };
                                                    setContent(newContentObj);
                                                    saveContentToBackend(newContentObj, true);
                                                }
                                            }}
                                            folder="gallery"
                                        />
                                        <button
                                            onClick={handleAddGalleryItem}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg font-bold"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {content.galleryImages && content.galleryImages.map((img, index) => (
                                            <div key={index} className="relative group aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                                                {img.type === 'video' || (typeof img.url === 'string' && img.url.match(/\.(mp4|webm|ogg)$/i)) ? (
                                                    <video src={img.url} className="w-full h-full object-cover" muted />
                                                ) : (
                                                    <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                                                )}
                                                <button
                                                    onClick={() => handleDeleteGalleryItem(index)}
                                                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => saveContentToBackend(content)}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg shadow-purple-900/40 hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <FaSave size={20} /> Save All Changes
                                </button>
                            </div>
                        </div>
                    )}


                    {/* --- FAQ MANAGEMENT --- */}
                    {activeTab === 'faq' && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/5 space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h3>

                                {/* Add New FAQ */}
                                <div className="space-y-4 p-4 bg-[#222] rounded-lg border border-white/5">
                                    <input
                                        type="text"
                                        placeholder="Question"
                                        value={newFaq.question}
                                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                        className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                    />
                                    <textarea
                                        placeholder="Answer"
                                        value={newFaq.answer}
                                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                        className="w-full h-24 bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleAddFaq}
                                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 font-bold transition-colors"
                                        >
                                            <FaPlus /> Add FAQ
                                        </button>
                                    </div>
                                </div>

                                {/* FAQ List */}
                                <div className="space-y-3 mt-6">
                                    {content.faqs && content.faqs.length > 0 ? (
                                        content.faqs.map((faq, index) => (
                                            <div key={index} className="bg-[#222] p-4 rounded-lg border border-white/5 group relative">
                                                <h4 className="font-bold text-white pr-8">{faq.question}</h4>
                                                <p className="text-gray-400 text-sm mt-1">{faq.answer}</p>
                                                <button
                                                    onClick={() => handleDeleteFaq(index)}
                                                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No FAQs added yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- REGISTRATION LIST VIEW --- */}
                    {activeTab === 'registrations' && !isAddingEvent && !isAddingTeamMember && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">
                                    {selectedEventFilter === 'all'
                                        ? `All Registrations (${registrations.length})`
                                        : `${events.find(e => e.id === selectedEventFilter)?.title || 'Event'} Registrations (${registrations.filter(r => r.eventId === selectedEventFilter).length})`
                                    }
                                </h3>
                                <div className="flex gap-2">
                                    {selectedEventFilter !== 'all' && (
                                        <button
                                            onClick={() => setSelectedEventFilter('all')}
                                            className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
                                        >
                                            ← Back to Events
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDownloadCSV}
                                        className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition-colors flex items-center gap-2"
                                    >
                                        <FaDownload size={12} /> CSV
                                    </button>
                                    <button
                                        onClick={fetchRegistrations}
                                        className="text-sm bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition-colors"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>



                            {isLoadingRegs ? (
                                <div className="text-center py-20 text-gray-400">Loading registrations...</div>
                            ) : selectedEventFilter === 'all' ? (
                                /* SHOW EVENT CARDS */
                                <div>
                                    <p className="text-gray-400 text-sm mb-4">Select an event to view its registrations</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* All Registrations Card */}
                                        <div
                                            onClick={() => setSelectedEventFilter('all-list')}
                                            className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 cursor-pointer hover:scale-105 transition-transform group"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-bold text-white text-lg">All Registrations</h4>
                                                <FaList className="text-purple-400 text-2xl" />
                                            </div>
                                            <p className="text-3xl font-bold text-white mb-2">{registrations.length}</p>
                                            <p className="text-sm text-gray-300">Total registrations across all events</p>
                                            <div className="mt-4 flex items-center gap-2 text-purple-300 text-sm group-hover:text-purple-200">
                                                <span>View All</span>
                                                <FaArrowLeft className="rotate-180" />
                                            </div>
                                        </div>

                                        {/* Individual Event Cards */}
                                        {events.map(event => {
                                            const eventRegs = registrations.filter(r => r.eventId === event.id);
                                            const verifiedCount = eventRegs.filter(r => r.isActive).length;
                                            const pendingCount = eventRegs.length - verifiedCount;

                                            return (
                                                <div
                                                    key={event.id}
                                                    onClick={() => setSelectedEventFilter(event.id)}
                                                    className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 cursor-pointer hover:border-purple-500/50 hover:scale-105 transition-all group"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-white text-lg mb-1 line-clamp-1">{event.title}</h4>
                                                            <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded uppercase tracking-wider">
                                                                {event.category}
                                                            </span>
                                                        </div>
                                                        <FaUsers className="text-gray-400 text-xl ml-2" />
                                                    </div>

                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-2xl font-bold text-white">{eventRegs.length}</span>
                                                            <span className="text-xs text-gray-400">registrations</span>
                                                        </div>
                                                        <div className="flex gap-2 text-xs">
                                                            <span className="text-green-400">✓ {verifiedCount} verified</span>
                                                            <span className="text-yellow-400">⏳ {pendingCount} pending</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-purple-400 text-sm group-hover:text-purple-300">
                                                        <span>View Registrations</span>
                                                        <FaArrowLeft className="rotate-180" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                /* SHOW REGISTRATION TABLE FOR SELECTED EVENT */
                                <div className="space-y-3">
                                    {/* Search + Filter + Bulk bar */}
                                    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                                        {/* Search */}
                                        <input
                                            type="text"
                                            placeholder="Search by name, college, email, phone..."
                                            value={regSearch}
                                            onChange={e => setRegSearch(e.target.value)}
                                            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600"
                                        />
                                        {/* Status filter pills */}
                                        <div className="flex gap-1 shrink-0">
                                            {(['all', 'verified', 'pending'] as const).map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setRegStatusFilter(s)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${regStatusFilter === s ? 'bg-[#39ff88] text-black font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                                >
                                                    {s === 'all' ? 'All' : s === 'verified' ? '✓ Verified' : '⏳ Pending'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bulk actions */}
                                    {selectedRegIds.size > 0 && (
                                        <div className="flex items-center gap-3 p-3 bg-[#39ff88]/10 border border-[#39ff88]/30 rounded-lg">
                                            <span className="text-[#39ff88] text-sm font-bold">{selectedRegIds.size} selected</span>
                                            <button
                                                onClick={() => handleBulkVerify(true)}
                                                disabled={isBulkProcessing}
                                                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-bold disabled:opacity-50"
                                            >
                                                ✓ Verify All Selected
                                            </button>
                                            <button
                                                onClick={() => handleBulkVerify(false)}
                                                disabled={isBulkProcessing}
                                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-bold disabled:opacity-50"
                                            >
                                                ✗ Reject All Selected
                                            </button>
                                            <button
                                                onClick={() => setSelectedRegIds(new Set())}
                                                className="ml-auto text-gray-500 hover:text-white text-xs"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10 text-gray-500 text-sm">
                                                    <th className="p-3 w-8">
                                                        {/* Select all */}
                                                        <input
                                                            type="checkbox"
                                                            className="accent-purple-500 w-4 h-4 cursor-pointer"
                                                            checked={
                                                                selectedRegIds.size > 0 &&
                                                                (() => {
                                                                    const base = selectedEventFilter === 'all-list' ? registrations : registrations.filter(r => r.eventId === selectedEventFilter);
                                                                    const filtered = base.filter(r => {
                                                                        const q = regSearch.toLowerCase();
                                                                        const matchQ = !q || (r.name || '').toLowerCase().includes(q) || (r.college || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q) || (r.phone || '').toLowerCase().includes(q);
                                                                        const matchS = regStatusFilter === 'all' || (regStatusFilter === 'verified' ? r.isActive : !r.isActive);
                                                                        return matchQ && matchS;
                                                                    });
                                                                    return filtered.length > 0 && filtered.every(r => selectedRegIds.has(r._id));
                                                                })()
                                                            }
                                                            onChange={e => {
                                                                const base = selectedEventFilter === 'all-list' ? registrations : registrations.filter(r => r.eventId === selectedEventFilter);
                                                                const filtered = base.filter(r => {
                                                                    const q = regSearch.toLowerCase();
                                                                    const matchQ = !q || (r.name || '').toLowerCase().includes(q) || (r.college || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q) || (r.phone || '').toLowerCase().includes(q);
                                                                    const matchS = regStatusFilter === 'all' || (regStatusFilter === 'verified' ? r.isActive : !r.isActive);
                                                                    return matchQ && matchS;
                                                                });
                                                                if (e.target.checked) {
                                                                    setSelectedRegIds(new Set(filtered.map(r => r._id)));
                                                                } else {
                                                                    setSelectedRegIds(new Set());
                                                                }
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="p-3">Name</th>
                                                    <th className="p-3">College</th>
                                                    <th className="p-3">Event/Pass</th>
                                                    <th className="p-3">Status</th>
                                                    <th className="p-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    const base = selectedEventFilter === 'all-list' ? registrations : registrations.filter(r => r.eventId === selectedEventFilter);
                                                    return base.filter(r => {
                                                        const q = regSearch.toLowerCase();
                                                        const matchQ = !q || (r.name || '').toLowerCase().includes(q) || (r.college || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q) || (r.phone || '').toLowerCase().includes(q);
                                                        const matchS = regStatusFilter === 'all' || (regStatusFilter === 'verified' ? r.isActive : !r.isActive);
                                                        return matchQ && matchS;
                                                    }).map(reg => (
                                                        <tr key={reg._id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${selectedRegIds.has(reg._id) ? 'bg-purple-600/10' : ''}`}>
                                                            <td className="p-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="accent-purple-500 w-4 h-4 cursor-pointer"
                                                                    checked={selectedRegIds.has(reg._id)}
                                                                    onChange={e => {
                                                                        const next = new Set(selectedRegIds);
                                                                        if (e.target.checked) next.add(reg._id); else next.delete(reg._id);
                                                                        setSelectedRegIds(next);
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="p-3 font-medium">{reg.name}</td>
                                                            <td className="p-3 text-sm text-gray-400">{reg.college}</td>
                                                            <td className="p-3 text-sm text-purple-400">{reg.eventName || 'N/A'}</td>
                                                            <td className="p-3">
                                                                {reg.isActive ? (
                                                                    <span className="text-green-500 text-xs px-2 py-1 bg-green-500/10 rounded-full font-bold">Verified</span>
                                                                ) : (
                                                                    <span className="text-yellow-500 text-xs px-2 py-1 bg-yellow-500/10 rounded-full font-bold">Pending</span>
                                                                )}
                                                            </td>
                                                            <td className="p-3">
                                                                <button
                                                                    onClick={() => setSelectedRegistration(reg)}
                                                                    className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg flex items-center gap-2 text-xs transition-colors"
                                                                >
                                                                    <FaEye size={14} /> View Details
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ));
                                                })()}
                                            </tbody>
                                        </table>
                                        {(() => {
                                            const base = selectedEventFilter === 'all-list' ? registrations : registrations.filter(r => r.eventId === selectedEventFilter);
                                            const filtered = base.filter(r => {
                                                const q = regSearch.toLowerCase();
                                                const matchQ = !q || (r.name || '').toLowerCase().includes(q) || (r.college || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q) || (r.phone || '').toLowerCase().includes(q);
                                                const matchS = regStatusFilter === 'all' || (regStatusFilter === 'verified' ? r.isActive : !r.isActive);
                                                return matchQ && matchS;
                                            });
                                            if (filtered.length === 0) {
                                                return (
                                                    <div className="text-center py-10 text-gray-500">
                                                        {regSearch || regStatusFilter !== 'all' ? 'No registrations match your search/filter.' : 'No registrations found for this event yet.'}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}




                    {/* --- CLOUDINARY MANAGER --- */}
                    {activeTab === 'cloudinary' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Cloudinary Manager</h3>
                                <button
                                    onClick={fetchCloudinaryImages}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-bold flex items-center gap-2"
                                >
                                    <FaList /> Refresh List
                                </button>
                            </div>

                            {isLoadingCloudinary ? (
                                <div className="text-center py-12 text-gray-500">Loading Cloudinary Assets...</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {cloudinaryImages.map((img) => (
                                        <div key={img.public_id} className="relative group aspect-square bg-[#222] rounded-lg overflow-hidden border border-white/10">
                                            <a href={img.secure_url} target="_blank" rel="noreferrer">
                                                <img src={img.secure_url} alt={img.public_id} className="w-full h-full object-cover" />
                                            </a>
                                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                                                <p className="text-[10px] text-gray-400 break-all mb-2">{img.public_id}</p>
                                                <button
                                                    onClick={() => handleDeleteCloudinary(img.public_id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-2"
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            </div>
                                            <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded flex flex-col items-end">
                                                <span>{(img.bytes / 1024).toFixed(1)} KB</span>
                                                <span className="text-[9px] text-gray-300">{new Date(img.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {cloudinaryImages.length === 0 && (
                                        <div className="col-span-full text-center py-12 text-gray-500">
                                            No images found in configured folder
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ======================= NEW TAB: ANALYTICS ======================= */}
                    {activeTab === 'analytics' && !isAddingEvent && !isAddingTeamMember && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    📊 Registration Analytics
                                </h3>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Registrations', value: registrations.length, color: 'purple' },
                                    { label: 'Verified', value: registrations.filter(r => r.isActive).length, color: 'green' },
                                    { label: 'Pending', value: registrations.filter(r => !r.isActive).length, color: 'yellow' },
                                    { label: 'Events', value: events.length, color: 'blue' },
                                ].map(card => (
                                    <div key={card.label} className={`bg-[#1a1a1a] border border-${card.color}-500/20 rounded-xl p-4 text-center`}>
                                        <p className={`text-3xl font-black text-${card.color}-400`}>{card.value}</p>
                                        <p className="text-xs text-gray-400 mt-1">{card.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Per-event breakdown */}
                            {isLoadingRegs ? (
                                <div className="text-center py-10 text-gray-400">Loading data...</div>
                            ) : (
                                <div className="space-y-4">
                                    <h4 className="text-sm text-gray-400 uppercase tracking-wider font-bold">Per-Event Breakdown</h4>
                                    {events.map(event => {
                                        const evRegs = registrations.filter(r => r.eventId === event.id);
                                        const verified = evRegs.filter(r => r.isActive).length;
                                        const pending = evRegs.length - verified;
                                        const total = event.maxSlots || 100;
                                        const filled = Math.min(100, Math.round((evRegs.length / total) * 100));
                                        const color = filled >= 90 ? '#ef4444' : filled >= 60 ? '#f59e0b' : '#22c55e';

                                        return (
                                            <div key={event.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">{event.title}</h4>
                                                        <span className="text-xs text-purple-400">{event.category}</span>
                                                    </div>
                                                    <div className="text-right text-xs text-gray-400">
                                                        <span className="text-white font-bold">{evRegs.length}</span>/{event.maxSlots || '∞'}
                                                        <span className="ml-2">registrations</span>
                                                    </div>
                                                </div>
                                                {/* Slot fill bar */}
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{ width: `${filled}%`, backgroundColor: color }}
                                                    />
                                                </div>
                                                <div className="flex gap-4 text-xs">
                                                    <span className="text-green-400">✓ {verified} verified</span>
                                                    <span className="text-yellow-400">⏳ {pending} pending</span>
                                                    <span className="text-gray-500">🎯 {event.maxSlots || '∞'} slots</span>
                                                    <span style={{ color }} className="ml-auto font-bold">{filled}% filled</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {events.length === 0 && <div className="text-center py-8 text-gray-500">No events found. Add events first.</div>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ======================= NEW TAB: ANNOUNCEMENT ======================= */}
                    {activeTab === 'announcement' && !isAddingEvent && !isAddingTeamMember && (
                        <div className="space-y-6 max-w-3xl mx-auto">
                            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/5 space-y-5">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    📣 Site-Wide Announcement Banner
                                </h3>
                                <p className="text-sm text-gray-400">
                                    This banner appears at the very top of every page when active. Participants can dismiss it once per session.
                                </p>

                                {/* Toggle */}
                                <div className="flex items-center justify-between p-4 bg-[#222] rounded-lg">
                                    <div>
                                        <h4 className="font-bold text-white">Banner Active</h4>
                                        <p className="text-xs text-gray-400">{announcementActive ? 'Banner is VISIBLE to all visitors.' : 'Banner is HIDDEN.'}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={announcementActive}
                                            onChange={e => setAnnouncementActive(e.target.checked)}
                                        />
                                        <div className={`w-14 h-7 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${announcementActive ? 'peer-checked:bg-green-600' : ''}`} />
                                    </label>
                                </div>

                                {/* Text */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-gray-400 text-sm">Announcement Text</label>
                                        <span className="text-xs text-gray-600">{announcement.length}/200 chars</span>
                                    </div>
                                    <textarea
                                        value={announcement}
                                        onChange={e => setAnnouncement(e.target.value.slice(0, 200))}
                                        placeholder="e.g. Registration closes on Sep 20! Late entries will NOT be accepted. Venue: Main Auditorium."
                                        className="w-full h-24 bg-[#111] border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors resize-none font-mono text-sm"
                                    />
                                </div>

                                {/* Live preview */}
                                {announcement && (
                                    <div className="rounded-lg overflow-hidden border border-green-500/20">
                                        <p className="text-[10px] text-gray-500 px-3 py-1 bg-[#111] border-b border-white/5 uppercase tracking-wider">Live Preview</p>
                                        <div className="flex items-center bg-[#0a1e0a] h-9 gap-0 overflow-hidden" style={{ borderBottom: '1px solid rgba(57,255,136,0.25)' }}>
                                            <div className="shrink-0 flex items-center gap-2 px-3 h-full font-mono text-xs font-bold border-r border-[#39ff88]/20 text-[#39ff88] bg-[#39ff88]/10">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88]" />
                                                NOTICE
                                            </div>
                                            <div className="flex-1 px-4 overflow-hidden">
                                                <p className="text-xs text-[#39ff88]/80 font-mono truncate">{announcement}</p>
                                            </div>
                                            <div className="shrink-0 px-3 text-gray-500 text-xs border-l border-[#39ff88]/15">✕</div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        onClick={saveAnnouncement}
                                        disabled={announcementSaving}
                                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {announcementSaving ? 'Saving...' : (announcementActive ? '📣 Publish Announcement' : '🔕 Save (Hidden)')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================= NEW TAB: WINNERS ======================= */}
                    {activeTab === 'winners' && !isAddingEvent && !isAddingTeamMember && (
                        <div className="space-y-6 max-w-3xl mx-auto">
                            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/5 space-y-5">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    🏆 Event Results — Set Winners
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Select an event and enter the podium winners. Saved results are shown publicly on the <a href="/results" target="_blank" className="text-purple-400 hover:underline">/results</a> page.
                                </p>

                                {/* Event Selector */}
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm">Select Event</label>
                                    <select
                                        value={winnersEventId}
                                        onChange={e => {
                                            setWinnersEventId(e.target.value);
                                            loadWinnersForEvent(e.target.value);
                                        }}
                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="">— Select an event —</option>
                                        {events.map(ev => (
                                            <option key={ev.id || (ev as any)._id} value={ev.id || (ev as any)._id}>{ev.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Podium inputs */}
                                {winnersEventId && (
                                    <div className="space-y-4">
                                        {[
                                            { place: 1, emoji: '🥇', label: '1st Place', color: '#ffd700' },
                                            { place: 2, emoji: '🥈', label: '2nd Place', color: '#c0c0c0' },
                                            { place: 3, emoji: '🥉', label: '3rd Place', color: '#cd7f32' },
                                        ].map(({ place, emoji, label, color }) => {
                                            const entry = winnersForm.find(w => w.place === place) || { place, name: '', teamName: '' };
                                            const idx = winnersForm.findIndex(w => w.place === place);
                                            return (
                                                <div key={place} className="p-4 rounded-xl border" style={{ borderColor: `${color}30`, background: `${color}08` }}>
                                                    <p className="font-bold mb-3" style={{ color }}>{emoji} {label}</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-gray-400 text-xs">Participant / Leader Name</label>
                                                            <input
                                                                type="text"
                                                                value={entry.name}
                                                                placeholder="e.g. Arjun Kumar"
                                                                onChange={e => {
                                                                    const updated = [...winnersForm];
                                                                    if (idx >= 0) updated[idx] = { ...updated[idx], name: e.target.value };
                                                                    else updated.push({ place, name: e.target.value, teamName: entry.teamName });
                                                                    setWinnersForm(updated);
                                                                }}
                                                                className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-gray-400 text-xs">Team Name (optional)</label>
                                                            <input
                                                                type="text"
                                                                value={entry.teamName}
                                                                placeholder="e.g. Team Alpha"
                                                                onChange={e => {
                                                                    const updated = [...winnersForm];
                                                                    if (idx >= 0) updated[idx] = { ...updated[idx], teamName: e.target.value };
                                                                    else updated.push({ place, name: entry.name, teamName: e.target.value });
                                                                    setWinnersForm(updated);
                                                                }}
                                                                className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div className="flex justify-end">
                                            <button
                                                onClick={saveWinners}
                                                disabled={winnersSaving}
                                                className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl font-bold text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {winnersSaving ? 'Saving...' : '🏆 Publish Winners'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- TEAM MEMBER FORM --- */}
                    {isAddingTeamMember ? (
                        <div className="space-y-6 max-w-3xl mx-auto">
                            <h3 className="text-xl font-bold text-white mb-4">{editingTeamId ? 'Edit Team Member' : 'Add Team Member'}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm">Full Name</label>
                                    <input
                                        type="text"
                                        value={newTeamMember.name}
                                        onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm">Role / Designation</label>
                                    <input
                                        type="text"
                                        value={newTeamMember.role}
                                        onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>


                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm">Category</label>
                                    <select
                                        value={newTeamMember.category}
                                        onChange={(e) => setNewTeamMember({ ...newTeamMember, category: e.target.value })}
                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                    >
                                        {teamCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-gray-400 text-sm">Instagram Link (Optional)</label>
                                        <input
                                            type="text"
                                            value={newTeamMember.instagram}
                                            onChange={(e) => setNewTeamMember({ ...newTeamMember, instagram: e.target.value })}
                                            className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-400 text-sm">LinkedIn Link (Optional)</label>
                                        <input
                                            type="text"
                                            value={newTeamMember.linkedin}
                                            onChange={(e) => setNewTeamMember({ ...newTeamMember, linkedin: e.target.value })}
                                            className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <FileUploader
                                            label="Profile Photo"
                                            initialUrl={newTeamMember.image}
                                            onUpload={(asset) => setNewTeamMember({ ...newTeamMember, image: asset })}
                                            folder="team"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-lg border border-white/5">
                                    <input
                                        type="checkbox"
                                        id="isActiveParams"
                                        checked={newTeamMember.isActive !== false}
                                        onChange={(e) => setNewTeamMember({ ...newTeamMember, isActive: e.target.checked })}
                                        className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                                    />
                                    <label htmlFor="isActiveParams" className="text-white font-medium cursor-pointer">
                                        Is Active Member?
                                    </label>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={cancelTeamEdit} className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                                    <button onClick={handleSaveTeamMember} className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-bold transition-colors">
                                        <FaSave size={18} /> Save Team Member
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : isAddingEvent ? (
                        /* --- EVENT FORM --- */
                        <div className="space-y-6 max-w-3xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm">Event Title *</label>
                                    <input
                                        type="text"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm">Category *</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Cultural, Technical, Workshop, etc."
                                        value={newEvent.category}
                                        onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm">Coordinator Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="Ex: +91 9876543210"
                                        value={newEvent.coordinatorPhone || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, coordinatorPhone: e.target.value })}
                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
                                    />
                                </div>


                                <div className="space-y-2">
                                    <FileUploader
                                        label="Event Media (Image/Video)"
                                        initialUrl={newEvent.image}
                                        onUpload={(asset) => setNewEvent({ ...newEvent, image: asset })}
                                        folder="events"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm">Description *</label>
                                    <textarea
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="w-full h-32 bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                                    />
                                </div>

                                {/* --- NEW PRICING TOGGLE --- */}
                                <div className="p-4 bg-[#1a1a1a] rounded-xl border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-white text-sm uppercase tracking-wider text-purple-400">
                                            Event Pricing Logic
                                        </h4>
                                    </div>

                                    {/* Free Event Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-[#222] rounded-lg border border-white/5">
                                        <div>
                                            <h5 className="font-bold text-white text-sm">Free Event?</h5>
                                            <p className="text-xs text-gray-400">If enabled, no payment is required.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={!!newEvent.isFree}
                                                onChange={(e) => {
                                                    const isFree = e.target.checked;
                                                    setNewEvent({
                                                        ...newEvent,
                                                        isFree: isFree,
                                                        entryFee: isFree ? 0 : newEvent.entryFee,
                                                        isPassEvent: isFree ? false : newEvent.isPassEvent
                                                    });
                                                }}
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    {!newEvent.isFree && (
                                        <>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-sm text-gray-400">{newEvent.isPassEvent ? 'Pass-Based (Tiered)' : 'Manual Price'}</span>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="toggle-checkbox hidden"
                                                        checked={!!newEvent.isPassEvent}
                                                        onChange={(e) => setNewEvent({ ...newEvent, isPassEvent: e.target.checked })}
                                                    />
                                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${newEvent.isPassEvent ? 'bg-purple-600' : 'bg-gray-600'}`}>
                                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${newEvent.isPassEvent ? 'translate-x-6' : 'translate-x-0'}`} />
                                                    </div>
                                                </label>
                                            </div>

                                            {newEvent.isPassEvent ? (
                                                /* SHOW TICKET TIERS */
                                                <div className="space-y-3 mt-3">
                                                    <label className="text-xs text-gray-400">Select which passes grant access to this event:</label>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {['Diamond', 'Gold', 'Silver'].map((tier) => (
                                                            <label
                                                                key={tier}
                                                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${newEvent.ticketTiers.includes(tier)
                                                                    ? 'bg-purple-900/20 border-purple-500'
                                                                    : 'bg-[#222] border-white/5 hover:border-white/20'
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`w-5 h-5 rounded flex items-center justify-center border ${newEvent.ticketTiers.includes(tier)
                                                                        ? 'bg-purple-600 border-purple-600'
                                                                        : 'border-gray-500'
                                                                        }`}
                                                                >
                                                                    {newEvent.ticketTiers.includes(tier) && <FaCheck size={12} className="text-white" />}
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={newEvent.ticketTiers.includes(tier)}
                                                                    onChange={() => toggleTicketTier(tier)}
                                                                />
                                                                <div>
                                                                    <span className="text-white font-bold block">{tier} Pass</span>
                                                                    <span className="text-gray-500 text-xs">Allow access</span>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* SHOW MANUAL PRICE INPUT */
                                                <div className="space-y-2 mt-3">
                                                    <label className="text-gray-400 text-sm">Entry Fee (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={newEvent.entryFee}
                                                        onChange={(e) => setNewEvent({ ...newEvent, entryFee: parseInt(e.target.value) || 0 })}
                                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                                        placeholder="0 for Free"
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="p-4 bg-[#1a1a1a] rounded-xl border border-white/5 space-y-4">
                                    <h4 className="font-bold text-white text-sm uppercase tracking-wider text-purple-400 flex items-center gap-2">
                                        <FaUsers size={16} /> Registration Limits & Status
                                    </h4>

                                    {/* Registration Closed Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-[#222] rounded-lg border border-white/5 mb-4">
                                        <div>
                                            <h5 className="font-bold text-white text-sm flex items-center gap-2">
                                                {newEvent.isRegistrationClosed ? <FaTimes className="text-red-400" /> : <FaCheck className="text-green-400" />}
                                                {newEvent.isRegistrationClosed ? 'Registration CLOSED' : 'Registration OPEN'}
                                            </h5>
                                            <p className="text-xs text-gray-400">
                                                {newEvent.isRegistrationClosed
                                                    ? "Users CANNOT register for this event."
                                                    : "Users CAN register if slots are available."}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={!!newEvent.isRegistrationClosed}
                                                onChange={(e) => setNewEvent({ ...newEvent, isRegistrationClosed: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-gray-400 text-sm">Max Slots (Capacity)</label>
                                            <input
                                                type="number"
                                                value={newEvent.maxSlots}
                                                onChange={(e) =>
                                                    setNewEvent({ ...newEvent, maxSlots: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-gray-400 text-sm">Current Registrations (Simulate)</label>
                                            <input
                                                type="number"
                                                value={newEvent.registeredCount}
                                                onChange={(e) =>
                                                    setNewEvent({ ...newEvent, registeredCount: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-[#1a1a1a] rounded-xl border border-white/5 space-y-4">
                                    <h4 className="font-bold text-white text-sm uppercase tracking-wider text-purple-400">
                                        Participation Details
                                    </h4>
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={newEvent.participationType === 'Solo'}
                                                    onChange={() =>
                                                        setNewEvent({ ...newEvent, participationType: 'Solo', teamSize: '' })}
                                                    className="accent-purple-500"
                                                />
                                                <span className="text-white">Solo</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={newEvent.participationType === 'Team'}
                                                    onChange={() =>
                                                        setNewEvent({ ...newEvent, participationType: 'Team' })}
                                                    className="accent-purple-500"
                                                />
                                                <span className="text-white">Team</span>
                                            </label>
                                        </div>
                                        {newEvent.participationType === 'Team' && (
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={newEvent.teamSize || ''}
                                                    onChange={(e) => setNewEvent({ ...newEvent, teamSize: e.target.value })}
                                                    placeholder="Ex: 2-6 members"
                                                    className="w-full bg-[#222] border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-[#1a1a1a] rounded-xl border border-white/5 space-y-4">
                                        <h4 className="font-bold text-white text-sm uppercase tracking-wider text-purple-400">
                                            Important Note (Before Event Access)
                                        </h4>
                                        <textarea
                                            value={newEvent.importantNote || ''}
                                            onChange={(e) => setNewEvent({ ...newEvent, importantNote: e.target.value })}
                                            className="w-full bg-[#222] border border-yellow-500/30 rounded-lg p-3 text-yellow-100 focus:border-yellow-500 h-24 font-mono text-sm"
                                            placeholder="Enter critical information that must be acknowledged..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-gray-400 text-sm flex items-center gap-2">
                                            <FaList size={16} /> Rules & Guidelines
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newRule}
                                                onChange={(e) => setNewRule(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                                                placeholder="Enter a rule..."
                                                className="flex-1 bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                            />
                                            <button
                                                onClick={handleAddRule}
                                                className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center"
                                            >
                                                <FaPlus size={20} />
                                            </button>
                                        </div>
                                        {newEvent.rules && newEvent.rules.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                {newEvent.rules.map((rule, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-lg border border-white/5"
                                                    >
                                                        <span className="text-purple-500 font-bold">•</span>
                                                        <p className="flex-1 text-sm text-gray-300">{rule}</p>
                                                        <button
                                                            onClick={() => handleRemoveRule(index)}
                                                            className="text-red-500 hover:text-red-400 p-1"
                                                        >
                                                            <FaTrash size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4 pt-4 pb-8">
                                        <button onClick={handleSaveEvent} className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-colors">
                                            Save Event
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                        </>
                    )}

                    {/* --- EVENTS LIST --- */}
                    {activeTab === 'events' && !isAddingEvent && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Manage Events</h3>
                                <button
                                    onClick={() => { resetForm(); setIsAddingEvent(true); }}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-bold"
                                >
                                    <FaPlus size={18} /> Add Event
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map((event) => (
                                    <div key={event.id || (event as any)._id || event.title} className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden group hover:border-purple-500/50 transition-colors">
                                        <div className="h-40 bg-black/50 relative overflow-hidden">
                                            {event.image?.url ? (
                                                <img src={event.image.url} alt={event.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                                            )}
                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditEvent(event)} className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 text-white"><FaFont size={14} /></button>
                                                <button onClick={() => handleDeleteEvent(event.id || (event as any)._id || event.title)} className="p-2 bg-red-500/80 backdrop-blur-md rounded-lg hover:bg-red-600 text-white"><FaTrash size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-white truncate">{event.title}</h4>
                                                <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded uppercase tracking-wider">{event.category}</span>
                                            </div>
                                            <p className="text-gray-400 text-xs line-clamp-2 mb-3">{event.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span>📅 {event.date}</span>
                                                <span>👥 {event.registeredCount}/{event.maxSlots}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- TEAM LIST --- */}
                    {activeTab === 'team' && !isAddingTeamMember && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Team Members</h3>
                                <button
                                    onClick={() => { cancelTeamEdit(); setIsAddingTeamMember(true); }}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-bold"
                                >
                                    <FaPlus size={18} /> Add Member
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {teamMembers.map((member, idx) => (
                                    <div key={member._id || member.id || idx} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex items-center gap-4 group">
                                        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${member.isActive ? 'border-green-500' : 'border-gray-600'}`}>
                                            {member.image?.url ? <img src={member.image.url} alt={member.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-700" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-sm truncate">{member.name}</h4>
                                            <p className="text-xs text-gray-400 truncate">{member.role}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditTeamMember(member)} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white"><FaFont size={14} /></button>
                                            <button onClick={() => handleDeleteTeamMember(member._id || member.id || member.name)} className="p-1.5 hover:bg-red-500/20 rounded text-red-400"><FaTrash size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* --- REGISTRATION DETAILS MODAL --- */}
            {
                selectedRegistration && (
                    <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4">
                        <div className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xl font-bold">Registration Details</h3>
                                <button onClick={() => setSelectedRegistration(null)} className="p-2 hover:bg-white/10 rounded-full"><FaTimes size={20} /></button>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">Applicant</label>
                                        <p className="text-lg font-bold">{selectedRegistration.name}</p>
                                        <p className="text-sm text-gray-400">{selectedRegistration.email}</p>
                                        <p className="text-sm text-gray-400">{selectedRegistration.phone}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg">
                                        <label className="text-xs text-gray-500 uppercase mb-2 block">College Info</label>
                                        <p className="text-sm font-bold text-white mb-1">{selectedRegistration.college}</p>
                                        <p className="text-xs text-gray-400">{selectedRegistration.degree} - {selectedRegistration.course} ({selectedRegistration.year})</p>
                                        {selectedRegistration.isVeltechStudent && (
                                            <p className="mt-2 text-xs text-purple-400 font-mono">ID: {selectedRegistration.vmNumber}</p>
                                        )}
                                    </div>
                                    <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-lg">
                                        <label className="text-xs text-purple-400 uppercase mb-1 block">Registered For</label>
                                        <p className="font-bold text-white text-lg">{selectedRegistration.eventName || 'Legacy Registration'}</p>
                                        <p className="text-xs text-gray-500 font-mono">{selectedRegistration.eventId}</p>
                                        {/* @ts-ignore */}
                                        {selectedRegistration.participationType === 'Team' && (
                                            <span className="mt-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded inline-block">Team Registration</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs text-gray-500 uppercase">Payment Proof / ID Card</label>
                                    {selectedRegistration.paymentScreenshotUrl ? (
                                        <div className="rounded-xl overflow-hidden border border-white/10 group relative">
                                            <img
                                                src={selectedRegistration.paymentScreenshotUrl}
                                                alt="Payment Screenshot"
                                                className="w-full h-40 object-contain bg-black"
                                            />
                                            <a
                                                href={selectedRegistration.paymentScreenshotUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 hover:bg-black/80"
                                            >
                                                Open Full <FaExternalLinkAlt size={12} />
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="h-40 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                                            No Payment Screenshot
                                        </div>
                                    )}

                                    {selectedRegistration.idCardUrl && (
                                        <div className="mt-4">
                                            <label className="text-xs text-gray-500 uppercase mb-2 block">Team Leader ID / Solo ID</label>
                                            <div className="h-32 rounded-lg overflow-hidden border border-white/10 relative group">
                                                <img src={selectedRegistration.idCardUrl} alt="ID Card" className="w-full h-full object-cover" />
                                                <a href={selectedRegistration.idCardUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">View</a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- TEAM MEMBERS SECTION --- */}
                            {/* @ts-ignore */}
                            {selectedRegistration.participationType === 'Team' && selectedRegistration.members && Array.isArray(selectedRegistration.members) && (
                                <div className="px-6 pb-6">
                                    <h4 className="text-sm uppercase text-gray-500 font-bold mb-3 border-b border-white/10 pb-2">Team Members ({selectedRegistration.members.length + 1} including Leader)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Leader Card */}
                                        <div className="bg-[#222] p-3 rounded-lg border border-purple-500/30 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-purple-600 text-xs px-2 py-0.5 rounded-bl text-white font-bold">Leader</div>
                                            {/* @ts-ignore */}
                                            <p className="font-bold text-white mb-0.5">{selectedRegistration.teamLeader?.name}</p>
                                            {/* @ts-ignore */}
                                            <p className="text-xs text-gray-400">{selectedRegistration.teamLeader?.email}</p>
                                            {/* @ts-ignore */}
                                            <p className="text-xs text-gray-500">{selectedRegistration.teamLeader?.phone}</p>
                                        </div>

                                        {/* Members */}
                                        {/* @ts-ignore */}
                                        {selectedRegistration.members.map((member: any, idx: number) => (
                                            <div key={idx} className="bg-[#222] p-3 rounded-lg border border-white/5 relative">
                                                <div className="absolute top-0 right-0 bg-gray-700 text-xs px-2 py-0.5 rounded-bl text-gray-300">Member {idx + 1}</div>
                                                <p className="font-bold text-white mb-0.5">{member.name}</p>
                                                <p className="text-xs text-gray-400">{member.email}</p>
                                                <p className="text-xs text-gray-500">{member.phone}</p>
                                                <div className="mt-2 flex gap-2 text-[10px] text-gray-500 border-t border-white/5 pt-1">
                                                    <span>{member.department}</span>
                                                    <span>•</span>
                                                    <span>{member.year} Year</span>
                                                </div>
                                                {member.idCardUrl && (
                                                    <a href={member.idCardUrl} target="_blank" className="block mt-2 text-[10px] text-blue-400 hover:underline">View ID Card</a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#151515]">
                                {selectedRegistration.isActive ? (
                                    <span className="px-4 py-3 bg-green-500/20 text-green-500 font-bold rounded-xl flex items-center gap-2">
                                        <FaCheck size={18} /> Verified
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleVerifyRegistration(selectedRegistration)}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20"
                                    >
                                        <FaCheck size={18} /> Verify & Activate User
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
