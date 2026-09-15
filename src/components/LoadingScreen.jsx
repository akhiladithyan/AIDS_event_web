import React, { useState, useEffect } from 'react';
import LetterGlitch from './LetterGlitch';
import SplitFlapText from './SplitFlapText';
import './LoadingScreen.css';

const TOTAL_SEGMENTS = 50;

// 5 cyber telemetry status words
const STATUS_WORDS = [
  'INITIALIZING',
  'CONNECTING',
  'ENCRYPTING',
  'SECURE',
  'ACCESS GRANTED'
];

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Fast total duration target: ~1.2 seconds total (1000ms progress + 200ms exit transition)
    const DURATION_MS = 1000;
    const INTERVAL_MS = 15;
    const totalSteps = DURATION_MS / INTERVAL_MS;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep += 1;
      const nextProgress = Math.min(Math.round((currentStep / totalSteps) * 100), 100);
      setProgress(nextProgress);

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setIsDone(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 200);
      }
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [onComplete]);

  const activeSegmentsCount = Math.floor((progress / 100) * TOTAL_SEGMENTS);

  return (
    <div className={`aidex-loading-overlay ${isDone ? 'fade-out' : ''}`}>
      {/* Background Matrix/Letter Glitch Animation */}
      <div className="aidex-glitch-bg">
        <LetterGlitch
          glitchColors={['#032612', '#00ff80', '#0a4f28', '#1b8a4f']}
          glitchSpeed={60}
          centerVignette={true}
          outerVignette={true}
          smooth={true}
        />
      </div>

      <div className="aidex-loading-container">
        {/* Pill Badge */}
        <div className="aidex-pill-badge">
          <span className="aidex-pill-dot"></span>
          <span>DOOMSDAY_BOOT_SEQUENCE_V.26</span>
        </div>

        {/* Main Title with Glitch Effect */}
        <div className="aidex-title-wrap">
          <h1 className="aidex-glitch-title" data-text="AIDEX'26">
            AIDEX'26
          </h1>
          <div className="aidex-subtitle-row">
            <span className="aidex-subtitle">DOOMSDAY PROTOCOL</span>
            <div className="aidex-square-icon"></div>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="aidex-progress-wrapper">
          <div className="aidex-progress-outer">
            <div className="aidex-progress-track">
              {Array.from({ length: TOTAL_SEGMENTS }).map((_, idx) => (
                <div
                  key={idx}
                  className={`aidex-progress-segment ${idx < activeSegmentsCount ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Status & Percentage Row */}
        <div className="aidex-status-row">
          <div className="aidex-status-left">
            <span className="aidex-telemetry-tag">:: SYSTEM_TELEMETRY ::</span>
            <div className="aidex-split-flap-wrap">
              <SplitFlapText
                words={STATUS_WORDS}
                flipDuration={0.03}
                stagger={0.01}
                cycleDelay={180}
                flipsPerChar={2}
                tileColor="transparent"
                textColor="#00ff80"
                tileRadius={0}
                gap={1}
                fontSize={15}
                loop={false}
                padTo={15}
              />
            </div>
          </div>

          <div className="aidex-percent-text">
            {progress}
            <span className="aidex-percent-symbol">%</span>
          </div>
        </div>
      </div>

      {/* Footer Branding Line */}
      <div className="aidex-footer-info">
        AIDEX'26 // LATVERIAN_AI_NETWORK // VEL TECH MULTI TECH
      </div>
    </div>
  );
}
