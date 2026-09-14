"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/sections/header";
import MobileNav from "@/components/sections/MobileNav";
import Footer from "@/components/sections/footer";
import config from "@/config";
import { safeJsonResponse } from "@/lib/utils";

interface LookupResult {
  _id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  eventName: string;
  participationType: string;
  teamName?: string;
  paymentStatus: string;
  isActive: boolean;
  createdAt: string;
}

function StatusBadge({ isActive, paymentStatus }: { isActive: boolean; paymentStatus: string }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 text-green-400 text-xs font-bold border border-green-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        ✓ Verified & Active
      </span>
    );
  }
  if (paymentStatus === "Free") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold border border-blue-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        ✓ Free Event — Confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-400 text-xs font-bold border border-yellow-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
      ⏳ Pending Verification
    </span>
  );
}

export default function LookupPage() {
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState<"email" | "phone">("email");
  const [results, setResults] = useState<LookupResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const params = new URLSearchParams({ [queryType]: query.trim() });
      const res = await fetch(`${config.API_URL}/registrations/lookup?${params}`);
      const data = await safeJsonResponse(res);

      if (data && data.success) {
        setResults(data.data || []);
      } else {
        setError(data?.error || "Lookup failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MobileNav />
      <Header />
      <main className="min-h-screen bg-[#050806] text-white pt-28 pb-20">
        {/* Hero */}
        <div className="text-center px-4 mb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-[#39ff88] font-mono text-xs uppercase tracking-[6px] mb-3">&gt; PARTICIPANT PORTAL</p>
            <h1 className="text-3xl md:text-5xl font-black font-audiowide text-white mb-4 tracking-tighter">
              MY_REGISTRATION
            </h1>
            <p className="text-gray-400 font-mono text-sm max-w-lg mx-auto">
              Enter your registered email or phone number to check your registration status, event details, and verification status.
            </p>
          </motion.div>
        </div>

        {/* Search Card */}
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-[#0a120a] border border-[#39ff88]/20 rounded-2xl p-6 mb-8 shadow-[0_0_40px_rgba(57,255,136,0.05)]">
            {/* Toggle email / phone */}
            <div className="flex rounded-lg overflow-hidden border border-white/10 mb-5">
              {(["email", "phone"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setQueryType(t)}
                  className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider transition-all ${
                    queryType === t ? "bg-[#39ff88] text-[#050806] font-bold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t === "email" ? "📧 Email" : "📱 Phone"}
                </button>
              ))}
            </div>

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-mono mb-2 uppercase tracking-wider">
                  {queryType === "email" ? "Email Address" : "Phone Number"}
                </label>
                <input
                  type={queryType === "email" ? "email" : "tel"}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={queryType === "email" ? "you@example.com" : "+91 98765 43210"}
                  className="w-full bg-[#050f05] border border-white/15 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#39ff88]/60 placeholder-gray-600 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#39ff88]/10 border border-[#39ff88]/50 text-[#39ff88] font-bold font-mono text-sm uppercase tracking-widest hover:bg-[#39ff88] hover:text-[#050806] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-[#39ff88]/30 border-t-[#39ff88] rounded-full animate-spin" /> Searching...</>
                ) : (
                  <><span className="w-1.5 h-1.5 bg-[#39ff88] rounded-full" /> Lookup Registration</>
                )}
              </button>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-center">
              <p className="text-red-400 font-mono text-sm">❌ {error}</p>
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {results !== null && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                {results.length === 0 ? (
                  <div className="text-center py-12 border border-white/8 rounded-2xl">
                    <p className="text-5xl mb-3">🔍</p>
                    <p className="text-gray-400 font-mono text-sm">No registration found for this {queryType}.</p>
                    <p className="text-gray-600 font-mono text-xs mt-2">
                      Double-check the {queryType} or{" "}
                      <Link href="/events" className="text-[#39ff88] hover:underline">register here</Link>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-wider mb-3">
                      Found {results.length} registration{results.length !== 1 ? "s" : ""}
                    </p>
                    {results.map((r) => (
                      <div
                        key={r._id}
                        className="bg-[#0a120a] border border-white/8 rounded-xl p-5 hover:border-[#39ff88]/25 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="font-bold text-white font-audiowide text-sm">{r.name}</h3>
                            <p className="text-gray-500 font-mono text-xs mt-0.5">{r.college}</p>
                          </div>
                          <StatusBadge isActive={r.isActive} paymentStatus={r.paymentStatus} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                          <div>
                            <span className="text-gray-600 block mb-0.5">EVENT</span>
                            <span className="text-[#39ff88]">{r.eventName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 block mb-0.5">TYPE</span>
                            <span className="text-white">
                              {r.participationType === "Team" ? `Team — ${r.teamName || "N/A"}` : "Individual"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 block mb-0.5">PAYMENT</span>
                            <span
                              className={r.paymentStatus === "Verified" || r.paymentStatus === "Free" ? "text-green-400" : "text-yellow-400"}
                            >
                              {r.paymentStatus}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 block mb-0.5">REGISTERED ON</span>
                            <span className="text-gray-400">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                          <p className="text-[10px] text-gray-600 font-mono">Email: {r.email} · Phone: {r.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-gray-700 font-mono text-xs mt-8">
            Issues with your registration?{" "}
            <Link href="/#contact" className="text-[#39ff88]/60 hover:text-[#39ff88] transition-colors">
              Contact us
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
