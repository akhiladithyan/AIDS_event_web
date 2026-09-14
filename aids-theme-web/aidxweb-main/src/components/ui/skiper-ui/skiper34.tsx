"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import ReactLenis from "lenis/react";
import { useEffect, useRef, useState } from "react";

interface Skiper34Props {
  images: { src: string; title: string; category: string }[];
}

const Skiper34 = ({ images }: Skiper34Props) => {
  return (
    <ReactLenis root>
      <section className="relative flex w-full flex-col items-center gap-[10vh] px-4 py-[10vh]">

        {images.map((img, idx) => (
          <StickyCard_003 key={idx} imgUrl={img.src} />
        ))}
      </section>
    </ReactLenis>
  );
};

const StickyCard_003 = ({ imgUrl }: { imgUrl: string }) => {
  const vertMargin = 10;
  const container = useRef(null);
  const [maxScrollY, setMaxScrollY] = useState(Infinity);

  const filter = useMotionValue(0);
  const negateFilter = useTransform(filter, (value) => -value);

  const { scrollY } = useScroll({
    target: container,
    offset: ["start end", "end start"]
  });
  
  // Adjusted scroll range for smoother effect
  const scale = useTransform(scrollY, [maxScrollY, maxScrollY + 2000], [1, 0.5]);
  
  const isInView = useInView(container, {
    margin: `0px 0px -${100 - vertMargin}% 0px`,
    once: true,
  });

  scrollY.on("change", (scrollY) => {
    let animationValue = 1;
    // Simple logic check - this might need tuning based on actual scroll behavior
    if (scrollY > maxScrollY) {
      animationValue = Math.max(0, 1 - (scrollY - maxScrollY) / 10000);
    }
    // We are relying on useTransform for visuals mostly
  });

  useEffect(() => {
    if (isInView) {
      setMaxScrollY(scrollY.get());
    }
  }, [isInView, scrollY]); // Added scrollY dependency

  return (
    <motion.div
      ref={container}
      className="rounded-xl md:rounded-3xl sticky w-full max-w-[95vw] md:max-w-5xl overflow-hidden bg-neutral-900 border-2 border-zinc-800 shadow-2xl"
      style={{
        scale: scale,
        rotate: filter,
        height: `${100 - 2 * vertMargin}vh`,
        maxHeight: "800px", // Cap max height for ultra large screens
        top: `12vh`, // Balanced top margin
      }}
    >
      <motion.img
        src={imgUrl}
        alt="Gallery Image"
        style={{
          rotate: negateFilter,
        }}
        className="h-full w-full object-cover"
        sizes="90vw"
      />
    </motion.div>
  );
};

export { Skiper34, StickyCard_003 };

/**
 * Skiper 34 StickyCard_003 — React + framer motion + lenis
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Feedback and contributions are welcome.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.in
 * Twitter: https://x.com/Gur__vi
 */
