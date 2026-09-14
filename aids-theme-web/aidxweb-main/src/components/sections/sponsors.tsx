"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { InfiniteRibbon } from "../ui/infinite-ribbon";
import { ShieldCheck, Zap } from "lucide-react";

const marqueeItems = [
  "STRATEGIC_ALLIANCE", "TACTICAL_PARTNERS", "CYBER_SECURITY", "NEURAL_CORE", "AI_INTELLIGENCE",
  "DOOMSDAY_PROTOCOL", "QUANTUM_NETWORK", "VEL_TECH", "AIDEX'26", "INNOVATION_CORP",
  "DEFENSE_SYSTEMS", "GLOBAL_UPLINK", "HIGH_COMMAND", "CLASSIFIED_INTEL", "CYBERPUNK"
];

const Sponsors = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const sponsorsRef = useRef(null);

  const isTitleInView = useInView(titleRef, { once: true, amount: 0.5 });
  const isSponsorsInView = useInView(sponsorsRef, { once: true, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const sponsorY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <div className="my-8 min-h-screen w-full overflow-hidden bg-[#050806]" id="sponsors">
      <InfiniteRibbon words={marqueeItems} />

      <section ref={sectionRef} className="pb-[2rem] pt-[4rem] md:pt-[6rem] px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#39ff88]/30 bg-[#39ff88]/10 mb-4 text-[#39ff88] text-xs font-mono uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" /> SYNDICATE NETWORK
          </div>
          
          <motion.h2
            ref={titleRef}
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={isTitleInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-gradient-to-b from-white via-[#bfc8c3] to-[#39ff88] bg-clip-text text-transparent flex justify-center text-center font-orbitron text-3xl md:text-5xl lg:text-6xl font-black mb-3 tracking-wider uppercase drop-shadow-[0_0_30px_rgba(57,255,136,0.25)]"
          >
            STRATEGIC ALLIANCES
          </motion.h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#39ff88] to-transparent mx-auto"></div>
        </div>

        <motion.section
          style={{ y: sponsorY }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isTitleInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center justify-center py-[1rem] font-orbitron text-white"
        >
          <h3 className="text-xs md:text-base lg:text-xl font-bold tracking-widest mb-6 text-[#39ff88] uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse"></span>
            PRIME APEX PARTNER
          </h3>
          <motion.div
            className="fade-image px-4 md:px-8 py-4 flex items-center justify-center"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-48 md:w-64 lg:w-80 h-40 md:h-52 lg:h-64 rounded-2xl border-2 border-dashed border-[#39ff88]/40 bg-[#0b1510]/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 shadow-[0_0_30px_rgba(57,255,136,0.1)] hover:border-[#39ff88] transition-all">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-[#39ff88]" />
              </motion.div>
              <p className="text-[#bfc8c3] font-mono font-bold text-xs md:text-sm lg:text-base uppercase tracking-widest">TRANSMISSION_PENDING</p>
            </div>
          </motion.div>
        </motion.section>

        <section ref={sponsorsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 md:mt-12">
          {[
            { title: "INTELLIGENCE NETWORK" },
            { title: "DEFENSE BROADCAST" },
            { title: "FREQUENCY ALLIANCE" },
          ].map((sponsor, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 60, filter: "blur(8px)" }}
              animate={isSponsorsInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center justify-center p-6 bg-[#0b1510]/60 border border-[#39ff88]/20 rounded-xl hover:border-[#39ff88]/50 transition-all font-orbitron text-white"
            >
              <h4 className="pb-4 text-xs md:text-sm font-bold tracking-widest text-[#39ff88] uppercase">{sponsor.title}</h4>
              <motion.div
                className="w-full h-32 md:h-40 rounded-xl border-2 border-dashed border-[#39ff88]/30 bg-[#08100b]/80 flex flex-col items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3,
                  }}
                >
                  <Zap className="w-8 h-8 text-[#39ff88]/70" />
                </motion.div>
                <p className="text-[#bfc8c3]/70 font-mono font-semibold text-xs tracking-wider">CLASSIFIED</p>
              </motion.div>
            </motion.section>
          ))}
        </section>

      </section>
    </div>
  );
};

export default Sponsors;