import React from 'react';
import { ArrowRight } from 'lucide-react';
import PillButton from './PillButton';
import FuzzyText from './FuzzyText';
import ShinyText from './ShinyText';
import './DoomsdayHero.css';

export default function DoomsdayHero({ bgImage, onExploreClick }) {
  return (
    <div className="doomsday-hero">
      {/* Background Image Layer */}
      <div
        className="doomsday-bg-image"
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
      />
      {/* Doctor Doom Cyber Ambient Overlay */}
      <div className="doomsday-bg-art" />

      {/* Top Left HUD */}
      <div className="doomsday-hud-tl">
        <div><span className="doomsday-status-dot" />// LATVERIAN AI CORE: ONLINE</div>
        <div>THREAT LEVEL: OMEGA</div>
        <div>SYSTEM: 100% ARMED</div>
      </div>

      {/* Top Right HUD */}
      <div className="doomsday-hud-tr">
        <div>LAT: 13.1167° N</div>
        <div>LON: 80.0970° E</div>
        <div>SECTOR: DOOMSDAY_ACTIVE</div>
      </div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 800 }}>
        {/* Protocol Badge */}
        <div className="doomsday-badge">
          <span className="doomsday-status-dot" /> // DOOMSDAY PROTOCOL ACTIVE
        </div>

        {/* Main Title with Fuzzy Text Animation */}
        <div style={{ margin: '0 0 -10px 0' }}>
          <FuzzyText
            baseIntensity={0.15}
            hoverIntensity={0.5}
            fuzzRange={10}
            enableHover={true}
            color="#ffffff"
            fontSize="clamp(3.5rem, 8vw, 7.5rem)"
            fontWeight={900}
          >
            AIDEX'26
          </FuzzyText>
        </div>

        {/* Doomsday Tag with Shiny Text Animation */}
        <div className="doomsday-subtitle">
          <ShinyText
            text="DOOMSDAY"
            color="#1ce604"
            shineColor="#ffffff"
            speed={3}
            spread={120}
          />
        </div>

        {/* Line Divider */}
        <div className="doomsday-divider" />

        {/* Presented By & Details */}
        <div className="doomsday-presented">
          PRESENTED BY <span>DEPT. OF AI & DATA SCIENCE</span>
        </div>
        <div className="doomsday-date">
          OCT 7, 2026 &nbsp;|&nbsp; NATIONAL TECHNICAL SYMPOSIUM
        </div>

        {/* Action Buttons */}
        <div className="doomsday-actions">
          <PillButton
            as="a"
            href="#events-section"
            variant="primary"
            onClick={onExploreClick}
            style={{
              padding: '12px 28px',
              backgroundColor: '#1ce604',
              color: '#060b07',
              borderColor: '#1ce604',
              fontWeight: 800
            }}
          >
            Explore Events <ArrowRight size={18} />
          </PillButton>
        </div>
      </div>
    </div>
  );
}
