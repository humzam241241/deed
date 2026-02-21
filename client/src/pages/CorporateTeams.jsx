import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Shield, TrendingUp, Users, Award, Zap } from 'lucide-react';
import ChatBot from '../components/ChatBot';

export default function CorporateTeams() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    quantity: '',
    needs: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const benefits = [
    {
      icon: Shield,
      title: 'Premium Quality',
      description: 'Professional-grade apparel that represents your brand'
    },
    {
      icon: Zap,
      title: 'Bulk Pricing',
      description: 'Competitive rates for corporate orders of all sizes'
    },
    {
      icon: Award,
      title: 'Brand Consistency',
      description: 'Pantone matching and brand guideline adherence'
    },
    {
      icon: TrendingUp,
      title: 'Account Management',
      description: 'Dedicated support for repeat orders and campaigns'
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
      company: '',
      email: '',
      phone: '',
      quantity: '',
      needs: ''
    });
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm mb-6">
              <Briefcase className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium text-gray-700">For Corporate Teams</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Professional Apparel for Teams That Mean Business
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Elevate your company culture with premium custom apparel. From team uniforms to 
              branded swag, we deliver quality that reflects your professional standards.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#enterprise-quote"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Request Enterprise Quote
              </a>
              <Link 
                to="/products"
                className="px-6 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                View Products →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Companies Choose Us</h2>
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

      {/* Use cases */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Perfect For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Team Uniforms</h3>
              <p className="text-gray-600">
                Professional attire for customer-facing teams, events, and daily operations
              </p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Corporate Swag</h3>
              <p className="text-gray-600">
                Branded merchandise for clients, events, and employee appreciation
              </p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Event Apparel</h3>
              <p className="text-gray-600">
                Custom gear for conferences, trade shows, and company retreats
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Enterprise Process</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Consultation</h3>
                  <p className="text-gray-600">
                    Meet with our team to discuss your requirements, brand guidelines, and goals
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Design & Approval</h3>
                  <p className="text-gray-600">
                    Review digital mockups and samples before full production begins
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Production & Delivery</h3>
                  <p className="text-gray-600">
                    Quality-controlled manufacturing with flexible fulfillment options
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise quote form */}
      <section className="py-16 bg-gray-50" id="enterprise-quote">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Request Enterprise Quote</h2>
            
            {formSubmitted && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
                <p className="font-medium">Thank you! Our enterprise team will contact you within 1 business day.</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Full Name
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
                  <label htmlFor="company" className="block text-gray-700 font-medium mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Business Email
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
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="quantity" className="block text-gray-700 font-medium mb-2">
                    Order Size
                  </label>
                  <select
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  >
                    <option value="">Select order size</option>
                    <option value="50-100">50-100 items</option>
                    <option value="100-250">100-250 items</option>
                    <option value="250-500">250-500 items</option>
                    <option value="500+">500+ items</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="needs" className="block text-gray-700 font-medium mb-2">
                    Project Details
                  </label>
                  <textarea
                    id="needs"
                    name="needs"
                    value={formData.needs}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Tell us about your needs, timeline, and any specific requirements..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit Enterprise Request
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
