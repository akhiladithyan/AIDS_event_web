import React from 'react';
import { ArrowRight } from 'lucide-react';
import PillButton from './PillButton';
import FuzzyText from './FuzzyText';
import ShinyText from './ShinyText';
import './DoomsdayHero.css';

export default function DoomsdayHero({ bgImage, onExploreClick }) {
  const handleExploreClick = (e) => {
    e.preventDefault();
    const el = document.getElementById('event-cards-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    if (onExploreClick) onExploreClick(e);
  };

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
      <div className="doomsday-hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: 800 }}>


        {/* Main Title with Fuzzy Text Animation */}
        <div style={{ margin: '0 0 -10px 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <FuzzyText
            baseIntensity={0.15}
            hoverIntensity={0.5}
            fuzzRange={10}
            enableHover={true}
            color="#ffffff"
            fontSize="clamp(3.6rem, 15vw, 7.5rem)"
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

        {/* Presented By & Details with React Bits ShinyText */}
        <div className="doomsday-presented">
          <ShinyText
            text="PRESENTED BY "
            color="#ffffff"
            shineColor="#1ce604"
            speed={3.2}
          />
          <ShinyText
            text="DEPT. OF AI & DATA SCIENCE"
            color="#1ce604"
            shineColor="#ffffff"
            speed={2.5}
          />
        </div>
        <div className="doomsday-date">
          <ShinyText
            text="OCT 7, 2026  |  NATIONAL TECHNICAL SYMPOSIUM"
            color="#ffffff"
            shineColor="#1ce604"
            speed={3.5}
          />
        </div>

        {/* Action Buttons */}
        <div className="doomsday-actions">
          <PillButton
            as="a"
            href="#event-cards-grid"
            variant="primary"
            onClick={handleExploreClick}
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
