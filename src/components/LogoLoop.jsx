import React from 'react';
import './LogoLoop.css';

const DEFAULT_LOGOS = [
  { name: 'React', src: '/logo-loop-images/react.jpg', color: '#61dafb' },
  { name: 'JavaScript', src: '/logo-loop-images/js.jpg', color: '#f7df1e' },
  { name: 'CSS3', src: '/logo-loop-images/css.jpg', color: '#38bdf8' },
  { name: 'HTML5', src: '/logo-loop-images/html.jpg', color: '#e34f26' },
  { name: 'GitHub', src: '/logo-loop-images/git-hub.jpg', color: '#ffffff' },
  { name: 'Supabase', src: '/logo-loop-images/supabase.png', color: '#3ecf8e' }
];

export default function LogoLoop({
  logos = DEFAULT_LOGOS,
  speed = 25,
  direction = 'left',
  pauseOnHover = true,
  glowColor = 'rgba(28, 230, 4, 0.4)'
}) {
  // Duplicate logos 4x to guarantee smooth infinite looping without gaps
  const quadruplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <div
      className={`logo-loop-container ${pauseOnHover ? 'pause-on-hover' : ''}`}
      style={{
        '--speed': `${speed}s`,
        '--direction': direction === 'left' ? 'normal' : 'reverse',
        '--glow-color': glowColor
      }}
    >
      <div className="logo-loop-track">
        {quadruplicatedLogos.map((item, index) => {
          const IconComp = item.icon;
          return (
            <div key={index} className="logo-loop-item" title={item.name}>
              <div className="logo-loop-img-wrap">
                {item.src ? (
                  <img
                    src={item.src}
                    alt={item.name}
                    className="logo-loop-img"
                  />
                ) : IconComp ? (
                  <IconComp size={28} style={{ color: item.color || '#1ce604' }} />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
