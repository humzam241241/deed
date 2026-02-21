import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Hyper custom apparel made to stand out
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              The easiest way to create true custom clothing for your team or group.
            </p>
            
            {/* Audience Split CTAs */}
            <div className="space-y-4 mb-8">
              <Link 
                to="/student-clubs" 
                className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 p-5 rounded-xl transition-all group"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">For Student Clubs</h3>
                    <p className="text-sm text-gray-600">Special pricing & fast turnaround</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/corporate-teams" 
                className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 border-2 border-slate-200 p-5 rounded-xl transition-all group"
              >
                <div className="flex items-center">
                  <div className="bg-slate-100 p-3 rounded-lg mr-4">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">For Corporate Teams</h3>
                    <p className="text-sm text-gray-600">Professional quality & bulk pricing</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/design-studio" 
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Try Design Studio
              </Link>
              <Link 
                to="/products" 
                className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
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
    </section>
  );
}
