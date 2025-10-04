import React from 'react';
import earthIcon from "../../../assets/earth.svg";
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="w-3/5 fixed top-5 left-1/2 -translate-x-1/2 py-3 px-6 rounded-full flex items-center justify-between gap-8 backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg z-50">
      {/* Left side: Logo and Brand Name */}
      <div className="flex items-center gap-2">
        <img src={earthIcon} alt="Earth" className="w-8 h-8 object-contain filter invert" />
        <span className="text-white font-semibold text-2xl">EchoNet</span>
      </div>

      {/* Right side: Navigation Links */}
      <div className="flex items-center gap-6">
        <Link 
          to="/heatmap" 
          className="bg-transparent cursor-pointer text-white font-semibold py-2 px-6 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
        >
          Heatmap
        </Link>
        <Link 
          to="/dashboard" 
          className="bg-white cursor-pointer text-black font-semibold py-2 px-6 rounded-full border border-white/20 hover:bg-gray-200 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;