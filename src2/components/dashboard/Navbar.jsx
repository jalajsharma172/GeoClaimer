import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import earthSvg from '../../assets/earth.svg';
import { useEcho } from '@/context/EchoNetContext';
import { useAuth } from '@/context/AuthContext';
import { useUnregisterDevice } from "../../hooks/UseUnregisterDevice.jsx";

const Navbar = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

    const profileMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const { echoCoin } = useEcho();
    const { isRegistered } = useAuth();
    const { unregisterDevice, isLoading } = useUnregisterDevice();

    const activeLinkStyle = {
        color: 'white',
        fontWeight: '600',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        textShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="fixed top-5 w-[90%] md:w-[85%] lg:w-[80%] max-w-7xl left-1/2 -translate-x-1/2 z-50">
            <header className="w-full bg-black/70 backdrop-blur-2xl border border-white/25 rounded-2xl shadow-[0_8px_32px_rgba(255,255,255,0.15)] transition-all duration-300">
                <div className="container mx-auto px-5 py-3.5 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={earthSvg} alt="Earth Logo" className="w-8 h-8" style={{ filter: 'invert(1) brightness(2)' }} />
                        <span className="text-white font-bold text-xl tracking-wider">EchoNet</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-4">
                        <NavLink to="/dashboard" className="text-gray-300 hover:text-white transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
                            Home
                        </NavLink>
                        <NavLink to="/hypergraph" className="text-gray-300 hover:text-white transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
                            Knowledge Graph
                        </NavLink>
                        <NavLink to="/market" className="text-gray-300 hover:text-white transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
                            Market
                        </NavLink>
                        <NavLink to="/exchange" className="text-gray-300 hover:text-white transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
                            Convert
                        </NavLink>

                        <NavLink to="/about" className="text-gray-300 hover:text-white transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
                            About Us
                        </NavLink>
                    </nav>

                    <div className="flex items-center gap-4">
                        {isRegistered && (
                            <button
                                onClick={unregisterDevice}
                                disabled={isLoading}
                                className="hidden sm:block bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Unregistering..." : "Unregister"}
                            </button>
                        )}
                        <div className="hidden md:flex bg-white/90 text-black px-4 py-2 rounded-full text-sm font-bold items-center gap-2">
                            <span>{echoCoin ? parseFloat(echoCoin).toFixed(2) : '0.00'}</span>
                            <span className="text-gray-600">EC</span>
                        </div>
                        <div className="md:hidden" ref={mobileMenuRef}>
                            <button className="text-white" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {isMobileMenuOpen && (
                <div className="md:hidden mt-3 w-full bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(255,255,255,0.15)] flex flex-col items-center gap-2 py-6 animate-slide-down">
                    <NavLink to="/dashboard" className="text-gray-300 hover:text-white transition-colors text-lg py-2" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
                    <NavLink to="/exchange" className="text-gray-300 hover:text-white transition-colors text-lg py-2" onClick={() => setMobileMenuOpen(false)}>Convert</NavLink>
                    <NavLink to="/about" className="text-gray-300 hover:text-white transition-colors text-lg py-2" onClick={() => setMobileMenuOpen(false)}>About Us</NavLink>
                    <div className="border-t border-white/20 w-4/5 my-3"></div>
                    {!user ? (
                        <div className="flex flex-col items-center gap-4 w-full px-6">
                            <Link to="/login" className="w-full text-center text-gray-300 hover:text-white transition-colors py-2 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                            <Link to="/signup" className="w-full text-center bg-white text-black font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                Sign Up
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 w-full px-6">
                            {isRegistered && (
                                <button
                                    onClick={() => { unregisterDevice(); setMobileMenuOpen(false); }}
                                    disabled={isLoading}
                                    className="w-full text-center bg-red-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? "Unregistering..." : "Unregister Device"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Navbar;

/* Note: For the mobile menu's "slide-down" animation, 
  you'll need to add this to your global CSS file (e.g., index.css):

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
*/