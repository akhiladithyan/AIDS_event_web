import React from 'react';
import './GradientText.css';

export default function GradientText({
  children,
  className = '',
  colors = ['#84CC16', '#206419', '#8acc21'],
  animationSpeed = 6,
  showBorder = false,
  direction = 'horizontal',
  pauseOnHover = false,
  style = {}
}) {
  const gradientAngle =
    direction === 'horizontal' ? 'to right' : direction === 'vertical' ? 'to bottom' : 'to bottom right';

  const gradientColors = [...colors, colors[0]].join(', ');

  const gradientStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize: direction === 'horizontal' ? '300% 100%' : direction === 'vertical' ? '100% 300%' : '300% 300%',
    animationDuration: `${animationSpeed}s`,
    ...style
  };

  return (
    <div
      className={`animated-gradient-text ${showBorder ? 'with-border' : ''} ${pauseOnHover ? 'pause-on-hover' : ''} ${className}`}
    >
      {showBorder && <div className="gradient-overlay" style={gradientStyle} />}
      <div className="text-content" style={gradientStyle}>
        {children}
      </div>
    </div>
  );
}
