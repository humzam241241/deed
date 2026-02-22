import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, ArrowRight, ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    /* 90vh — enough so the Steps section peeks below the fold */
    <section className="bg-white flex flex-col justify-center" style={{ minHeight: '90vh' }}>
      <div className="container mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="flex flex-col md:flex-row items-center gap-10">

          {/* Left — copy */}
          <div className="md:w-1/2 md:pr-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Hyper custom apparel made to stand out
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              The easiest way to create true custom clothing for your team or group.
            </p>

            {/* Audience CTAs */}
            <div className="space-y-4 mb-8">
              <Link
                to="/student-clubs"
                className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 p-5 rounded-xl transition-all group"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">For Student Clubs</h3>
                    <p className="text-sm text-gray-600">Special pricing &amp; fast turnaround</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>

              <Link
                to="/corporate-teams"
                className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 border-2 border-slate-200 p-5 rounded-xl transition-all group"
              >
                <div className="flex items-center">
                  <div className="bg-slate-100 p-3 rounded-lg mr-4">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">For Corporate Teams</h3>
                    <p className="text-sm text-gray-600">Professional quality &amp; bulk pricing</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
            </div>

            {/* Primary CTA — centred on all screens */}
            <div className="flex justify-center md:justify-start">
              <Link
                to="/contact"
                className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
              >
                Start Your Journey
              </Link>
            </div>
          </div>

          {/* Right — image */}
          <div className="md:w-1/2">
            <div className="bg-yellow-100 rounded-2xl p-8 relative overflow-hidden">
              <img
                src="/hero-image.jpg"
                alt="Custom apparel showcase"
                className="w-full h-auto rounded-xl object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400/FEF9C3/333?text=Custom+Apparel';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll-down nudge */}
      <div className="flex justify-center pb-6 animate-bounce">
        <ChevronDown className="w-7 h-7 text-gray-400" />
      </div>
    </section>
  );
}
