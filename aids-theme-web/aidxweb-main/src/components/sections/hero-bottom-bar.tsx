"use client";

import React from 'react';
import Image from 'next/image';

/**
 * HeroBottomBar component - Replicates the black status bar at the bottom of the hero section.
 * Contains event dates, promotional keywords (ENGAGE, ENTHRAL, ENTERTAIN), and social links.
 */
const HeroBottomBar: React.FC = () => {
  // Social media links for Vel Tech Multi Tech
  const socialLinks = [
    {
      href: "https://www.youtube.com/@VELTECHMULTITECHENGINEERINGCOL",
      alt: "YouTube Logo",
      src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/svgs/YouTube_1559edc1-4.svg"
    },
    {
      href: "https://www.instagram.com/veltech_multitech1999/",
      alt: "Instagram - Vel Tech Multi Tech",
      src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/svgs/Instagram_47ba4f0b-3.svg"
    },
    {
      href: "https://www.instagram.com/aidsevents_club?igsh=MWVtYmgxNTRvY2tmMg==",
      alt: "Instagram - AI&DS Events Club",
      src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/94edbd09-30bd-4628-aeb9-93e9fb6900f8-vitvibrance-com/assets/svgs/Instagram_47ba4f0b-3.svg"
    }
  ];

  return (
    <div className="bottom-bar absolute bottom-0 left-0 flex w-full items-center justify-around bg-black py-[2.5rem] font-powerGrotesk font-extralight tracking-wider text-white sm:flex-col sm:gap-y-5 sm:px-3 sm:text-2xl md:px-10 md:text-2xl lg:px-20 lg:text-4xl z-50">
      {/* Desktop/Tablet Layout: Horizontal sequence */}
      <div className="hidden sm:inline md:hidden lg:hidden">
        {/* Mobile View logic handled via flex-col above, but preserving structure */}
      </div>

      {/* Standard Display for MD and LG screens */}
      <div className="hidden md:block">7 OCT</div>
      <div className="hidden md:block">|</div>
      <div className="hidden md:block">ENGAGE</div>
      <div className="hidden md:block">ENTHRAL</div>
      <div className="hidden md:block">ENTERTAIN</div>
      <div className="hidden md:block">|</div>

      {/* Mobile-only promotional keywords row */}
      <div className="flex w-full justify-between md:hidden lg:hidden">
        <div>ENGAGE</div>
        <div>ENTHRAL</div>
        <div>ENTERTAIN</div>
      </div>

      {/* Social Icons and Mobile Date */}
      <div className="flex w-full items-center justify-between md:w-auto md:justify-center">
        {/* Date visible on Mobile only within this row */}
        <div className="md:hidden lg:hidden">7 OCT</div>

        {/* Social Icons Cluster */}
        <div className="flex items-center justify-center gap-x-3 lg:gap-x-4">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform duration-300 hover:scale-110"
            >
              <Image
                alt={social.alt}
                width={56}
                height={56}
                className="w-auto h-7 md:h-7 lg:h-[2rem]"
                src={social.src}
              />
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HeroBottomBar;