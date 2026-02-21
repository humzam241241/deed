import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, ArrowRight, Sparkles, Upload, Maximize2, Download } from 'lucide-react';

export default function DesignStudioCTA() {
  return (
    <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
            <Palette className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            See Your Design Come to Life
          </h2>
          
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Upload your logo and instantly preview it on t-shirts, hoodies, hats, and more. 
            Adjust colors, placement, and size until it's perfect—all before you order.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/design-studio" 
              className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg group"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Launch Design Studio
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/contact" 
              className="inline-flex items-center px-8 py-4 bg-white/10 text-white border-2 border-white/20 rounded-lg hover:bg-white/20 transition-colors font-medium text-lg"
            >
              Need Design Help?
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
              <Upload className="w-8 h-8 text-primary mb-3" />
              <div className="text-white font-medium mb-1">Easy Upload</div>
              <div className="text-gray-400 text-sm">PNG, SVG, or JPG files</div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
              <Maximize2 className="w-8 h-8 text-primary mb-3" />
              <div className="text-white font-medium mb-1">Full Control</div>
              <div className="text-gray-400 text-sm">Size, rotate, position</div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
              <Sparkles className="w-8 h-8 text-primary mb-3" />
              <div className="text-white font-medium mb-1">Live Preview</div>
              <div className="text-gray-400 text-sm">See it in real-time</div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
              <Download className="w-8 h-8 text-primary mb-3" />
              <div className="text-white font-medium mb-1">Save & Export</div>
              <div className="text-gray-400 text-sm">Download anytime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
