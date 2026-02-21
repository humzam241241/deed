import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shirt, Sparkles, Smile, Upload, Clock, BadgeDollarSign, CheckCircle } from 'lucide-react';
import ChatBot from '../components/ChatBot';

export default function OntarioTechClubs() {
  const [formData, setFormData] = useState({
    name: '',
    clubName: '',
    email: '',
    quantity: '',
    notes: '',
    file: null
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Club-specific steps
  const clubSteps = [
    {
      title: 'Pick your canvas',
      description: 'Choose from our premium apparel options with special bulk pricing for Ontario Tech clubs.',
      icon: Shirt
    },
    {
      title: 'Get creative',
      description: 'Upload your club logo or work with our design team to create something unique.',
      icon: Sparkles
    },
    {
      title: 'Make them proud',
      description: 'Receive high-quality custom apparel that your club members will love to wear.',
      icon: Smile
    }
  ];

  // Club benefits
  const clubBenefits = [
    {
      icon: BadgeDollarSign,
      title: 'Special Club Pricing',
      description: 'Exclusive discounts for Ontario Tech clubs and societies on bulk orders.'
    },
    {
      icon: Clock,
      title: 'Priority Production',
      description: 'Expedited timelines to meet your club events and deadlines.'
    },
    {
      icon: CheckCircle,
      title: 'Quality Guarantee',
      description: 'Premium materials and printing methods for apparel that lasts.'
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: 'A club specialist to help with your order from design to delivery.'
    }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      file: file
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, you would send the form data to your backend
    setFormSubmitted(true);
    
    // Reset form after submission
    setFormData({
      name: '',
      clubName: '',
      email: '',
      quantity: '',
      notes: '',
      file: null
    });
    
    // Reset submission status after a delay
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Ontario Tech Clubs & Societies</h1>
            <p className="text-lg text-gray-600 mb-8">
              Custom apparel solutions designed specifically for Ontario Tech University clubs, teams, and student organizations. Get premium quality at special bulk pricing.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#club-quote"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Get a Club Quote
              </a>
              <Link 
                to="/gallery"
                className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                See Club Examples
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works for clubs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works for Clubs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make the process simple so you can focus on what matters - your club activities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {clubSteps.map((step, index) => {
              const IconComponent = step.icon;
              
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

      {/* Club benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Club Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubBenefits.map((benefit) => {
              const IconComponent = benefit.icon;
              
              return (
                <div 
                  key={benefit.title}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Club quote form */}
      <section className="py-16" id="club-quote">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Get a Club Quote</h2>
            
            {formSubmitted ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
                <p className="font-medium">Thank you for your inquiry!</p>
                <p>We'll get back to you within 24 hours with a custom quote for your club.</p>
              </div>
            ) : null}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="clubName" className="block text-gray-700 font-medium mb-2">
                    Club/Society Name
                  </label>
                  <input
                    type="text"
                    id="clubName"
                    name="clubName"
                    value={formData.clubName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-gray-700 font-medium mb-2">
                  Estimated Quantity
                </label>
                <select
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                >
                  <option value="">Select quantity range</option>
                  <option value="12-24">12-24 items</option>
                  <option value="25-49">25-49 items</option>
                  <option value="50-99">50-99 items</option>
                  <option value="100+">100+ items</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Tell us about your project, timeline, or any specific requirements..."
                ></textarea>
              </div>
              
              <div className="mb-8">
                <label htmlFor="file" className="block text-gray-700 font-medium mb-2">
                  Upload Logo or Design (optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">SVG, PNG, JPG or PDF (max. 10MB)</p>
                    </div>
                    <input 
                      id="file" 
                      name="file"
                      type="file" 
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {formData.file && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected file: {formData.file.name}
                  </p>
                )}
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit Quote Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
