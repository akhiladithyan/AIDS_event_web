import React from 'react';
import './ShinyText.css';

export default function ShinyText({
  text = '',
  color = '#1ce604',
  shineColor = '#ffffff',
  speed = 3.5,
  spread = 120,
  className = '',
  style = {}
}) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    animationDuration: `${speed}s`,
    ...style
  };

  return (
    <span className={`shiny-text ${className}`} style={gradientStyle}>
      {text}
    </span>
  );
}
