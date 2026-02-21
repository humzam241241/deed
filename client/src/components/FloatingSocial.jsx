import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';
import socialsData from '../data/socials.json';

export default function FloatingSocial() {
  // Map platform names to Lucide React icons
  const iconMap = {
    Instagram: Instagram,
    LinkedIn: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    Twitter: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
    TikTok: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
        <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M15 8v8c0 1 .53 2 2 2" />
        <path d="M9 12V4" />
      </svg>
    )
  };

  return (
    <div className="fixed left-6 bottom-6 z-30 hidden lg:flex flex-col gap-3">
      {socialsData.slice(0, 3).map((social) => {
        const IconComponent = iconMap[social.platform] || iconMap.Instagram;
        
        return (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-gray-700 rounded-full p-3 shadow-lg hover:bg-primary hover:text-white transition-all hover:scale-110"
            aria-label={`Follow us on ${social.platform}`}
            title={`${social.platform}: ${social.handle}`}
          >
            <IconComponent className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
}
