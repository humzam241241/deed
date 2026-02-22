import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, ArrowRight, ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    /* Compact hero — leaves ~30 vh visible so the next section peeks clearly */
    <section className="bg-white flex flex-col">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">

          {/* ── Left copy ───────────────────────────────────────────── */}
          <div className="md:w-1/2 text-center md:text-left">

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              Hyper custom apparel made&nbsp;to&nbsp;stand&nbsp;out
            </h1>

            <p className="text-base text-gray-600 mb-5">
              The easiest way to create true custom clothing for your team or group.
            </p>

            {/* Audience CTAs — tighter padding */}
            <div className="space-y-3 mb-5">
              <Link
                to="/student-clubs"
                className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50
                           hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200
                           p-3 rounded-xl transition-all group"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3 flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm md:text-base">For Student Clubs</h3>
                    <p className="text-xs text-gray-500">Special pricing &amp; fast turnaround</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>

              <Link
                to="/corporate-teams"
                className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50
                           hover:from-slate-100 hover:to-blue-100 border-2 border-slate-200
                           p-3 rounded-xl transition-all group"
              >
                <div className="flex items-center">
                  <div className="bg-slate-100 p-2 rounded-lg mr-3 flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm md:text-base">For Corporate Teams</h3>
                    <p className="text-xs text-gray-500">Professional quality &amp; bulk pricing</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
            </div>

            {/* Primary CTA */}
            <div className="flex justify-center md:justify-start">
              <Link
                to="/contact"
                className="px-7 py-3 bg-primary text-white rounded-xl hover:bg-primary/90
                           transition-colors font-semibold text-base shadow-md hover:shadow-lg"
              >
                Start Your Journey
              </Link>
            </div>
          </div>

          {/* ── Right image ─────────────────────────────────────────── */}
          <div className="md:w-1/2">
            <div className="bg-yellow-100 rounded-2xl p-4 overflow-hidden">
              <img
                src="/hero-image.jpg"
                alt="Custom apparel showcase"
                className="w-full h-auto rounded-xl object-cover max-h-72 md:max-h-80 object-center"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400/FEF9C3/333?text=Custom+Apparel';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll nudge — click snaps instantly to the next section */}
      <button
        onClick={() => {
          const next = document.querySelector('section + section, section ~ section');
          if (next) next.scrollIntoView({ behavior: 'instant' });
        }}
        className="flex justify-center pb-4 w-full animate-bounce cursor-pointer bg-transparent border-0 outline-none focus:outline-none"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-6 h-6 text-gray-400 hover:text-primary transition-colors" />
      </button>
    </section>
  );
}
