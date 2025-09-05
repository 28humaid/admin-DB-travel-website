"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MenuIcon, XIcon } from 'lucide-react';

const Sidebar = ({ options = [] }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine the default selected option (first option or based on current route)
  const getInitialSelected = () => {
    const currentOption = options.find(option => pathname.endsWith(option.route));
    return currentOption ? currentOption.route : options[0]?.route || '';
  };

  const [selectedOption, setSelectedOption] = useState(getInitialSelected);

  // Update selected option when pathname changes
  useEffect(() => {
    setSelectedOption(getInitialSelected());
  }, [pathname, options]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleOptionClick = (route) => {
    setSelectedOption(route);
    router.push(`/admin/dashboard/${route}`);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <>
      {/* Hamburger Icon for Mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-300 rounded-md"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar for Desktop */}
      <div className="hidden md:block w-1/5 h-screen bg-blue-300 fixed top-0 left-0">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
          <ul>
            {options.map((option) => (
              <li key={option.route}>
                <button
                  onClick={() => handleOptionClick(option.route)}
                  className={`w-full text-left p-2 mb-2 rounded-md text-lg ${
                    selectedOption === option.route ? 'bg-red-200' : 'hover:bg-blue-400'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile Menu (Full-Screen Overlay) */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-blue-300 z-40 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden`}
      >
        <div className="p-4 mt-16">
          <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
          <ul>
            {options.map((option) => (
              <li key={option.route}>
                <button
                  onClick={() => handleOptionClick(option.route)}
                  className={`w-full text-left p-2 mb-2 rounded-md text-lg ${
                    selectedOption === option.route ? 'bg-red-200' : 'hover:bg-blue-400'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;