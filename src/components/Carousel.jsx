import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Carousel.css';

const Carousel = ({ children, initialIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);

  const items = React.Children.toArray(children);
  const count = items.length;

  // Minimum swipe distance (in px)
  const minSwipeDistance = 40;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % count);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + count) % count);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div className="react-bits-carousel-wrapper">
      <div 
        className="react-bits-carousel-container"
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="react-bits-carousel-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div 
              key={index} 
              className={`react-bits-carousel-slide ${index === activeIndex ? 'active' : ''}`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls & Pagination */}
      <div className="react-bits-carousel-controls">
        <button 
          className="react-bits-carousel-btn" 
          onClick={prevSlide}
          aria-label="Previous Prize Card"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="react-bits-carousel-dots">
          {items.map((_, index) => (
            <button
              key={index}
              className={`react-bits-carousel-dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button 
          className="react-bits-carousel-btn" 
          onClick={nextSlide}
          aria-label="Next Prize Card"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
