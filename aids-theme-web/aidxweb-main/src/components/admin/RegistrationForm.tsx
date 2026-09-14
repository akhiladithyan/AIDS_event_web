import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaCheck, FaSpinner, FaPlus, FaTrash, FaTimes, FaUserShield, FaUserCheck, FaLock, FaEnvelope, FaIdCard, FaKey } from 'react-icons/fa';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';
import config from '../../config';
import { safeJsonResponse } from '@/lib/utils';
import { Event } from '../../types/admin';

interface RegistrationFormProps {
    email?: string;
    onSubmit: (data: any) => void;
    selectedEvent?: Event | null;
    onClose?: () => void;
    upiId?: string;
    qrCodeUrl?: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ email = '', onSubmit, selectedEvent, onClose, upiId = '', qrCodeUrl = '' }) => {
    const isSoloEvent = selectedEvent?.participationType === 'Solo';
    const isTeamEvent = selectedEvent?.participationType === 'Team';

    // Parse team size with better handling
    let maxTeamSize = 4; // default
    if (selectedEvent?.teamSize) {
        const sizeStr = selectedEvent.teamSize.toString();
        if (sizeStr.includes('-')) {
            const parts = sizeStr.split('-');
            const max = parseInt(parts[1]);
            if (!isNaN(max) && max > 0) {
                maxTeamSize = max;
            }
        } else {
            const parsed = parseInt(sizeStr);
            if (!isNaN(parsed) && parsed > 0) {
                maxTeamSize = parsed;
            }
        }
    }

    // Student Profile State (Enforces profile before event registration)
    const [activeProfile, setActiveProfile] = useState<{
        userId: string;
        name: string;
        email: string;
        phone: string;
        college: string;
        department: string;
        degree: string;
        year: string;
    } | null>(null);

    const [profileTab, setProfileTab] = useState<'create' | 'login'>('create');
    const [profileLoading, setProfileLoading] = useState(false);

    // Profile Auth Form State
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: email || '',
        password: '',
        phone: '',
        college: '',
        department: '',
        degree: 'B.E/B.Tech',
        year: '3'
    });

    const [loginForm, setLoginForm] = useState({
        email: email || '',
        password: ''
    });

    const [formData, setFormData] = useState({
        email,
        password: '',
        eventId: selectedEvent?.id || '',
        eventName: selectedEvent?.title || 'General Pass',
        participationType: selectedEvent?.participationType || 'Solo',

        // Solo fields
        name: '',
        phone: '',
        college: '',
        department: '',
        degree: '',
        year: '',
        idCardUrl: '',

        // Team fields
        teamName: '',
        teamMembers: [{ name: '', phone: '', email: '', password: '' }],
        teamLeaderIdCardUrl: '',

        // Payment
        paymentScreenshotUrl: ''
    });

    // Check existing stored student session or profile on mount
    useEffect(() => {
        try {
            const savedSession = sessionStorage.getItem("neura_student_session");
            const savedProfile = localStorage.getItem("neura_student_profile");
            let p = null;
            if (savedSession) {
                const parsed = JSON.parse(savedSession);
                if (parsed?.user) p = parsed.user;
            } else if (savedProfile) {
                p = JSON.parse(savedProfile);
            }

            if (p && p.email) {
                setActiveProfile({
                    userId: p.userId || p.email,
                    name: p.name || '',
                    email: p.email || '',
                    phone: p.phone || '',
                    college: p.college || '',
                    department: p.department || '',
                    degree: p.degree || 'B.E/B.Tech',
                    year: p.year || '3'
                });
                // Autofill form
                setFormData(prev => ({
                    ...prev,
                    name: p.name || prev.name,
                    email: p.email || prev.email,
                    phone: p.phone || prev.phone,
                    college: p.college || prev.college,
                    department: p.department || prev.department,
                    degree: p.degree || prev.degree,
                    year: p.year || prev.year
                }));
            }
        } catch (e) {}
    }, []);

    const [uploadingIdCard, setUploadingIdCard] = useState(false);
    const [uploadingPayment, setUploadingPayment] = useState(false);

    // Profile Handlers
    const handleCreateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileForm.name || !profileForm.email || !profileForm.password) {
            toast.error("Name, Email (User ID), and Password are required");
            return;
        }
        if (profileForm.password.length < 4) {
            toast.error("Password must be at least 4 characters long");
            return;
        }

        setProfileLoading(true);
        try {
            const res = await fetch(`${config.API_URL}/student/profile/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileForm)
            });
            const data = await safeJsonResponse(res);

            if (data && data.success) {
                const u = data.data.user;
                setActiveProfile(u);
                localStorage.setItem("neura_student_profile", JSON.stringify(u));
                setFormData(prev => ({
                    ...prev,
                    name: u.name,
                    email: u.email,
                    password: profileForm.password,
                    phone: u.phone,
                    college: u.college,
                    department: u.department,
                    degree: u.degree || 'B.E/B.Tech',
                    year: u.year || '3'
                }));
                toast.success("Student Profile Created! You can now complete event registration.");
            } else {
                toast.error(data?.error || data?.message || "Profile creation failed");
            }
        } catch (err: any) {
            toast.error("Error connecting to profile server");
        } finally {
            setProfileLoading(false);
        }
    };

    const handleLoginProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginForm.email || !loginForm.password) {
            toast.error("Please enter your Student Email and Password");
            return;
        }

        setProfileLoading(true);
        try {
            const res = await fetch(`${config.API_URL}/student/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
            });
            const data = await safeJsonResponse(res);

            if (data && data.success) {
                const u = data.data.user;
                setActiveProfile({
                    userId: u.userId || u.email,
                    name: u.name,
                    email: u.email,
                    phone: u.phone || '',
                    college: u.college || '',
                    department: u.department || '',
                    degree: u.degree || 'B.E/B.Tech',
                    year: u.year || '3'
                });
                localStorage.setItem("neura_student_profile", JSON.stringify(u));
                setFormData(prev => ({
                    ...prev,
                    name: u.name,
                    email: u.email,
                    password: loginForm.password,
                    phone: u.phone || prev.phone,
                    college: u.college || prev.college,
                    department: u.department || prev.department,
                    degree: u.degree || prev.degree,
                    year: u.year || prev.year
                }));
                toast.success(`Welcome back, ${u.name}! Profile authenticated.`);
            } else {
                toast.error(data?.message || data?.error || "Invalid Student Credentials");
            }
        } catch (err) {
            toast.error("Error connecting to login service");
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTeamMemberChange = (index: number, field: 'name' | 'phone' | 'email' | 'password', value: string) => {
        const updatedMembers = [...formData.teamMembers];
        updatedMembers[index][field] = value;
        setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
    };

    const addTeamMember = () => {
        if (formData.teamMembers.length < maxTeamSize) {
            setFormData(prev => ({
                ...prev,
                teamMembers: [...prev.teamMembers, { name: '', phone: '', email: '', password: '' }]
            }));
        }
    };

    const removeTeamMember = (index: number) => {
        if (formData.teamMembers.length > 1) {
            const updatedMembers = formData.teamMembers.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
        }
    };

    const uploadFile = async (file: File, type: 'idCard' | 'teamLeaderIdCard' | 'payment') => {
        if (!file) return;

        if (type === 'idCard') setUploadingIdCard(true);
        else if (type === 'teamLeaderIdCard') setUploadingIdCard(true);
        else setUploadingPayment(true);

        const data = new FormData();
        data.append('file', file);
        data.append('folder', 'registrations');

        try {
            const res = await fetch(`${config.API_URL}/upload`, {
                method: 'POST',
                body: data
            });
            const response = await safeJsonResponse(res);

            if (response && response.success) {
                const fileUrl = response.data?.url || response.url;
                if (type === 'idCard') {
                    setFormData(prev => ({ ...prev, idCardUrl: fileUrl }));
                } else if (type === 'teamLeaderIdCard') {
                    setFormData(prev => ({ ...prev, teamLeaderIdCardUrl: fileUrl }));
                } else {
                    setFormData(prev => ({ ...prev, paymentScreenshotUrl: fileUrl }));
                }
                toast.success("File uploaded successfully");
            } else {
                toast.error("Upload failed. Please try again.");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading file.");
        } finally {
            if (type === 'idCard' || type === 'teamLeaderIdCard') setUploadingIdCard(false);
            else setUploadingPayment(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isFreeEvent = true;

        if (isSoloEvent) {
            if (!formData.name || !formData.phone || !formData.email || !formData.password ||
                !formData.college || !formData.department ||
                !formData.degree || !formData.year || !formData.idCardUrl) {
                toast.error("Please fill all required fields and set your password for solo registration");
                return;
            }
            if (formData.password.length < 4) {
                toast.error("Password must be at least 4 characters long");
                return;
            }
        } else if (isTeamEvent) {
            if (!formData.teamName || !formData.email || !formData.password ||
                !formData.college || !formData.department ||
                !formData.degree || !formData.year ||
                !formData.teamLeaderIdCardUrl) {
                toast.error("Please fill all required squad leader fields and password");
                return;
            }

            const allMembersValid = formData.teamMembers.every((member: any) => member.name && member.phone);
            if (!allMembersValid) {
                toast.error("Please fill all team member names and phone numbers");
                return;
            }
        }

        onSubmit(formData);
    };

    const [registrationOpen, setRegistrationOpen] = useState(true);
    const [checkingStatus, setCheckingStatus] = useState(true);

    React.useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch(`${config.API_URL}/settings`);
                const data = await res.json();
                if (data.success && data.data) {
                    setRegistrationOpen(data.data.registrationOpen);
                }
            } catch (error) {
                console.error("Failed to check registration status", error);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkStatus();
    }, []);

    if (checkingStatus) {
        return (
            <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center">
                <FaSpinner className="animate-spin text-[#39ff88] text-4xl" />
            </div>
        );
    }

    if (!registrationOpen) {
        return (
            <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0b1510] border border-red-500/40 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.25)]"
                >
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                        <FaTimes size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-orbitron uppercase">CLEARANCE SUSPENDED</h2>
                    <p className="text-[#bfc8c3]/80 font-mono text-xs md:text-sm mb-6">
                        System registration is currently closed by High Command. Check back for future transmissions.
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-[#39ff88] text-black font-bold font-orbitron text-xs uppercase py-3 px-8 rounded-xl hover:bg-[#39ff88]/90 transition-colors"
                    >
                        Close Terminal
                    </button>
                </motion.div>
            </div>
        );
    }

    // Check Per-Event Settings
    if (selectedEvent?.isRegistrationClosed) {
        return (
            <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0b1510] border border-orange-500/40 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(249,115,22,0.25)]"
                >
                    <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/30">
                        <FaTimes size={32} className="text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-orbitron uppercase">SECTOR LOCKED</h2>
                    <p className="text-[#bfc8c3]/80 font-mono text-xs md:text-sm mb-6">
                        Registrations for <span className="text-orange-400 font-bold">{selectedEvent.title}</span> are locked.
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-[#39ff88] text-black font-bold font-orbitron text-xs uppercase py-3 px-8 rounded-xl hover:bg-[#39ff88]/90 transition-colors"
                    >
                        Close
                    </button>
                </motion.div>
            </div>
        );
    }

    // Check for Slots Full
    if (selectedEvent?.maxSlots && selectedEvent.maxSlots > 0 && selectedEvent.registeredCount >= selectedEvent.maxSlots) {
        return (
            <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0b1510] border border-red-500/40 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.25)]"
                >
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                        <FaTimes size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-orbitron uppercase">SECTOR CAPACITY REACHED</h2>
                    <p className="text-[#bfc8c3]/80 font-mono text-xs md:text-sm mb-6">
                        <span className="text-red-400 font-bold">{selectedEvent.title}</span> has reached maximum operative slots.
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-[#39ff88] text-black font-bold font-orbitron text-xs uppercase py-3 px-8 rounded-xl hover:bg-[#39ff88]/90 transition-colors"
                    >
                        Close
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md overflow-y-auto">
            <div className="w-full min-h-screen md:min-h-0 md:py-8 flex items-start md:items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0b1510] border-0 md:border border-[#39ff88]/30 w-full md:max-w-3xl md:mx-4 rounded-none md:rounded-2xl shadow-[0_0_60px_rgba(57,255,136,0.15)] relative min-w-0"
                >
                    <div className="p-4 md:p-8 border-b border-[#39ff88]/15 relative bg-[#08100b]">
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 md:top-8 md:right-8 text-[#bfc8c3]/60 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg border border-white/10"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        <div className="text-[10px] font-mono text-[#39ff88] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-pulse"></span>
                            :: OPERATIVE_ENROLLMENT_TERMINAL ::
                        </div>
                        <h2 className="font-orbitron text-lg md:text-2xl font-bold text-white pr-10 uppercase">
                            AUTHENTICATE REGISTRATION
                        </h2>
                        <p className="text-[#bfc8c3]/70 mt-1 font-mono text-xs md:text-sm">
                            Target Sector: <span className="text-[#39ff88] font-bold">{selectedEvent?.title || 'Festival Clearance'}</span>
                            {selectedEvent?.participationType && (
                                <span className="ml-2 text-[10px] font-mono bg-[#39ff88]/20 border border-[#39ff88]/30 text-[#39ff88] px-2 py-0.5 rounded uppercase">
                                    {selectedEvent.participationType}
                                </span>
                            )}
                        </p>
                    </div>

                    {!activeProfile ? (
                        <div className="p-4 md:p-8 space-y-6">
                            <div className="bg-[#39ff88]/10 border border-[#39ff88]/30 rounded-xl p-4 flex items-start gap-3">
                                <FaUserShield className="text-[#39ff88] text-xl shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-orbitron font-bold text-white text-sm uppercase">Student Profile Required</h3>
                                    <p className="text-[#bfc8c3]/80 font-mono text-xs mt-0.5">
                                        You must have a verified Student Profile to register for festival events. Your email is your User ID and your password grants instant access to your digital pass badges.
                                    </p>
                                </div>
                            </div>

                            {/* Tabs: Create Profile vs Login */}
                            <div className="flex rounded-xl bg-[#050806] border border-[#39ff88]/20 p-1">
                                <button
                                    type="button"
                                    onClick={() => setProfileTab('create')}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                                        profileTab === 'create'
                                            ? 'bg-[#39ff88] text-black shadow-[0_0_15px_rgba(57,255,136,0.3)]'
                                            : 'text-[#bfc8c3]/70 hover:text-white'
                                    }`}
                                >
                                    Create Student Profile
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setProfileTab('login')}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                                        profileTab === 'login'
                                            ? 'bg-[#39ff88] text-black shadow-[0_0_15px_rgba(57,255,136,0.3)]'
                                            : 'text-[#bfc8c3]/70 hover:text-white'
                                    }`}
                                >
                                    Sign In with Profile
                                </button>
                            </div>

                            {profileTab === 'create' ? (
                                <form onSubmit={handleCreateProfile} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase">Full Name *</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Student Name"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase">Phone Number *</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="Mobile Number"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase">
                                                Email Address (User ID) *
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="student@domain.com"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none"
                                            />
                                            <span className="text-[10px] text-[#39ff88]/80 font-mono">Your email will be your login User ID.</span>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase">
                                                Profile Password *
                                            </label>
                                            <input
                                                required
                                                type="password"
                                                placeholder="Set your password"
                                                value={profileForm.password}
                                                onChange={(e) => setProfileForm(p => ({ ...p, password: e.target.value }))}
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none"
                                            />
                                            <span className="text-[10px] text-amber-300/80 font-mono">Set by you to access your digital pass.</span>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase">College / Institution *</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="College Name"
                                                value={profileForm.college}
                                                onChange={(e) => setProfileForm(p => ({ ...p, college: e.target.value }))}
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase">Department / Branch *</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Department"
                                                value={profileForm.department}
                                                onChange={(e) => setProfileForm(p => ({ ...p, department: e.target.value }))}
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={profileLoading}
                                        className="w-full bg-[#39ff88] text-black font-black font-orbitron uppercase tracking-wider py-3.5 rounded-xl hover:bg-[#39ff88]/90 transition-all flex items-center justify-center gap-2 text-xs md:text-sm mt-4 cursor-pointer"
                                    >
                                        {profileLoading ? <FaSpinner className="animate-spin" /> : <FaUserCheck />}
                                        SAVE PROFILE & PROCEED TO EVENT REGISTRATION
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleLoginProfile} className="space-y-4 max-w-md mx-auto">
                                    <div className="space-y-1">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase">Email Address (User ID) *</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="student@domain.com"
                                            value={loginForm.email}
                                            onChange={(e) => setLoginForm(p => ({ ...p, email: e.target.value }))}
                                            className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase">Profile Password *</label>
                                        <input
                                            required
                                            type="password"
                                            placeholder="Enter your password"
                                            value={loginForm.password}
                                            onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))}
                                            className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={profileLoading}
                                        className="w-full bg-[#39ff88] text-black font-black font-orbitron uppercase tracking-wider py-3.5 rounded-xl hover:bg-[#39ff88]/90 transition-all flex items-center justify-center gap-2 text-xs md:text-sm mt-4 cursor-pointer"
                                    >
                                        {profileLoading ? <FaSpinner className="animate-spin" /> : <FaKey />}
                                        AUTHENTICATE PROFILE & CONTINUE
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                    <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-4 md:space-y-6 pb-24 md:pb-8">
                        {/* Verified Profile Status Banner */}
                        <div className="bg-[#39ff88]/10 border border-[#39ff88]/30 rounded-xl p-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#39ff88]/20 border border-[#39ff88]/40 flex items-center justify-center text-[#39ff88]">
                                    <FaUserCheck size={14} />
                                </div>
                                <div>
                                    <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                                        <span>{activeProfile.name}</span>
                                        <span className="text-[10px] bg-[#39ff88]/20 text-[#39ff88] px-1.5 py-0.5 rounded font-mono">PROFILE ACTIVE</span>
                                    </div>
                                    <div className="text-[11px] font-mono text-[#bfc8c3]/70">{activeProfile.email} • {activeProfile.college || 'Verified Student'}</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveProfile(null);
                                    localStorage.removeItem("neura_student_profile");
                                    sessionStorage.removeItem("neura_student_session");
                                }}
                                className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
                            >
                                Switch Account
                            </button>
                        </div>
                        {isSoloEvent && (
                            <>
                                {/* Solo Event Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Operative Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono focus:border-[#39ff88] focus:shadow-[0_0_15px_rgba(57,255,136,0.2)] focus:outline-none transition-all"
                                            value={formData.name || ''}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Comms / Phone Number *</label>
                                        <input
                                            required
                                            type="tel"
                                            placeholder="10-digit Mobile No."
                                            className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono focus:border-[#39ff88] focus:shadow-[0_0_15px_rgba(57,255,136,0.2)] focus:outline-none transition-all"
                                            value={formData.phone || ''}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">
                                            Email Address (Your User ID) *
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="operative@domain.com"
                                            className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono placeholder:text-gray-600 focus:border-[#39ff88] focus:shadow-[0_0_15px_rgba(57,255,136,0.2)] focus:outline-none transition-all"
                                            value={formData.email || ''}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                        />
                                        <span className="text-[10px] text-[#39ff88]/80 font-mono">This email will be your permanent Student User ID.</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">
                                            Create Student Portal Password *
                                        </label>
                                        <input
                                            required
                                            type="password"
                                            placeholder="Set your password"
                                            className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono placeholder:text-gray-600 focus:border-[#39ff88] focus:shadow-[0_0_15px_rgba(57,255,136,0.2)] focus:outline-none transition-all"
                                            value={formData.password || ''}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                        />
                                        <span className="text-[10px] text-amber-300/80 font-mono">Used to log in to /student portal to access your pass.</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Institution / College *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Institution Name"
                                            className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono placeholder:text-gray-600 focus:border-[#39ff88] focus:shadow-[0_0_15px_rgba(57,255,136,0.2)] focus:outline-none transition-all"
                                            value={formData.college || ''}
                                            onChange={(e) => handleChange('college', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Department / Branch *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ex: AI & Data Science"
                                            className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono placeholder:text-gray-600 focus:border-[#39ff88] focus:shadow-[0_0_15px_rgba(57,255,136,0.2)] focus:outline-none transition-all"
                                            value={formData.department || ''}
                                            onChange={(e) => handleChange('department', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Degree *</label>
                                        <div className="relative">
                                            <select
                                                required
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono focus:border-[#39ff88] focus:outline-none appearance-none transition-all"
                                                value={formData.degree || ''}
                                                onChange={(e) => handleChange('degree', e.target.value)}
                                            >
                                                <option value="">Select Degree</option>
                                                <option value="B.E/B.Tech">B.E / B.Tech</option>
                                                <option value="M.E/M.Tech">M.E / M.Tech</option>
                                                <option value="Arts & Science">Arts & Science</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#39ff88]">
                                                ▼
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Year of Study *</label>
                                        <div className="relative">
                                            <select
                                                required
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono focus:border-[#39ff88] focus:outline-none appearance-none transition-all"
                                                value={formData.year || ''}
                                                onChange={(e) => handleChange('year', e.target.value)}
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#39ff88]">
                                                ▼
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Operative ID Card Document *</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="id-upload"
                                                onChange={(e) => e.target.files && uploadFile(e.target.files[0], 'idCard')}
                                            />
                                            <label
                                                htmlFor="id-upload"
                                                className={`w-full flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${formData.idCardUrl
                                                    ? 'border-[#39ff88] bg-[#39ff88]/10 text-[#39ff88]'
                                                    : 'border-[#39ff88]/30 bg-[#08100b] hover:bg-[#0e1b14] text-[#bfc8c3]/70 hover:text-white hover:border-[#39ff88]/60'
                                                    }`}
                                            >
                                                {uploadingIdCard ? (
                                                    <span className="animate-pulse flex items-center gap-2 text-sm font-mono"><FaSpinner size={16} className="animate-spin text-[#39ff88]" /> Uploading Document...</span>
                                                ) : formData.idCardUrl ? (
                                                    <>
                                                        <div className="w-8 h-8 rounded-full bg-[#39ff88]/20 border border-[#39ff88]/40 flex items-center justify-center mb-1">
                                                            <FaCheck size={14} className="text-[#39ff88]" />
                                                        </div>
                                                        <span className="text-xs font-mono font-bold text-[#39ff88]">ID Card Uploaded Successfully</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-full bg-[#39ff88]/10 flex items-center justify-center mb-1 border border-[#39ff88]/20">
                                                            <FaCloudUploadAlt size={20} className="text-[#39ff88]" />
                                                        </div>
                                                        <span className="text-xs font-mono text-white">Click to Upload Operative ID</span>
                                                        <span className="text-[10px] text-[#bfc8c3]/50 font-mono">Supported formats: JPG, PNG</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {isTeamEvent && (
                            <>
                                {/* Team Event Fields */}
                                <div className="grid grid-cols-1 gap-4 md:gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Squad / Team Codename *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter squad name"
                                            className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono placeholder:text-gray-600 focus:border-[#39ff88] focus:shadow-[0_0_15px_rgba(57,255,136,0.2)] focus:outline-none transition-all"
                                            value={formData.teamName || ''}
                                            onChange={(e) => handleChange('teamName', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">
                                                Squad Leader Email (Leader User ID) *
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="leader@domain.com"
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono placeholder:text-gray-600 focus:border-[#39ff88] focus:shadow-[0_0_15px_rgba(57,255,136,0.2)] focus:outline-none transition-all"
                                                value={formData.email || ''}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                            />
                                            <span className="text-[10px] text-[#39ff88]/80 font-mono">Leader&apos;s User ID for Student Portal.</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">
                                                Squad Leader Password *
                                            </label>
                                            <input
                                                required
                                                type="password"
                                                placeholder="Set leader password"
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono placeholder:text-gray-600 focus:border-[#39ff88] focus:shadow-[0_0_15px_rgba(57,255,136,0.2)] focus:outline-none transition-all"
                                                value={formData.password || ''}
                                                onChange={(e) => handleChange('password', e.target.value)}
                                            />
                                            <span className="text-[10px] text-amber-300/80 font-mono">Leader&apos;s password for /student portal login.</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider block">
                                                    Squad Operatives Roster * ({formData.teamMembers.length}/{maxTeamSize})
                                                </label>
                                                <span className="text-[10px] text-[#39ff88] font-mono">
                                                    ⚡ Every member receives an individual barcode & QR pass with their own email login!
                                                </span>
                                            </div>
                                            {formData.teamMembers.length < maxTeamSize && (
                                                <button
                                                    type="button"
                                                    onClick={addTeamMember}
                                                    className="text-xs bg-[#39ff88]/10 text-[#39ff88] border border-[#39ff88]/30 px-3 py-1.5 rounded-lg hover:bg-[#39ff88]/20 flex items-center gap-1.5 transition-colors font-mono cursor-pointer"
                                                >
                                                    <FaPlus size={10} /> Add Member
                                                </button>
                                            )}
                                        </div>

                                        {formData.teamMembers.map((member, index) => (
                                            <div key={index} className="p-4 bg-[#08100b] rounded-xl border border-[#39ff88]/20 space-y-3">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                    <span className="text-[11px] font-mono font-bold text-[#39ff88] uppercase flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88]"></span>
                                                        Operative {index + 1} ({index === 0 ? "Squad Leader / Member 1" : `Team Member ${index + 1}`})
                                                    </span>
                                                    {formData.teamMembers.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTeamMember(index)}
                                                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-mono"
                                                        >
                                                            <FaTrash size={11} /> Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-mono text-gray-400 uppercase">Operative Name *</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            placeholder="Full name"
                                                            className="w-full bg-[#050806] border border-[#39ff88]/20 rounded-xl p-2.5 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none transition-colors"
                                                            value={member.name}
                                                            onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-mono text-gray-400 uppercase">Phone / Comms *</label>
                                                        <input
                                                            required
                                                            type="tel"
                                                            placeholder="Phone number"
                                                            className="w-full bg-[#050806] border border-[#39ff88]/20 rounded-xl p-2.5 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none transition-colors"
                                                            value={member.phone}
                                                            onChange={(e) => handleTeamMemberChange(index, 'phone', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-mono text-gray-400 uppercase">Email (Individual User ID)</label>
                                                        <input
                                                            type="email"
                                                            placeholder={index === 0 ? (formData.email || "leader@domain.com") : `member${index + 1}@domain.com`}
                                                            className="w-full bg-[#050806] border border-[#39ff88]/20 rounded-xl p-2.5 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none transition-colors"
                                                            value={member.email || (index === 0 ? formData.email : '')}
                                                            onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-mono text-gray-400 uppercase">Member Pass Password</label>
                                                        <input
                                                            type="password"
                                                            placeholder={index === 0 ? (formData.password || "Set password") : "Set member password"}
                                                            className="w-full bg-[#050806] border border-[#39ff88]/20 rounded-xl p-2.5 text-xs text-white font-mono focus:border-[#39ff88] focus:outline-none transition-colors"
                                                            value={member.password || (index === 0 ? formData.password : '')}
                                                            onChange={(e) => handleTeamMemberChange(index, 'password', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Institution / College *</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Enter college name"
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono placeholder:text-gray-600 focus:border-[#39ff88] focus:outline-none transition-all"
                                                value={formData.college || ''}
                                                onChange={(e) => handleChange('college', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Department *</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Ex: Cyber Security"
                                                className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono placeholder:text-gray-600 focus:border-[#39ff88] focus:outline-none transition-all"
                                                value={formData.department || ''}
                                                onChange={(e) => handleChange('department', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Degree *</label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono focus:border-[#39ff88] focus:outline-none appearance-none transition-all"
                                                    value={formData.degree || ''}
                                                    onChange={(e) => handleChange('degree', e.target.value)}
                                                >
                                                    <option value="">Select Degree</option>
                                                    <option value="B.E/B.Tech">B.E / B.Tech</option>
                                                    <option value="M.E/M.Tech">M.E / M.Tech</option>
                                                    <option value="Arts & Science">Arts & Science</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#39ff88]">
                                                    ▼
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Year of Study *</label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full bg-[#08100b] border border-[#39ff88]/25 rounded-xl p-3.5 text-sm text-white font-mono focus:border-[#39ff88] focus:outline-none appearance-none transition-all"
                                                    value={formData.year || ''}
                                                    onChange={(e) => handleChange('year', e.target.value)}
                                                >
                                                    <option value="">Select Year</option>
                                                    <option value="1">1st Year</option>
                                                    <option value="2">2nd Year</option>
                                                    <option value="3">3rd Year</option>
                                                    <option value="4">4th Year</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#39ff88]">
                                                    ▼
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-wider">Squad Leader ID Card *</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="team-leader-id-upload"
                                                onChange={(e) => e.target.files && uploadFile(e.target.files[0], 'teamLeaderIdCard')}
                                            />
                                            <label
                                                htmlFor="team-leader-id-upload"
                                                className={`w-full flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${formData.teamLeaderIdCardUrl
                                                    ? 'border-[#39ff88] bg-[#39ff88]/10 text-[#39ff88]'
                                                    : 'border-[#39ff88]/30 bg-[#08100b] hover:bg-[#0e1b14] text-[#bfc8c3]/70 hover:text-white hover:border-[#39ff88]/60'
                                                    }`}
                                            >
                                                {uploadingIdCard ? (
                                                    <span className="animate-pulse flex items-center gap-2 text-sm font-mono"><FaSpinner size={16} className="animate-spin text-[#39ff88]" /> Uploading Document...</span>
                                                ) : formData.teamLeaderIdCardUrl ? (
                                                    <>
                                                        <div className="w-8 h-8 rounded-full bg-[#39ff88]/20 border border-[#39ff88]/40 flex items-center justify-center mb-1">
                                                            <FaCheck size={14} className="text-[#39ff88]" />
                                                        </div>
                                                        <span className="text-xs font-mono font-bold text-[#39ff88]">Leader ID Uploaded Successfully</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-full bg-[#39ff88]/10 flex items-center justify-center mb-1 border border-[#39ff88]/20">
                                                            <FaCloudUploadAlt size={20} className="text-[#39ff88]" />
                                                        </div>
                                                        <span className="text-xs font-mono text-white">Click to Upload Squad Leader ID</span>
                                                        <span className="text-[10px] text-[#bfc8c3]/50 font-mono">Supported formats: JPG, PNG</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Free Event Notice */}
                        <div className="bg-[#39ff88]/10 border border-[#39ff88]/30 rounded-xl p-5 text-center my-4">
                            <p className="text-[#39ff88] font-orbitron font-bold text-base uppercase tracking-wider">✦ ALL EVENTS FREE - NO PAYMENT REQUIRED ✦</p>
                            <p className="text-[#bfc8c3]/70 text-xs font-mono mt-1">Open participation clearance granted for all modules</p>
                        </div>

                        <button
                            type="submit"
                            disabled={uploadingIdCard || uploadingPayment}
                            className="w-full bg-[#39ff88] text-black font-black font-orbitron uppercase tracking-wider py-4 text-sm md:text-base rounded-xl hover:bg-[#39ff88]/90 transition-all flex items-center justify-center gap-3 mt-6 disabled:opacity-50 active:scale-[0.98] shadow-[0_0_25px_rgba(57,255,136,0.3)] cursor-pointer"
                        >
                            {uploadingIdCard || uploadingPayment ? (
                                <><FaSpinner className="animate-spin" /> UPLOADING TELEMETRY...</>
                            ) : (
                                'TRANSMIT ENROLLMENT DATA'
                            )}
                        </button>
                    </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};
