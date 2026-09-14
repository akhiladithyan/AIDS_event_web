"use client";
import React, { useState, useEffect } from 'react';
import Header from '@/components/sections/header';
import MobileNav from '@/components/sections/MobileNav';
import Footer from '@/components/sections/footer';
import GalleryIntro from '@/components/gallery/GalleryIntro';
import { ImageTrail } from '@/components/ui/image-trail';

const galleryImages = [
  "/esperanza'25 images/SDS_0814.jpg",
  "/esperanza'25 images/SDS_0860.jpg",
  "/esperanza'25 images/SDS_0905.jpg",
  "/esperanza'25 images/SDS_0913.jpg",
  "/esperanza'25 images/SDS_0967.jpg",
  "/esperanza'25 images/SDS_1185.jpg",
  "/esperanza'25 images/SDS_1220.jpg",
  "/esperanza'25 images/SDS_1263.jpg",
  "/esperanza'25 images/SDS_1266.jpg",
  "/esperanza'25 images/SDS_1335.jpg",
  "/esperanza'25 images/SDS_1375.jpg",
  "/esperanza'25 images/SDS_1376.jpg",
  "/esperanza'25 images/SDS_1786.jpg",
  "/esperanza'25 images/SDS_1790.jpg",
  "/esperanza'25 images/SDS_1810.jpg",
  "/esperanza'25 images/SDS_1811.jpg",
  "/esperanza'25 images/SDS_1839.jpg",
  "/esperanza'25 images/SDS_1855.jpg",
  "/esperanza'25 images/SDS_1858.jpg",
  "/esperanza'25 images/SDS_1874.jpg",
  "/esperanza'25 images/SDS_1879.jpg",
  "/esperanza'25 images/SDS_1888.jpg",
  "/esperanza'25 images/SDS_1925.jpg"
];

export default function GalleryPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#050806] text-foreground overflow-hidden">
      <MobileNav />
      <Header />
      <div className="relative w-full h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-40">
          <ImageTrail
            images={galleryImages}
            threshold={isMobile ? 50 : 80}
            imageWidth={isMobile ? 180 : 320}
            imageHeight={isMobile ? 220 : 350}
          />
        </div>
        <div className="relative z-10 pointer-events-none">
          <GalleryIntro />
        </div>
      </div>
      <Footer />
    </main>
  );
}
