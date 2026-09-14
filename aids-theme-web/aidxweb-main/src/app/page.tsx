"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/sections/header";
import MobileNav from "@/components/sections/MobileNav";
import HeroSection from "@/components/sections/hero";
import IntroTextSection from "@/components/sections/intro-text";
import VenueSection from "@/components/sections/venue";
import GlimpsesSection from "@/components/sections/glimpses";
import DepartmentShowcase from "@/components/sections/department-showcase";
import Footer from "@/components/sections/footer";
import Loader from "@/components/ui/loader";
import FAQSection from "@/components/sections/faq";
import AboutSection from "@/components/sections/about";
import ContactSection from "@/components/sections/contact";
import { TicketPortal } from "@/components/admin/TicketPortal";
import { FloatingRegisterButton } from "@/components/ui/FloatingRegisterButton";
import config from "@/config";
import { safeJsonResponse } from "@/lib/utils";
import { Content } from "@/types/admin";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showTicketPortal, setShowTicketPortal] = useState(false);
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    // Fetch content (prices, upi, etc.)
    const fetchContent = async () => {
      try {
        const res = await fetch(`${config.API_URL}/content`);
        const data = await safeJsonResponse(res);
        if (data && data.success) {
          setContent(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch content", error);
      }
    };
    fetchContent();
  }, []);

  const router = useRouter();

  const handleRegisterClick = () => {
    router.push('/events');
  };

  return (
    <>
      <Loader onLoadingComplete={() => setIsLoading(false)} />
      <main
        className="relative min-h-screen bg-[#050806] text-foreground font-orbitron"
        style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}
      >
        <div className="absolute inset-0 z-0 bg-fixed bg-center bg-no-repeat bg-cover pointer-events-none" />
        <MobileNav onRegister={handleRegisterClick} />
        <Header onRegister={handleRegisterClick} />
        <HeroSection />
        <AboutSection />
        <IntroTextSection />
        <VenueSection />
        <GlimpsesSection />
        <DepartmentShowcase />
        <FAQSection />
        <ContactSection />
        <Footer />

        {showTicketPortal && content && (
          <TicketPortal
            prices={content.ticketPrices}
            upiId={content.upiId}
            qrCodeUrl={content.qrCodeUrl}
            onClose={() => setShowTicketPortal(false)}
          />
        )}
        <FloatingRegisterButton />
      </main>
    </>
  );
}