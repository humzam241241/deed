import React from 'react';
import { Shirt, Sparkles, Smile } from 'lucide-react';
import stepsData from '../data/steps.json';

export default function Steps() {
  // Map icon names to Lucide React components
  const iconMap = {
    shirt: Shirt,
    sparkles: Sparkles,
    smile: Smile,
  };

  return (
    <section className="bg-blue-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get ready for a unique custom journey
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We make the process of creating custom apparel simple and enjoyable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stepsData.map((step, index) => {
            // Get the icon component or default to Shirt if not found
            const IconComponent = iconMap[step.icon] || Shirt;
            
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
                  <IconComponent className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
