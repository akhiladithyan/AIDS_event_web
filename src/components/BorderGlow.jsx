import React, { useRef, useState } from 'react';
import './BorderGlow.css';

export default function BorderGlow({
  children,
  className = '',
  glowColor = '#1ce604',
  glowRadius = 250,
  glowOpacity = 0.8,
  borderWidth = 1.5,
  borderRadius = 28,
  animated = true,
  style = {}
}) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setOpacity(glowOpacity);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`border-glow-wrapper ${animated ? 'border-glow-animated' : ''} ${className}`}
      style={{
        '--mouse-x': `${position.x}px`,
        '--mouse-y': `${position.y}px`,
        '--glow-color': glowColor,
        '--glow-radius': `${glowRadius}px`,
        '--glow-opacity': opacity,
        '--border-width': `${borderWidth}px`,
        '--border-radius': `${borderRadius}px`,
        ...style
      }}
    >
      {/* Outer Glow Mask Border */}
      <div className="border-glow-border" />
      
      {/* Card Content Container */}
      <div className="border-glow-content">
        {children}
      </div>
    </div>
  );
}
