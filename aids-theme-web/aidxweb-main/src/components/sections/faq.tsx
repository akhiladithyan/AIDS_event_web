"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, Terminal } from "lucide-react";
import config from "@/config";
import { safeJsonResponse } from "@/lib/utils";

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
    index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="mb-3"
        >
            <button
                onClick={onClick}
                className={`w-full text-left p-4 md:p-5 flex items-center justify-between bg-[#0b1510]/80 border rounded-lg transition-all duration-300 group ${
                    isOpen 
                        ? "border-[#39ff88] bg-[#0e1b14] shadow-[0_0_20px_rgba(57,255,136,0.15)]" 
                        : "border-[#39ff88]/20 hover:border-[#39ff88]/50 hover:bg-[#0b1510]"
                }`}
            >
                <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs font-bold ${isOpen ? "text-[#39ff88]" : "text-[#bfc8c3]/40 group-hover:text-[#39ff88]"}`}>
                        [0{index + 1}]
                    </span>
                    <span className={`font-orbitron text-xs md:text-sm tracking-wider font-semibold ${isOpen ? "text-[#39ff88]" : "text-white group-hover:text-[#39ff88]"} transition-colors uppercase`}>
                        {question}
                    </span>
                </div>
                <div className={`p-1 rounded border ${isOpen ? "bg-[#39ff88]/20 border-[#39ff88]" : "border-white/10 group-hover:border-[#39ff88]/40"} transition-all`}>
                    {isOpen ? <Minus className="w-4 h-4 text-[#39ff88]" /> : <Plus className="w-4 h-4 text-[#bfc8c3]" />}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 md:p-5 pt-3 text-[#bfc8c3]/90 font-mono text-xs md:text-sm leading-relaxed border-l-2 border-[#39ff88] ml-4 md:ml-6 mt-2 bg-[#08100b]/90 rounded-r-lg">
                            <span className="text-[#39ff88] block mb-1 text-xs font-bold tracking-wider">// SYSTEM_DECRYPTED_OUTPUT:</span>
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const defaultFaqs = [
        {
            question: "WHEN_AND_WHERE_IS_AIDEX26",
            answer: "AIDEX'26 Doomsday Protocol activates on October 7, 2026. The technical proving grounds are situated at Vel Tech Multi Tech Campus, Avadi, Chennai. Check the Tactical Coordinates module for satellite data."
        },
        {
            question: "PARTICIPATION_PROTOCOLS",
            answer: "The symposium is open to all engineering operatives across disciplines and years. Both internal and external operatives are cleared to enter the challenge arena."
        },
        {
            question: "REGISTRATION_SEQUENCE",
            answer: "Initiate registration via the 'INITIALIZE PROTOCOL' command in the navigation bar. Once credentials are verified, browse the Challenge Modules to lock in your mission sectors."
        },
        {
            question: "FEE_STRUCTURE_ANALYSIS",
            answer: "Entry requires standard symposium clearance. Specialized workshops and elite tracks carry nominal resource allocation fees. Full details are accessible in the registration terminal."
        },
        {
            question: "SQUAD_SIZE_PARAMETERS",
            answer: "For hackathons and collaborative operations, squads are calibrated at 2 to 4 operatives. Cross-institution alliances are fully sanctioned."
        }
    ];

    const [faqs, setFaqs] = useState(defaultFaqs);

    React.useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await fetch(`${config.API_URL}/content`);
                const data = await safeJsonResponse(res);
                if (data && data.success && data.data?.faqs && data.data.faqs.length > 0) {
                    setFaqs(data.data.faqs);
                }
            } catch (error) {
                console.error("Failed to fetch FAQs", error);
            }
        };

        fetchFaqs();
    }, []);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="relative w-full py-24 px-4 md:px-12 lg:px-24 bg-[#050806] overflow-hidden border-t border-[#39ff88]/10">

            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#39ff88]/5 rounded-full filter blur-[120px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#39ff88]/30 bg-[#39ff88]/10 mb-4 text-[#39ff88] text-xs font-mono uppercase tracking-widest">
                        <Terminal className="w-3.5 h-3.5" /> DECRYPTED INTEL
                    </div>
                    <div className="relative group inline-block mb-3">
                        <h2 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-wider relative z-10 drop-shadow-[0_0_25px_rgba(57,255,136,0.3)]">
                            QUERY MATRIX
                        </h2>
                    </div>
                    <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#39ff88] to-transparent mx-auto"></div>
                    <p className="mt-4 text-[#39ff88]/80 font-mono tracking-widest text-xs uppercase">
                        [ SYSTEM FAQ PROTOCOLS // DECLASSIFIED ]
                    </p>
                </motion.div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                            index={index}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
};

export default FAQSection;
