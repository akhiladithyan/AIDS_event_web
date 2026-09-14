import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 350;

const createParticleElement = (x, y, color = '239, 74, 64') => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 8px rgba(${color}, 0.8);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

export const ParticleCard = ({
  children,
  className = '',
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = '239, 74, 64',
  enableTilt = true,
  clickEffect = true
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const spawnParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    initializeParticles();
    const card = cardRef.current;

    memoizedParticles.current.forEach((particle, index) => {
      const timeout = setTimeout(() => {
        if (!isHoveredRef.current) return;

        const clone = particle.cloneNode(true);
        card.appendChild(clone);
        particlesRef.current.push(clone);

        const currentX = parseFloat(clone.style.left);
        const currentY = parseFloat(clone.style.top);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: 'back.out(1.7)'
          }
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 60,
          y: (Math.random() - 0.5) * 60,
          opacity: 0,
          scale: 0,
          duration: 1.5 + Math.random() * 0.5,
          ease: 'power2.out',
          onComplete: () => {
            clone.parentNode?.removeChild(clone);
            particlesRef.current = particlesRef.current.filter(p => p !== clone);
          }
        });
      }, index * 100);

      timeoutsRef.current.push(timeout);
    });
  }, [initializeParticles]);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    spawnParticles();
  }, [spawnParticles]);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    clearAllParticles();

    if (cardRef.current) {
      cardRef.current.style.setProperty('--glow-intensity', '0');
      if (enableTilt) {
        gsap.to(cardRef.current, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    }
  }, [clearAllParticles, enableTilt]);

  const handleMouseMove = useCallback(
    e => {
      if (!cardRef.current) return;

      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      updateCardGlowProperties(card, mouseX, mouseY, 0.8, DEFAULT_SPOTLIGHT_RADIUS);

      if (enableTilt) {
        const relativeX = (mouseX - rect.left) / rect.width - 0.5;
        const relativeY = (mouseY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
          rotateY: relativeX * 10,
          rotateX: -relativeY * 10,
          duration: 0.2,
          ease: 'power1.out'
        });
      }
    },
    [enableTilt]
  );

  const handleClick = useCallback(
    e => {
      if (!clickEffect || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      ripple.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(${glowColor}, 0.4);
        transform: translate(-50%, -50%) scale(0);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 99;
      `;

      cardRef.current.appendChild(ripple);

      gsap.to(ripple, {
        scale: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          ripple.parentNode?.removeChild(ripple);
        }
      });
    },
    [clickEffect, glowColor]
  );

  useEffect(() => {
    return () => {
      clearAllParticles();
    };
  }, [clearAllParticles]);

  return (
    <div
      ref={cardRef}
      className={`particle-card ${className}`}
      style={{
        '--glow-color': glowColor,
        ...style
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

export default ParticleCard;
