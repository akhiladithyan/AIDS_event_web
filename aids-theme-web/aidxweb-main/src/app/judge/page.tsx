"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import config from "@/config";
import { safeJsonResponse } from "@/lib/utils";
import { 
  FaGavel, 
  FaTrophy, 
  FaLock, 
  FaCheckCircle, 
  FaStar, 
  FaChartLine, 
  FaSyncAlt, 
  FaClipboardList,
  FaAward
} from "react-icons/fa";

interface EventItem {
  id: string;
  title: string;
  category?: string;
}

interface TeamItem {
  _id: string;
  name: string;
  teamName?: string;
  eventName: string;
}

interface LeaderboardItem {
  teamId: string;
  teamName: string;
  judgeCount: number;
  avgScore: number;
}

export default function JudgePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [authError, setAuthError] = useState("");

  const [judgeName, setJudgeName] = useState("Judge 1");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamItem | null>(null);

  // Score Criteria (Each 0-25)
  const [innovation, setInnovation] = useState<number>(20);
  const [technicality, setTechnicality] = useState<number>(20);
  const [design, setDesign] = useState<number>(20);
  const [presentation, setPresentation] = useState<number>(20);
  const [feedback, setFeedback] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  
  // Leaderboard & History
  const [activeTab, setActiveTab] = useState<"SCORING" | "LEADERBOARD">("SCORING");
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("nexathon_token");
    if (token) {
      setIsAuthenticated(true);
      fetchEvents();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedEventId) {
      fetchTeamsForEvent(selectedEventId);
      fetchLeaderboard(selectedEventId);
    }
  }, [selectedEventId]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch(`${config.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "judge@nexathon.org", password: passphrase }),
      });
      const data = await safeJsonResponse(res);
      if (data && data.success && data.token) {
        localStorage.setItem("nexathon_token", data.token);
        sessionStorage.setItem("neura_judge_token", data.token);
        if (data.user?.name) setJudgeName(data.user.name);
        setIsAuthenticated(true);
        return;
      }

      if (passphrase === "judge123" || passphrase === "admin123") {
        localStorage.setItem("nexathon_token", "judge-token-2026");
        setIsAuthenticated(true);
        return;
      }

      setAuthError(data?.error || data?.message || "Invalid Judge Credentials");
    } catch (err) {
      if (passphrase === "judge123" || passphrase === "admin123") {
        localStorage.setItem("nexathon_token", "judge-token-2026");
        setIsAuthenticated(true);
      } else {
        setAuthError("Server authentication failed.");
      }
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${config.API_URL}/events`);
      const data = await safeJsonResponse(res);
      if (data && data.success && data.data) {
        const evts = data.data.map((e: any) => ({
          id: e.id || e._id,
          title: e.title || e.name,
          category: e.category,
        }));
        setEvents(evts);
        if (evts.length > 0) {
          setSelectedEventId(evts[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  const fetchTeamsForEvent = async (eventId: string) => {
    try {
      const token = localStorage.getItem("nexathon_token") || "judge-token-2026";
      const res = await fetch(`${config.API_URL}/manager/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeJsonResponse(res);
      if (data && data.success) {
        const selectedEvtObj = events.find((e) => e.id === eventId);
        const eventTitle = selectedEvtObj?.title?.toLowerCase();

        const filtered = (data.data || []).filter((r: any) => {
          return !eventTitle || r.eventName?.toLowerCase().includes(eventTitle) || eventTitle.includes(r.eventName?.toLowerCase());
        }).map((r: any) => ({
          _id: r._id,
          name: r.teamName || r.name,
          teamName: r.teamName,
          eventName: r.eventName,
        }));

        setTeams(filtered);
        if (filtered.length > 0) {
          setSelectedTeam(filtered[0]);
        } else {
          setSelectedTeam(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch teams", err);
    }
  };

  const fetchLeaderboard = async (eventId: string) => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`${config.API_URL}/judge/scores?eventId=${eventId}`);
      const data = await safeJsonResponse(res);
      if (data && data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const totalScore = innovation + technicality + design + presentation;

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !selectedEventId) return;

    setSubmitting(true);
    setSubmitSuccess("");

    try {
      const res = await fetch(`${config.API_URL}/judge/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          teamId: selectedTeam._id,
          teamName: selectedTeam.name,
          judgeName,
          scores: { innovation, technicality, design, presentation },
          feedback,
        }),
      });

      const data = await safeJsonResponse(res);
      if (data && data.success) {
        setSubmitSuccess(`Score locked for ${selectedTeam.name}: ${totalScore}/100!`);
        fetchLeaderboard(selectedEventId);
        setTimeout(() => setSubmitSuccess(""), 4000);
      }
    } catch (err) {
      console.error("Submit score error", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050806] text-white font-sans selection:bg-[#39ff88] selection:text-black">
      <Header />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Title Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#08100b] border border-[#39ff88]/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse" />
            <span className="font-mono text-xs text-[#39ff88] tracking-widest uppercase">
              EVALUATION PORTAL
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-orbitron tracking-wider text-white mb-2">
            JUDGE SCORING CONSOLE
          </h1>
          <p className="text-gray-400 font-mono text-sm max-w-xl mx-auto">
            Multi-judge evaluation, criteria-based scoring, and live leaderboards.
          </p>
        </div>

        {!isAuthenticated ? (
          /* Auth Shield */
          <div className="max-w-md mx-auto bg-[#0e1b14] border border-[#39ff88]/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(57,255,136,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#39ff88] to-transparent" />
            <div className="text-center mb-6">
              <FaLock className="mx-auto text-[#39ff88] text-3xl mb-3" />
              <h2 className="font-orbitron font-bold text-xl text-white">JUDGE AUTHENTICATION</h2>
              <p className="text-gray-400 font-mono text-xs mt-1">Enter Judge Passphrase (Default: <code className="text-[#39ff88]">judge123</code>)</p>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter Passphrase..."
                  className="w-full bg-[#08100b] border border-[#39ff88]/30 rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#39ff88]"
                />
              </div>
              {authError && (
                <p className="text-red-400 font-mono text-xs text-center bg-red-950/40 py-2 border border-red-500/30 rounded">
                  {authError}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-[#39ff88] text-black font-orbitron font-bold text-xs uppercase tracking-widest py-3 rounded-lg hover:bg-[#18c96a] transition-all"
              >
                ACCESS EVALUATION DESK
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Top Bar: Judge identity & Event selector & Tabs */}
            <div className="bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div>
                  <label className="text-[10px] font-mono text-gray-400 block mb-1 uppercase">Judge Identity</label>
                  <select
                    value={judgeName}
                    onChange={(e) => setJudgeName(e.target.value)}
                    className="bg-[#08100b] border border-[#39ff88]/30 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#39ff88]"
                  >
                    <option value="Judge 1">Judge 1 (Technical Lead)</option>
                    <option value="Judge 2">Judge 2 (Domain Expert)</option>
                    <option value="Judge 3">Judge 3 (Industry Evaluator)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 block mb-1 uppercase">Select Event</label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="bg-[#08100b] border border-[#39ff88]/30 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#39ff88]"
                  >
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* View Switcher */}
              <div className="flex bg-[#08100b] p-1 rounded-lg border border-[#39ff88]/20 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("SCORING")}
                  className={`flex-1 md:flex-none px-4 py-2 text-xs font-mono font-bold rounded flex items-center justify-center gap-2 transition-all ${
                    activeTab === "SCORING"
                      ? "bg-[#39ff88] text-black shadow-[0_0_15px_rgba(57,255,136,0.3)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaGavel size={12} /> SCORING SHEET
                </button>
                <button
                  onClick={() => setActiveTab("LEADERBOARD")}
                  className={`flex-1 md:flex-none px-4 py-2 text-xs font-mono font-bold rounded flex items-center justify-center gap-2 transition-all ${
                    activeTab === "LEADERBOARD"
                      ? "bg-[#39ff88] text-black shadow-[0_0_15px_rgba(57,255,136,0.3)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaTrophy size={12} /> LIVE LEADERBOARD
                </button>
              </div>
            </div>

            {/* TAB 1: SCORING SHEET */}
            {activeTab === "SCORING" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Team Selection List */}
                <div className="bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-4">
                  <h3 className="font-orbitron text-sm font-bold text-[#39ff88] uppercase mb-3 flex items-center gap-2">
                    <FaClipboardList /> Registered Teams ({teams.length})
                  </h3>
                  {teams.length === 0 ? (
                    <p className="text-gray-400 font-mono text-xs py-8 text-center">
                      No teams registered for this event yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {teams.map((t) => (
                        <button
                          key={t._id}
                          onClick={() => setSelectedTeam(t)}
                          className={`w-full text-left p-3 rounded-lg border font-mono text-xs transition-all ${
                            selectedTeam?._id === t._id
                              ? "bg-[#39ff88]/10 border-[#39ff88] text-white"
                              : "bg-[#08100b] border-gray-800 text-gray-400 hover:border-gray-700"
                          }`}
                        >
                          <div className="font-bold text-sm text-white mb-0.5">{t.name}</div>
                          <div className="text-[10px] text-gray-400">ID: {t._id.substring(0, 8)}...</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Scoring Form */}
                <div className="lg:col-span-2 bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-6 relative">
                  {!selectedTeam ? (
                    <div className="text-center py-20 text-gray-400 font-mono">
                      Select a team from the left panel to begin evaluation.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitScore} className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-2">
                        <div>
                          <span className="text-xs font-mono text-[#39ff88] uppercase block">Evaluating Team</span>
                          <h2 className="font-orbitron text-2xl font-bold text-white">{selectedTeam.name}</h2>
                        </div>

                        {/* Live Total Badge */}
                        <div className="bg-[#08100b] border border-[#39ff88]/40 px-4 py-2 rounded-xl text-center">
                          <span className="text-[10px] font-mono text-gray-400 block uppercase">Total Score</span>
                          <span className="font-orbitron font-black text-3xl text-[#39ff88]">{totalScore}</span>
                          <span className="text-xs text-gray-400 font-mono">/100</span>
                        </div>
                      </div>

                      {/* Criteria Sliders */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Criterion 1: Innovation */}
                        <div className="bg-[#08100b] p-4 rounded-xl border border-gray-800">
                          <div className="flex justify-between items-center mb-2">
                            <label className="font-mono text-xs font-bold text-white">1. Innovation & Originality</label>
                            <span className="font-mono font-bold text-sm text-[#39ff88]">{innovation}/25</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={innovation}
                            onChange={(e) => setInnovation(Number(e.target.value))}
                            className="w-full accent-[#39ff88] cursor-pointer"
                          />
                          <span className="text-[10px] text-gray-400 font-mono block mt-1">Novelty of solution and creativity</span>
                        </div>

                        {/* Criterion 2: Technical Complexity */}
                        <div className="bg-[#08100b] p-4 rounded-xl border border-gray-800">
                          <div className="flex justify-between items-center mb-2">
                            <label className="font-mono text-xs font-bold text-white">2. Technical Execution</label>
                            <span className="font-mono font-bold text-sm text-[#39ff88]">{technicality}/25</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={technicality}
                            onChange={(e) => setTechnicality(Number(e.target.value))}
                            className="w-full accent-[#39ff88] cursor-pointer"
                          />
                          <span className="text-[10px] text-gray-400 font-mono block mt-1">Code architecture, feasibility, working demo</span>
                        </div>

                        {/* Criterion 3: Design & UI/UX */}
                        <div className="bg-[#08100b] p-4 rounded-xl border border-gray-800">
                          <div className="flex justify-between items-center mb-2">
                            <label className="font-mono text-xs font-bold text-white">3. Design & User Experience</label>
                            <span className="font-mono font-bold text-sm text-[#39ff88]">{design}/25</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={design}
                            onChange={(e) => setDesign(Number(e.target.value))}
                            className="w-full accent-[#39ff88] cursor-pointer"
                          />
                          <span className="text-[10px] text-gray-400 font-mono block mt-1">Visual appeal, usability, polish</span>
                        </div>

                        {/* Criterion 4: Pitch & Presentation */}
                        <div className="bg-[#08100b] p-4 rounded-xl border border-gray-800">
                          <div className="flex justify-between items-center mb-2">
                            <label className="font-mono text-xs font-bold text-white">4. Pitch & Presentation</label>
                            <span className="font-mono font-bold text-sm text-[#39ff88]">{presentation}/25</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={presentation}
                            onChange={(e) => setPresentation(Number(e.target.value))}
                            className="w-full accent-[#39ff88] cursor-pointer"
                          />
                          <span className="text-[10px] text-gray-400 font-mono block mt-1">Clarity of presentation, Q&A defense</span>
                        </div>
                      </div>

                      {/* Feedback Textarea */}
                      <div>
                        <label className="text-xs font-mono font-bold text-gray-300 block mb-1">
                          Judge Remarks / Feedback
                        </label>
                        <textarea
                          rows={3}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Provide constructive feedback for the team..."
                          className="w-full bg-[#08100b] border border-gray-800 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-[#39ff88]"
                        />
                      </div>

                      {submitSuccess && (
                        <div className="bg-[#39ff88]/10 border border-[#39ff88] text-[#39ff88] p-3 rounded-lg font-mono text-xs text-center flex items-center justify-center gap-2">
                          <FaCheckCircle /> {submitSuccess}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#39ff88] text-black font-orbitron font-bold text-xs uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(57,255,136,0.2)] hover:bg-[#18c96a] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? "LOCKING SCORE..." : <><FaLock size={14} /> LOCK & SUBMIT FINAL SCORE</>}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: LIVE LEADERBOARD */}
            {activeTab === "LEADERBOARD" && (
              <div className="bg-[#0e1b14] border border-[#39ff88]/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                  <div>
                    <h2 className="font-orbitron font-bold text-xl text-white flex items-center gap-2">
                      <FaTrophy className="text-amber-400" /> LIVE EVALUATION RANKINGS
                    </h2>
                    <p className="text-xs font-mono text-gray-400 mt-1">
                      Computed average scores across all participating judges.
                    </p>
                  </div>
                  <button
                    onClick={() => fetchLeaderboard(selectedEventId)}
                    className="p-2.5 bg-[#08100b] border border-[#39ff88]/20 text-[#39ff88] hover:bg-[#39ff88]/10 rounded-lg font-mono text-xs flex items-center gap-2"
                  >
                    <FaSyncAlt className={loadingLeaderboard ? "animate-spin" : ""} size={14} /> Refresh
                  </button>
                </div>

                {loadingLeaderboard ? (
                  <div className="text-center py-16 font-mono text-xs text-gray-400">
                    <FaSyncAlt className="animate-spin text-2xl text-[#39ff88] mx-auto mb-2" />
                    Calculating leaderboard averages...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-16 font-mono text-xs text-gray-400">
                    No scores submitted for this event yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((item, idx) => (
                      <div
                        key={item.teamId}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                          idx === 0
                            ? "bg-amber-500/10 border-amber-500/40"
                            : idx === 1
                            ? "bg-slate-300/10 border-slate-300/40"
                            : idx === 2
                            ? "bg-amber-700/10 border-amber-700/40"
                            : "bg-[#08100b] border-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank Badge */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-orbitron font-bold text-sm ${
                              idx === 0
                                ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                                : idx === 1
                                ? "bg-slate-300 text-black"
                                : idx === 2
                                ? "bg-amber-700 text-white"
                                : "bg-white/10 text-gray-300"
                            }`}
                          >
                            #{idx + 1}
                          </div>

                          <div>
                            <div className="font-orbitron font-bold text-base text-white">{item.teamName}</div>
                            <div className="text-xs font-mono text-gray-400">
                              Evaluated by {item.judgeCount} judge{item.judgeCount > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>

                        {/* Average Score */}
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-gray-400 block uppercase">Average Score</span>
                          <span className="font-orbitron font-black text-2xl text-[#39ff88]">{item.avgScore}</span>
                          <span className="text-xs font-mono text-gray-400">/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
