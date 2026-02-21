import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Palette, Package } from 'lucide-react';

export default function MeetingStrip() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="bg-blue-50 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-6 md:mb-0">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-full p-3 shadow-sm">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-medium">Book a Meeting</span>
                </div>
                
                <div className="hidden md:block w-8 h-px md:w-px md:h-8 bg-blue-200 mx-2"></div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-full p-3 shadow-sm">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-medium">Design your Dream</span>
                </div>
                
                <div className="hidden md:block w-8 h-px md:w-px md:h-8 bg-blue-200 mx-2"></div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-full p-3 shadow-sm">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-medium">Get it Delivered</span>
                </div>
              </div>
            </div>
            
            <div className="md:ml-8">
              <Link 
                to="/contact" 
                className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Your Journey
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
