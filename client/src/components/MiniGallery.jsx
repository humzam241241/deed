import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, X, Users, Calendar, Package } from 'lucide-react';
import galleryData from '../data/gallery.json';

export default function MiniGallery() {
  const [activeSlides, setActiveSlides] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Filter gallery items based on active tab
  const filteredGallery = activeTab === 'all' 
    ? galleryData 
    : galleryData.filter(item => item.category === activeTab);

  // Handle slide navigation
  const handleSlideChange = (galleryId, direction) => {
    const item = galleryData.find(item => item.id === galleryId);
    if (!item) return;
    
    const currentSlide = activeSlides[galleryId] || 0;
    const totalSlides = item.media.length;
    
    let newSlide;
    if (direction === 'next') {
      newSlide = (currentSlide + 1) % totalSlides;
    } else {
      newSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    }
    
    setActiveSlides({
      ...activeSlides,
      [galleryId]: newSlide
    });
  };

  // Open modal with gallery item details
  const openModal = (item) => {
    setModalContent(item);
    setModalOpen(true);
    setActiveSlides({
      ...activeSlides,
      modal: 0
    });
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  // Render stars for ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-5 h-5 text-gray-300" />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    
    return stars;
  };

  return (
    <section className="py-16" id="mini-gallery">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Our Work
        </h2>
        <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-8">
          Check out some of our recent projects and what our clients have to say
        </p>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'all' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Projects
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'student' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Student Clubs
            </button>
            <button
              onClick={() => setActiveTab('corporate')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'corporate' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Corporate
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGallery.map((item) => {
            const currentSlide = activeSlides[item.id] || 0;
            const media = item.media[currentSlide];
            
            return (
              <div 
                key={item.id} 
                id={`gallery-${item.id}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="relative h-64">
                  {media.type === 'image' ? (
                    <img 
                      src={media.src} 
                      alt={media.alt} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x400/f1f5f9/64748b?text=Image+Placeholder';
                      }}
                    />
                  ) : (
                    <video 
                      src={media.src}
                      poster="https://placehold.co/600x400/f1f5f9/64748b?text=Video+Placeholder" 
                      className="w-full h-full object-cover"
                      controls
                    >
                      Your browser does not support video playback.
                    </video>
                  )}
                  
                  {/* Navigation arrows if more than one media item */}
                  {item.media.length > 1 && (
                    <>
                      <button 
                        onClick={() => handleSlideChange(item.id, 'prev')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleSlideChange(item.id, 'next')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      {/* Slide indicators */}
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                        {item.media.map((_, index) => (
                          <div 
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentSlide ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  
                  {/* Project metadata */}
                  <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                    {item.quantity && (
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        <span>{item.quantity} items</span>
                      </div>
                    )}
                    {item.year && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{item.year}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Show rating if available */}
                  {item.review && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        {renderStars(item.review.rating)}
                        <span className="ml-2 text-sm text-gray-500">
                          {item.review.rating.toFixed(1)}
                        </span>
                      </div>
                      
                      {/* Show a preview of the review */}
                      <p className="text-gray-600 text-sm line-clamp-2">
                        "{item.review.text}"
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => openModal(item)}
                    className="mt-4 text-primary font-medium hover:underline"
                  >
                    View details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Modal for detailed view */}
      {modalOpen && modalContent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 flex justify-between items-start border-b">
              <h3 className="text-2xl font-semibold">{modalContent.title}</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="relative h-96 mb-6">
                {modalContent.media.length > 0 && (
                  <>
                    {modalContent.media[activeSlides.modal || 0].type === 'image' ? (
                      <img 
                        src={modalContent.media[activeSlides.modal || 0].src} 
                        alt={modalContent.media[activeSlides.modal || 0].alt} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/800x600/f1f5f9/64748b?text=Image+Placeholder';
                        }}
                      />
                    ) : (
                      <video 
                        src={modalContent.media[activeSlides.modal || 0].src}
                        poster="https://placehold.co/800x600/f1f5f9/64748b?text=Video+Placeholder" 
                        className="w-full h-full object-contain"
                        controls
                      >
                        Your browser does not support video playback.
                      </video>
                    )}
                    
                    {/* Navigation arrows if more than one media item */}
                    {modalContent.media.length > 1 && (
                      <>
                        <button 
                          onClick={() => {
                            const currentSlide = activeSlides.modal || 0;
                            const totalSlides = modalContent.media.length;
                            const newSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                            
                            setActiveSlides({
                              ...activeSlides,
                              modal: newSlide
                            });
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={() => {
                            const currentSlide = activeSlides.modal || 0;
                            const totalSlides = modalContent.media.length;
                            const newSlide = (currentSlide + 1) % totalSlides;
                            
                            setActiveSlides({
                              ...activeSlides,
                              modal: newSlide
                            });
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        
                        {/* Slide indicators */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                          {modalContent.media.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setActiveSlides({
                                  ...activeSlides,
                                  modal: index
                                });
                              }}
                              className={`w-3 h-3 rounded-full ${
                                index === (activeSlides.modal || 0) ? 'bg-primary' : 'bg-gray-300'
                              }`}
                              aria-label={`Go to slide ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              
              {/* Project details */}
              <div className="flex flex-wrap gap-4 mb-6 text-gray-700">
                {modalContent.quantity && (
                  <div className="flex items-center">
                    <Package className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-medium">{modalContent.quantity} items ordered</span>
                  </div>
                )}
                {modalContent.year && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-medium">{modalContent.year}</span>
                  </div>
                )}
              </div>
              
              {/* Review section */}
              {modalContent.review && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-4">
                    {renderStars(modalContent.review.rating)}
                    <span className="ml-2 text-gray-600">
                      {modalContent.review.rating.toFixed(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 italic mb-4">
                    "{modalContent.review.text}"
                  </p>
                  
                  <p className="text-gray-600 font-medium">
                    — {modalContent.review.author}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for highlighting the gallery item when navigated to */}
      <style jsx="true">{`
        @keyframes highlight {
          0% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0); }
          50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5); }
          100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0); }
        }
        
        .highlight-item {
          animation: highlight 2s ease-out;
        }
      `}</style>
    </section>
  );
}
