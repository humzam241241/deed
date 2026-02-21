import React from 'react';
import { Link } from 'react-router-dom';
import trustedByData from '../data/trustedBy.json';

export default function TrustedBy() {
  const scrollToGalleryItem = (galleryId) => {
    const element = document.getElementById(`gallery-${galleryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a highlight effect
      element.classList.add('highlight-item');
      setTimeout(() => {
        element.classList.remove('highlight-item');
      }, 2000);
    }
  };

  return (
    <section className="bg-green-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Trusted by
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
          {trustedByData.map((client) => (
            <Link
              key={client.name}
              to={`/#mini-gallery`}
              onClick={(e) => {
                e.preventDefault();
                scrollToGalleryItem(client.galleryId);
              }}
              className="bg-white rounded-xl p-6 flex items-center justify-center h-24 shadow-sm hover:shadow-md transition-all group"
            >
              {client.logoSrc ? (
                <img 
                  src={client.logoSrc} 
                  alt={client.name} 
                  className="max-h-12 max-w-full opacity-70 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/200x80/ffffff/333?text=${client.name}`;
                  }}
                />
              ) : (
                <span className="text-gray-500 font-medium group-hover:text-primary transition-colors">
                  {client.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
