// DashboardPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Routes, Route } from 'react-router-dom';

import Navbar from '../components/dashboard/Navbar.jsx';
import RegistrationPrompt from '../components/dashboard/RegistrationPrompt.jsx';
import Exchange from '../components/exchange/ExchangeCurrency.jsx';
import UserDashboard from '@/components/dashboard/main/UserDashboard.jsx';
import Market from './Market.jsx';
import HyperGraphDevice from './HyperGraphDevice.jsx';
import About from './About.jsx';
import Bg from "../backgound/Bg.jsx";

function DashboardPage() {
    const { isRegistered } = useAuth();

    return (
        <div className="relative min-h-screen w-screen bg-black text-white flex flex-col">
            {/* Background Layer */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <Bg />
            </div>

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col h-screen  overflow-y-auto">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-full mx-auto h-full flex flex-col items-center justify-center">
                        <div className="w-full h-full overflow-y-auto px-4 py-8">
                            <Routes>
                                <Route
                                    path="/dashboard"
                                    element={
                                        isRegistered ? (
                                            <UserDashboard />
                                        ) : (
                                            <RegistrationPrompt />
                                        )
                                    }
                                />
                                <Route path="/exchange" element={<Exchange />} />
                                <Route path="/market" element={<Market />} />
                                <Route path="/hypergraph" element={<HyperGraphDevice />} />
                                <Route path="/about" element={<About />} />
                            </Routes>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DashboardPage;
