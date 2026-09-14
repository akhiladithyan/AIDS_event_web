"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, ShieldAlert } from "lucide-react";
import config from "@/config";
import { safeJsonResponse } from "@/lib/utils";

const defaultImages = [
    "/glimpses/5.png",
];

const MarqueeItem = ({ src, index }: { src: string, index: number }) => {
    return (
        <div className="relative w-[300px] h-[200px] flex-shrink-0 mx-3 rounded-xl overflow-hidden border border-[#39ff88]/20 bg-[#08100b] group cursor-pointer skew-x-[-4deg] hover:skew-x-0 hover:border-[#39ff88]/80 hover:shadow-[0_0_25px_rgba(57,255,136,0.25)] transition-all duration-300">
            <Image
                src={src}
                alt={`Classified Archive ${index}`}
                fill
                className="object-cover scale-105 group-hover:scale-115 transition-transform duration-500 filter brightness-90 contrast-110 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                <span className="text-[#39ff88] font-mono font-bold text-xs tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-ping"></span>
                    ARCHIVE_DATA // SEC-00{index + 1}
                </span>
            </div>
            {/* Tech Corner Overlay */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#050806]/80 border border-[#39ff88]/30 text-[9px] font-mono text-[#bfc8c3]/80">
                REC
            </div>
        </div>
    );
};

const GlimpsesSection = () => {
    const [images, setImages] = React.useState(defaultImages);

    React.useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch(`${config.API_URL}/content`);
                const data = await safeJsonResponse(res);
                if (data && data.success && data.data?.galleryImages && data.data.galleryImages.length > 0) {
                    const validImages = data.data.galleryImages
                        .filter((img: any) => img.type !== 'video' && !img.url.match(/\.(mp4|webm|ogg)$/i))
                        .map((img: any) => img.url);

                    if (validImages.length > 0) setImages(validImages);
                }
            } catch (error) {
                console.error("Failed to fetch glimpses", error);
            }
        };

        fetchImages();
    }, []);

    // Create duplicate arrays for seamless looping
    const marqueeRow1 = [...images, ...images, ...images];
    const marqueeRow2 = [...images, ...images, ...images].reverse();

    return (
        <section id="glimpses" className="relative w-full py-24 bg-[#050806] overflow-hidden border-t border-[#39ff88]/10">
            {/* Background Grid */}
            <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(57, 255, 136, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 136, 0.15) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            ></div>

            <div className="container mx-auto px-4 relative z-10 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#39ff88]/30 bg-[#39ff88]/10 mb-4 text-[#39ff88] text-xs font-mono uppercase tracking-widest">
                        <Eye className="w-3.5 h-3.5" /> SURVEILLANCE FEED
                    </div>
                    <div className="relative group inline-block mb-3">
                        <h2 className="text-3xl md:text-5xl font-black font-orbitron uppercase text-white tracking-wider relative z-10 drop-shadow-[0_0_25px_rgba(57,255,136,0.3)]">
                            CLASSIFIED ARCHIVES
                        </h2>
                    </div>
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#39ff88] to-transparent mx-auto rounded-full" />
                    <p className="mt-3 text-[#bfc8c3]/60 font-rajdhani font-semibold uppercase tracking-widest text-xs md:text-sm">
                        VISUAL LOGS & INTELLIGENCE RECONNAISSANCE
                    </p>
                </motion.div>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full flex flex-col gap-8 -skew-y-1">

                {/* Row 1 */}
                <div className="relative w-full overflow-hidden flex">
                    <motion.div
                        className="flex items-center"
                        animate={{ x: "-50%" }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 30,
                        }}
                        style={{ width: "max-content" }}
                    >
                        {marqueeRow1.map((src, index) => (
                            <MarqueeItem key={`row1-${index}`} src={src} index={index} />
                        ))}
                    </motion.div>
                </div>

                {/* Row 2: Opposite Direction */}
                <div className="relative w-full overflow-hidden flex">
                    <motion.div
                        className="flex items-center"
                        initial={{ x: "-50%" }}
                        animate={{ x: "0%" }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 30,
                        }}
                        style={{ width: "max-content" }}
                    >
                        {marqueeRow2.map((src, index) => (
                            <MarqueeItem key={`row2-${index}`} src={src} index={index} />
                        ))}
                    </motion.div>
                </div>

            </div>

            <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-[#050806] via-[#050806]/80 to-transparent z-20 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-36 bg-gradient-to-l from-[#050806] via-[#050806]/80 to-transparent z-20 pointer-events-none"></div>

        </section>
    );
};

export default GlimpsesSection;
