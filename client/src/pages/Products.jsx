import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Package, Palette, BadgeDollarSign } from 'lucide-react';
import ChatBot from '../components/ChatBot';

export default function Products() {
  // Sample product categories
  const categories = [
    {
      name: 'T-Shirts',
      description: 'Premium cotton and blended tees in various styles and fits.',
      icon: Shirt,
      image: '/products/tshirts.jpg',
      link: '/products/t-shirts'
    },
    {
      name: 'Hoodies & Sweatshirts',
      description: 'Cozy hoodies and crewnecks perfect for any season.',
      icon: Package,
      image: '/products/hoodies.jpg',
      link: '/products/hoodies'
    },
    {
      name: 'Polos & Button-Ups',
      description: 'Professional polos and button-ups for a polished look.',
      icon: Shirt,
      image: '/products/polos.jpg',
      link: '/products/polos'
    },
    {
      name: 'Accessories',
      description: 'Hats, bags, and more to complete your custom collection.',
      icon: Palette,
      image: '/products/accessories.jpg',
      link: '/products/accessories'
    }
  ];

  // Sample printing methods
  const printingMethods = [
    {
      name: 'Screen Printing',
      description: 'Durable, vibrant prints ideal for solid colors and large quantities.',
      minQuantity: '12+ items',
      bestFor: 'Team uniforms, events, simple designs'
    },
    {
      name: 'DTG (Direct to Garment)',
      description: 'High-detail, full-color prints with no minimum quantity.',
      minQuantity: 'No minimum',
      bestFor: 'Photo prints, gradients, one-offs'
    },
    {
      name: 'Embroidery',
      description: 'Premium, textured finish that\'s perfect for logos and text.',
      minQuantity: '6+ items',
      bestFor: 'Corporate wear, polos, hats'
    },
    {
      name: 'Vinyl Heat Transfer',
      description: 'Versatile option for names, numbers, and simple designs.',
      minQuantity: 'No minimum',
      bestFor: 'Sports jerseys, names/numbers'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Products</h1>
            <p className="text-lg text-gray-600 mb-8">
              Explore our range of high-quality apparel options ready for your custom designs.
              From casual tees to professional polos, we've got the perfect canvas for your vision.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/design-studio" 
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Designing
              </Link>
              <Link 
                to="/contact" 
                className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Product Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div 
                key={category.name}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gray-100 relative">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/800x400/f1f5f9/64748b?text=${category.name}`;
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-white rounded-full p-2">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <Link 
                    to={category.link} 
                    className="text-primary font-medium hover:underline"
                  >
                    View options →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Printing methods */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Printing Methods</h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            We offer various printing techniques to ensure your design looks its best
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {printingMethods.map((method) => (
              <div 
                key={method.name}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold mb-3">{method.name}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <div className="flex items-center mb-2">
                  <BadgeDollarSign className="w-5 h-5 text-primary mr-2" />
                  <span className="text-sm font-medium">Min: {method.minQuantity}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Best for: {method.bestFor}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-primary/10 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to bring your ideas to life?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Whether you have a design ready to go or need help creating something unique,
              our team is here to guide you through the process.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/design-studio" 
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Visit Design Studio
              </Link>
              <Link 
                to="/contact" 
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
