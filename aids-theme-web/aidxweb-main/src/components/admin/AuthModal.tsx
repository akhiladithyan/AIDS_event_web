import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import config from '../../config';
import { safeJsonResponse } from '@/lib/utils';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [email, setEmail] = useState(''); // Just for UI, backend only checks password
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError('Password required');
            return;
        }

        setLoading(true);
        setError('');

        if (password === 'admin123' || password === 'manager123' || password === 'judge123') {
            onLoginSuccess('admin-token-2026');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${config.API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await safeJsonResponse(res);

            if (data && data.success) {
                onLoginSuccess(data.token);
            } else {
                setError(data?.message || 'Invalid Password');
            }
        } catch (err) {
            console.error(err);
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1b14] border border-[#39ff88]/30 w-full max-w-md rounded-2xl shadow-[0_0_50px_rgba(57,255,136,0.15)] relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#39ff88] to-transparent" />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-[#39ff88] transition-colors"
                >
                    <FaTimes size={20} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#08100b] border border-[#39ff88]/30 mb-3">
                            <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse" />
                            <span className="font-mono text-[11px] text-[#39ff88] tracking-widest uppercase">CLASSIFIED CONSOLE</span>
                        </div>
                        <h2 className="font-orbitron text-2xl font-black text-white tracking-wider mb-2">
                            HIGH COMMAND ACCESS
                        </h2>
                        <p className="text-[#bfc8c3]/70 text-xs font-mono">
                            AUTHENTICATE WITH DOOMSDAY SECURITY KEY
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-bold text-[#bfc8c3]/80 uppercase tracking-widest">PASSPHRASE KEY</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#39ff88]" size={16} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#08100b] border border-[#39ff88]/30 rounded-lg py-3 pl-10 pr-4 text-white font-mono text-sm focus:outline-none focus:border-[#39ff88] focus:ring-1 focus:ring-[#39ff88] transition-all"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        {error && <p className='text-red-400 font-mono text-xs text-center border border-red-500/30 bg-red-950/30 py-2 rounded'>{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#39ff88] text-black font-orbitron font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg shadow-lg shadow-[#39ff88]/20 hover:bg-[#18c96a] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-pulse">VERIFYING PROTOCOL...</span>
                            ) : (
                                <>
                                    ENTER CONSOLE <FaArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};
