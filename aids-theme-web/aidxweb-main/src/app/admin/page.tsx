'use client';

import React, { useState, useEffect } from 'react';
import { AdminPanel } from '../../components/admin/AdminPanel';
import { AuthModal } from '../../components/admin/AuthModal';
import config from '../../config';
import { Content, Event } from '../../types/admin';

import { safeJsonResponse } from '@/lib/utils';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [content, setContent] = useState<Content>({
        heroTitle: '',
        heroSubtitle: '',
        heroBackgroundMedia: null,
        marqueeText: '',
        eventDate: '',
        ticketPrices: { diamond: 0, gold: 0, silver: 0 },
        upiId: '',
        qrCodeUrl: '',
        galleryImages: [],
        faqs: []
    });
    const [events, setEvents] = useState<Event[]>([]);
    const [settings, setSettings] = useState({ registrationOpen: true });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ideally check for a stored token, but for now we'll just check if we have data
        // Auth persistence is simple state for now
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [contentRes, eventsRes, settingsRes] = await Promise.all([
                fetch(`${config.API_URL}/content`),
                fetch(`${config.API_URL}/events`),
                fetch(`${config.API_URL}/settings`)
            ]);

            const contentData = await safeJsonResponse(contentRes);
            const eventsData = await safeJsonResponse(eventsRes);
            const settingsData = await safeJsonResponse(settingsRes);

            if (contentData.success) setContent(contentData.data || content);
            if (settingsData.success) setSettings(settingsData.data);

            // Events endpoint returns array directly in the original backend code
            if (Array.isArray(eventsData)) {
                setEvents(eventsData);
            } else if (eventsData.success && Array.isArray(eventsData.data)) {
                setEvents(eventsData.data);
            }

        } catch (error) {
            console.error("Failed to load initial data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = (token: string) => {
        setIsAuthenticated(true);
        // In a real app, save token to localStorage here
    };

    if (loading) {
        return <div className="min-h-screen bg-[#050806] flex flex-col items-center justify-center gap-3 text-white">
            <div className="w-8 h-8 rounded-full border-2 border-[#39ff88] border-t-transparent animate-spin" />
            <span className="font-mono text-xs text-[#39ff88] tracking-widest uppercase animate-pulse">INITIALIZING COMMAND CONSOLE...</span>
        </div>;
    }

    if (!isAuthenticated) {
        return (
            <AuthModal
                isOpen={!isAuthenticated}
                onClose={() => { }} // Cannot close unless logged in
                onLoginSuccess={handleLoginSuccess}
            />
        );
    }

    return (
        <AdminPanel
            isOpen={isAuthenticated}
            onClose={() => setIsAuthenticated(false)}
            content={content}
            setContent={setContent}
            events={events}
            setEvents={setEvents}
            settings={settings}
            setSettings={setSettings}
        />
    );
}
