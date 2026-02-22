import React, { useEffect } from 'react';
import { Instagram, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import socialsData from '../data/socials.json';

// ── Update this to your real Instagram handle ──────────────────────────────
const IG_HANDLE  = 'apparelbrand';          // e.g. "deedapparel"
const IG_URL     = `https://www.instagram.com/${IG_HANDLE}/`;
// ──────────────────────────────────────────────────────────────────────────

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M15 8v8c0 1 .53 2 2 2" />
    <path d="M9 12V4" />
  </svg>
);

const iconMap = {
  Instagram,
  LinkedIn: Linkedin,
  Twitter,
  TikTok: TikTokIcon,
};

export default function SocialBar() {
  /* Load Instagram's oEmbed embed.js once so any blockquote embeds render */
  useEffect(() => {
    if (document.getElementById('ig-embed-script')) return;
    const s = document.createElement('script');
    s.id  = 'ig-embed-script';
    s.src = 'https://www.instagram.com/embed.js';
    s.async = true;
    document.body.appendChild(s);
    return () => { /* leave script in DOM — safe to keep */ };
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Follow Our Journey
        </h2>
        <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
          See our latest projects, behind-the-scenes content, and customer stories
          on social media.
        </p>

        {/* ── Instagram embed card ─────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto mb-14">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

            {/* Header bar */}
            <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">@{IG_HANDLE}</p>
                  <p className="text-gray-500 text-sm">Instagram</p>
                </div>
              </div>
              <a
                href={IG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white
                           bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
              >
                Follow
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Instagram oEmbed — paste a real post URL inside data-permalink to show live content.
                The embed.js script loaded above will hydrate this blockquote automatically. */}
            <div className="p-4 flex justify-center bg-white min-h-[220px] items-center">
              <blockquote
                className="instagram-media w-full"
                data-instgrm-captioned
                data-instgrm-permalink={IG_URL}
                data-instgrm-version="14"
                style={{
                  background: '#FFF',
                  border: '0',
                  borderRadius: '3px',
                  boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                  margin: '1px',
                  maxWidth: '540px',
                  minWidth: '326px',
                  padding: '0',
                  width: '99.375%',
                }}
              />
            </div>

            <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-600">
              Tag us with{' '}
              <span className="font-semibold text-primary">#DeedApparel</span>{' '}
              for a chance to be featured!
            </div>
          </div>
        </div>

        {/* ── Social platform links ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {socialsData.map((social) => {
            const Icon = iconMap[social.platform] || Instagram;
            return (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-4 flex flex-col items-center text-center
                           hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3
                                group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1 text-sm">{social.platform}</h3>
                <p className="text-gray-500 text-xs">{social.handle}</p>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
