"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MenuIcon, XIcon, UploadIcon } from 'lucide-react';

const Sidebar = ({ options = [] }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

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
    if (route === 'uploadExcel') {
      console.log('Upload Excel button clicked');
      fileInputRef.current?.click();
      return;
    }
    setSelectedOption(route);
    router.push(`/admin/dashboard/${route}`);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  const handleFileUpload = (event) => {
    console.log('handleFileUpload triggered');
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    console.log('Selected file:', file.name, 'Type:', file.type);
    if (
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.xlsx')
    ) {
      console.log('Valid Excel file selected:', file.name);
      // Add your file processing logic here (e.g., FormData, API call)
    } else {
      console.error('Invalid file type. Please upload a valid Excel file (.xls, .xlsx)');
    }
    // Reset the file input to allow re-uploading the same file
    event.target.value = '';
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
                  className={`w-full text-left p-2 mb-2 rounded-md text-lg flex items-center gap-2 ${
                    selectedOption === option.route ? 'bg-red-200' : 'hover:bg-blue-400'
                  }`}
                >
                  {option.route === 'uploadExcel' && <UploadIcon size={20} />}
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
                  className={`w-full text-left p-2 mb-2 rounded-md text-lg flex items-center gap-2 ${
                    selectedOption === option.route ? 'bg-red-200' : 'hover:bg-blue-400'
                  }`}
                >
                  {option.route === 'uploadExcel' && <UploadIcon size={20} />}
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Hidden File Input for Excel Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileUpload}
        className="hidden"
      />
    </>
  );
};

export default Sidebar;