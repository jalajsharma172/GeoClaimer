import React from 'react';

function Header() {
    return (
        <header className="bg-black text-white py-6 shadow-lg border-b border-white/20">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <i className="fas fa-network-wired text-3xl text-white"></i>
                        <div>
                            <h1 className="text-3xl font-bold text-white">DePIN Hypergraph</h1>
                            <p className="text-white">Cross-Project Sensor Discovery Network</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-white">Polygon Amoy Testnet</div>
                        <div className="text-xs text-green-400">🔌 Connected</div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;