import React, { useState } from 'react';
import { FaCheck, FaCloudUploadAlt, FaArrowRight, FaShieldAlt, FaTimes, FaQrcode } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface TicketPrices {
    diamond: number;
    gold: number;
    silver: number;
}

interface TicketPortalProps {
    prices: TicketPrices;
    upiId: string;
    qrCodeUrl: string;
    onClose: () => void;
}

export const TicketPortal: React.FC<TicketPortalProps> = ({ prices, upiId, qrCodeUrl, onClose }) => {
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Fallback prices to avoid crashes if content not loaded
    const safePrices = prices || { silver: 0, gold: 0, diamond: 0 };

    const tiers = [
        {
            name: 'Silver Operative',
            price: safePrices.silver,
            color: 'from-[#66716c] to-[#bfc8c3]',
            features: ['General Symposium Access', 'Core Technical Track Access', 'Official Digital Clearance']
        },
        {
            name: 'Gold Commander',
            price: safePrices.gold,
            color: 'from-[#18c96a] to-[#39ff88]',
            features: ['Pro-Show Access Clearance', 'Front Row Tactical Seating', 'Tactical Merch Kit', 'All Silver Benefits']
        },
        {
            name: 'Apex Victor',
            price: safePrices.diamond,
            color: 'from-[#39ff88] to-emerald-300',
            features: ['VIP All-Access Clearance', 'High Command Meet & Greet', 'Backstage Access', 'All Gold Benefits']
        }
    ];

    const handlePaymentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentProof(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (!paymentProof) return;
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#0b1510] border border-[#39ff88]/50 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(57,255,136,0.3)]"
                >
                    <div className="w-20 h-20 bg-[#39ff88]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#39ff88]/40">
                        <FaShieldAlt size={40} className="text-[#39ff88]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-orbitron uppercase">ACCESS GRANTED</h2>
                    <p className="text-[#bfc8c3]/80 font-mono text-xs md:text-sm mb-6">
                        Transmission received for <span className="text-[#39ff88] font-bold">{selectedTier}</span>. 
                        Credentials and verification pass will be dispatched to your comms link.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-[#39ff88] text-black font-bold font-orbitron text-xs uppercase rounded-lg hover:bg-[#39ff88]/90 transition-all shadow-[0_0_20px_rgba(57,255,136,0.4)]"
                    >
                        Return to Command
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md overflow-y-auto">
            <div className="min-h-screen py-12 px-4 flex flex-col items-center">
                <div className="w-full max-w-6xl relative">
                    <button
                        onClick={onClose}
                        className="absolute top-0 right-0 p-2.5 bg-white/5 rounded-full hover:bg-white/15 text-white transition-colors border border-white/10"
                    >
                        <FaTimes size={20} />
                    </button>

                    <div className="text-center mb-12">
                        <div className="inline-block border border-[#39ff88]/30 bg-[#39ff88]/10 px-4 py-1 rounded-full mb-3 text-[#39ff88] text-xs font-mono uppercase tracking-widest">
                            :: CLEARANCE_TIERS ::
                        </div>
                        <h2 className="font-orbitron text-3xl md:text-5xl font-black text-white mb-3 uppercase tracking-wider">
                            SELECT YOUR <span className="text-[#39ff88]">CLEARANCE</span>
                        </h2>
                        <p className="text-[#bfc8c3]/70 font-mono text-xs md:text-sm max-w-2xl mx-auto uppercase">
                            Lock in your authorization level for the AIDEX&apos;26 Doomsday technical symposium.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                        {tiers.map((tier) => (
                            <div
                                key={tier.name}
                                onClick={() => setSelectedTier(tier.name)}
                                className={`relative bg-[#0b1510] rounded-2xl p-6 border transition-all cursor-pointer group ${selectedTier === tier.name
                                    ? 'border-[#39ff88] scale-105 shadow-[0_0_35px_rgba(57,255,136,0.3)] bg-[#0e1b14]'
                                    : 'border-[#39ff88]/20 hover:border-[#39ff88]/60'
                                    }`}
                            >
                                <div className={`absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${tier.color}`} />
                                <h3 className="text-xl font-bold text-white mt-3 font-orbitron uppercase">{tier.name}</h3>
                                <div className="text-3xl font-black text-[#39ff88] font-orbitron mt-2 mb-6">₹{tier.price}</div>

                                <ul className="space-y-3 mb-8">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[#bfc8c3]/80 font-mono text-xs">
                                            <div className="w-4 h-4 rounded-full bg-[#39ff88]/10 border border-[#39ff88]/30 flex items-center justify-center flex-shrink-0">
                                                <FaCheck size={9} className="text-[#39ff88]" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div
                                    className={`w-full py-3 rounded-lg text-center font-orbitron text-xs font-bold uppercase tracking-wider transition-all ${selectedTier === tier.name
                                        ? 'bg-[#39ff88] text-black shadow-[0_0_20px_rgba(57,255,136,0.4)]'
                                        : 'bg-white/5 text-[#bfc8c3] group-hover:bg-[#39ff88]/20 group-hover:text-white'
                                        }`}
                                >
                                    {selectedTier === tier.name ? 'CLEARANCE SELECTED' : 'CHOOSE TIER'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <AnimatePresence>
                        {selectedTier && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="max-w-3xl mx-auto bg-[#0b1510] border border-[#39ff88]/30 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(57,255,136,0.15)]"
                            >
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 font-orbitron uppercase">
                                    <FaCloudUploadAlt size={20} className="text-[#39ff88]" />
                                    Transaction Authorization & Payment Proof
                                </h3>

                                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-6">
                                    <div className="bg-[#08100b] p-6 rounded-xl border border-[#39ff88]/20 flex-1 w-full">
                                        <div className="text-center mb-6">
                                            <p className="text-xs font-mono text-[#bfc8c3]/60 uppercase mb-1">Total Resource Allocation</p>
                                            <p className="text-3xl font-black text-[#39ff88] font-orbitron">
                                                ₹{tiers.find((t) => t.name === selectedTier)?.price}
                                            </p>
                                        </div>

                                        {qrCodeUrl && (
                                            <div className="flex justify-center mb-4">
                                                <div className="bg-white p-2 rounded-xl">
                                                    <img src={qrCodeUrl} alt="Payment QR" className="w-32 h-32 object-contain" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-center gap-2 bg-[#050806] p-3 rounded-lg border border-[#39ff88]/20">
                                            <div className="w-7 h-7 rounded-full bg-[#39ff88]/20 flex items-center justify-center">
                                                <FaQrcode size={14} className="text-[#39ff88]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-mono text-[#bfc8c3]/60 uppercase">UPI UPLINK ID</p>
                                                <p className="font-mono text-xs font-bold text-[#39ff88] select-all">{upiId}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full flex flex-col justify-between self-stretch">
                                        <label
                                            className={`flex flex-col items-center justify-center w-full flex-1 min-h-[160px] border-2 border-dashed rounded-xl cursor-pointer transition-all ${paymentProof ? 'border-[#39ff88] bg-[#39ff88]/10' : 'border-[#39ff88]/30 hover:border-[#39ff88] hover:bg-[#08100b]'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center p-4">
                                                {paymentProof ? (
                                                    <>
                                                        <FaCheck className="w-8 h-8 text-[#39ff88] mb-2" />
                                                        <p className="text-xs text-[#39ff88] font-mono font-bold">{paymentProof.name}</p>
                                                        <p className="text-[10px] text-[#39ff88]/70 mt-1 font-mono">Click to re-upload</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaCloudUploadAlt className="w-8 h-8 text-[#bfc8c3]/60 mb-2" />
                                                        <p className="text-xs text-white font-mono font-bold mb-1">Upload Receipt Verification</p>
                                                        <p className="text-[10px] text-[#bfc8c3]/50 font-mono">Supported formats: JPG, PNG</p>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePaymentUpload} />
                                        </label>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={!paymentProof || isSubmitting}
                                            className="w-full py-3.5 mt-4 bg-[#39ff88] rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_25px_rgba(57,255,136,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#39ff88]/90 active:scale-[0.98] transition-all"
                                        >
                                            {isSubmitting ? 'VALIDATING TRANSMISSION...' : 'COMPLETE PROTOCOL'} <FaArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-center text-[10px] font-mono text-[#bfc8c3]/50">
                                    ENSURE TRANSACTION REFERENCE ID IS VISIBLE. INTELLIGENCE VERIFICATION OCCURS EXPEDITIOUSLY.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
