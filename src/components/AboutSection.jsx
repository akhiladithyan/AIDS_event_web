import React from 'react';
import { Calendar, Cpu } from 'lucide-react';
import './AboutSection.css';

export default function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-card">
        {/* Left Column: Heading & Key Metrics */}
        <div className="about-left">


          <h2 className="about-title-main">
            ABOUT <br />
            AIDEX'26
          </h2>

          <div className="about-divider-line" />

          {/* Quick Metrics */}
          <div className="about-stats-grid">
            <div className="about-stat-box">
              <div className="about-stat-val">OCT 7, 2026</div>
              <div className="about-stat-lbl">DAY EVENT (8:30 AM - 3:30 PM)</div>
            </div>
            <div className="about-stat-box">
              <div className="about-stat-val">AI & DS</div>
              <div className="about-stat-lbl">HOST DEPARTMENT</div>
            </div>
          </div>
        </div>

        {/* Right Column: Mission Briefing Terminal */}
        <div className="about-terminal-box">
          <div className="about-prompt-line">
            Welcome to <strong>AIDEX'26</strong>, a technical Symposium proudly presented by the Department of <strong>Artificial Intelligence & Data Science</strong> at Vel Tech Multi Tech.
          </div>

          <div className="about-prompt-line">
            Inspired by the collapse of boundaries in <strong>Avengers: Doomsday</strong>, we are executing a classified suite of High-Stakes Technical Events, AI Hackathons, and intelligence challenges designed to push participants to absolute mastery.
          </div>

          <div className="about-prompt-line">
            Enter the Doomsday Protocol, conquer the algorithms, and claim victory before the system resets.
          </div>
        </div>
      </div>
    </section>
  );
}
