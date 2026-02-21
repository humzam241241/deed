import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="font-bold text-xl">Apparel</div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-10">
            <div className="flex space-x-6">
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => 
                  isActive 
                    ? "text-primary font-medium" 
                    : "text-gray-700 hover:text-primary transition-colors"
                }
              >
                Home
              </NavLink>
              <NavLink 
                to="/products" 
                className={({ isActive }) => 
                  isActive 
                    ? "text-primary font-medium" 
                    : "text-gray-700 hover:text-primary transition-colors"
                }
              >
                Products
              </NavLink>
              <NavLink 
                to="/our-process" 
                className={({ isActive }) => 
                  isActive 
                    ? "text-primary font-medium" 
                    : "text-gray-700 hover:text-primary transition-colors"
                }
              >
                Our Process
              </NavLink>
              <NavLink 
                to="/our-team" 
                className={({ isActive }) => 
                  isActive 
                    ? "text-primary font-medium" 
                    : "text-gray-700 hover:text-primary transition-colors"
                }
              >
                Our Team
              </NavLink>
            </div>
            <div className="flex items-center space-x-4">
              <NavLink 
                to="/design-studio" 
                className="bg-gray-800 text-white hover:bg-gray-700 px-5 py-2.5 rounded-lg transition-colors font-medium"
              >
                Design Studio
              </NavLink>
              <NavLink 
                to="/contact" 
                className="bg-primary text-white hover:bg-primary/90 px-5 py-2.5 rounded-lg transition-colors font-medium"
              >
                Get a Quote
              </NavLink>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-2 space-y-3">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `block py-2 px-4 rounded-lg ${isActive ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/products" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-lg ${isActive ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </NavLink>
            <NavLink 
              to="/our-process" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-lg ${isActive ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Our Process
            </NavLink>
            <NavLink 
              to="/our-team" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-lg ${isActive ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Our Team
            </NavLink>
            <div className="pt-2 flex flex-col space-y-3">
              <NavLink 
                to="/design-studio" 
                className="bg-gray-800 text-white hover:bg-gray-700 px-4 py-2 rounded-lg text-center font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Design Studio
              </NavLink>
              <NavLink 
                to="/contact" 
                className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg text-center font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Get a Quote
              </NavLink>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        <NavLink 
          to="/design-studio" 
          className="flex-1 bg-gray-800 text-white text-center py-3 font-medium"
        >
          Design Studio
        </NavLink>
        <NavLink 
          to="/contact" 
          className="flex-1 bg-primary text-white text-center py-3 font-medium"
        >
          Get a Quote
        </NavLink>
      </div>
    </nav>
  );
}
