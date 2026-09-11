import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './PillButton.css';

const PillButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'active' | 'custom'
  className = '',
  style = {},
  disabled = false,
  ease = 'power3.easeOut',
  hoverCircleColor,
  hoverTextColor = '#ffffff',
  as: Component = 'button',
  ...props
}) => {
  const buttonRef = useRef(null);
  const circleRef = useRef(null);
  const tlRef = useRef(null);
  const activeTweenRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      const btn = buttonRef.current;
      const circle = circleRef.current;
      if (!btn || !circle) return;

      const rect = btn.getBoundingClientRect();
      const { width: w, height: h } = rect;
      if (!w || !h) return;

      // Mathematical GSAP circle arc fitting formula from PillNav
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`
      });

      const label = btn.querySelector('.pill-label-default');
      const white = btn.querySelector('.pill-label-hover');

      if (label) gsap.set(label, { y: 0 });
      if (white) gsap.set(white, { y: h + 12, opacity: 0 });

      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });

      tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.45, ease, overwrite: 'auto' }, 0);

      if (label) {
        tl.to(label, { y: -(h + 8), duration: 0.45, ease, overwrite: 'auto' }, 0);
      }

      if (white) {
        gsap.set(white, { y: Math.ceil(h + 20), opacity: 0 });
        tl.to(white, { y: 0, opacity: 1, duration: 0.45, ease, overwrite: 'auto' }, 0);
      }

      tlRef.current = tl;
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => {
      window.removeEventListener('resize', onResize);
      tlRef.current?.kill();
      activeTweenRef.current?.kill();
    };
  }, [children, ease, variant]);

  const handleMouseEnter = () => {
    if (disabled) return;
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(tl.duration(), {
      duration: 0.35,
      ease,
      overwrite: 'auto'
    });
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(0, {
      duration: 0.25,
      ease,
      overwrite: 'auto'
    });
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'pill-btn-primary';
      case 'secondary': return 'pill-btn-secondary';
      case 'danger': return 'pill-btn-danger';
      case 'active': return 'pill-btn-active';
      default: return '';
    }
  };

  const customVars = {
    '--hover-text': hoverTextColor,
    ...(hoverCircleColor ? { '--circle-bg': hoverCircleColor } : {}),
    ...style
  };

  return (
    <Component
      ref={buttonRef}
      type={Component === 'button' ? type : undefined}
      className={`pill-btn ${getVariantClass()} ${disabled ? 'is-disabled' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={customVars}
      disabled={disabled}
      {...props}
    >
      <span ref={circleRef} className="pill-circle" aria-hidden="true" />
      <span className="pill-label-stack">
        <span className="pill-label-default">{children}</span>
        <span className="pill-label-hover" aria-hidden="true">{children}</span>
      </span>
    </Component>
  );
};

export default PillButton;
