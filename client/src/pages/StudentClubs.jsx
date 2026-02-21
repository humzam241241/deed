import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BadgeDollarSign, Clock, Sparkles, Calendar, CheckCircle } from 'lucide-react';
import ChatBot from '../components/ChatBot';

export default function StudentClubs() {
  const [formData, setFormData] = useState({
    name: '',
    clubName: '',
    email: '',
    quantity: '',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const benefits = [
    {
      icon: BadgeDollarSign,
      title: 'Student Pricing',
      description: 'Special discounts for student organizations and clubs'
    },
    {
      icon: Clock,
      title: 'Quick Turnaround',
      description: 'Fast production to meet your event deadlines'
    },
    {
      icon: Sparkles,
      title: 'Free Design Help',
      description: 'Our designers help bring your club vision to life'
    },
    {
      icon: CheckCircle,
      title: 'No Minimums',
      description: 'Flexible order sizes for clubs of all sizes'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormData({
      name: '',
      clubName: '',
      email: '',
      quantity: '',
      notes: ''
    });
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm mb-6">
              <Users className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium text-gray-700">For Student Clubs</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Custom Apparel for Your Club
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Unite your members with custom merch that shows your club spirit. 
              From frosh week to graduation, we've got you covered.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#quote"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Get a Quote
              </a>
              <Link 
                to="/ontario-tech-clubs"
                className="px-6 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                Ontario Tech Clubs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Clubs Love Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const IconComponent = benefit.icon;
              return (
                <div key={benefit.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
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

      {/* Process */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Book a Meeting</h3>
                  <p className="text-gray-600">Schedule a quick call to discuss your club's needs, timeline, and budget</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Design</h3>
                  <p className="text-gray-600">Upload your logo or work with our team to create something unique</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Deliver</h3>
                  <p className="text-gray-600">Get your orders ready in time for your events, meetings, or giveaways</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote form */}
      <section className="py-16" id="quote">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Get Your Club Quote</h2>
            
            {formSubmitted && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
                <p className="font-medium">Thanks! We'll be in touch within 24 hours.</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                    Club Name
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
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email
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
                
                <div>
                  <label htmlFor="quantity" className="block text-gray-700 font-medium mb-2">
                    Quantity Needed
                  </label>
                  <select
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  >
                    <option value="">Select quantity</option>
                    <option value="10-25">10-25 items</option>
                    <option value="25-50">25-50 items</option>
                    <option value="50-100">50-100 items</option>
                    <option value="100+">100+ items</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">
                    Tell us about your project
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Event details, timeline, design ideas..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
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
