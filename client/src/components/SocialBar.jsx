import React from 'react';
import { Instagram, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import socialsData from '../data/socials.json';

export default function SocialBar() {
  // Map platform names to Lucide React icons
  const iconMap = {
    Instagram: Instagram,
    LinkedIn: Linkedin,
    Twitter: Twitter,
    TikTok: () => (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
        <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M15 8v8c0 1 .53 2 2 2" />
        <path d="M9 12V4" />
      </svg>
    )
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Follow Our Journey
        </h2>
        <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
          See our latest projects, behind-the-scenes content, and customer stories on social media
        </p>
        
        {/* Instagram Embed */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">@apparelbrand</h3>
                    <p className="text-gray-600 text-sm">Latest from Instagram</p>
                  </div>
                </div>
                <a 
                  href="https://instagram.com/apparelbrand" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Follow
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
            
            {/* Instagram feed grid mockup */}
            <div className="grid grid-cols-3 gap-1 p-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
                  <img 
                    src={`https://placehold.co/400x400/e2e8f0/64748b?text=Post+${i}`}
                    alt={`Instagram post ${i}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
            
            <div className="p-6 text-center bg-gray-50">
              <p className="text-gray-600 mb-4">
                Tag us in your photos with <span className="font-semibold text-primary">#ApparelBrand</span> for a chance to be featured!
              </p>
            </div>
          </div>
        </div>
        
        {/* Social platforms grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {socialsData.map((social) => {
            const IconComponent = iconMap[social.platform] || iconMap.Instagram;
            
            return (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{social.platform}</h3>
                <p className="text-gray-600 text-sm">{social.handle}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
