import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Palette, Package } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Calendar,
    title: 'Book a Meeting',
    desc: 'Chat with our team and tell us your vision.',
  },
  {
    number: '02',
    icon: Palette,
    title: 'Design your Dream',
    desc: 'We bring your ideas to life with pro artwork.',
  },
  {
    number: '03',
    icon: Package,
    title: 'Get it Delivered',
    desc: 'High-quality custom apparel, right to your door.',
  },
];

export default function MeetingStrip() {
  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Three simple steps from idea to custom gear in your hands.
          </p>
        </div>

        {/* Numbered steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex flex-col items-center text-center bg-white rounded-2xl p-8 shadow-sm">
                {/* Number badge */}
                <span className="text-5xl font-black text-primary/15 leading-none mb-4 select-none">
                  {step.number}
                </span>
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Centred CTA */}
        <div className="flex justify-center">
          <Link
            to="/contact"
            className="px-8 py-4 bg-primary text-white font-semibold text-lg rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
          >
            Start Your Journey
          </Link>
        </div>

      </div>
    </section>
  );
}
