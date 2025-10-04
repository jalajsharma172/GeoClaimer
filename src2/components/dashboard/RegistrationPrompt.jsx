import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import Registration from '../Registration/Registration.jsx';

const RegistrationPrompt = () => {
    const Navigate = useNavigate();
    const handleRegister = () => {
        // In a real app, this would trigger a smart contract transaction.
        Navigate('/registration');
    };

    return (
        <div className="w-full max-w-3xl mx-auto text-center animate-fade-in pt-20">
            <div className="bg-white/5 border border-white/10 rounded-xl p-10 backdrop-blur-md">
                <ShieldAlert size={48} className="text-yellow-400 mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-white mb-4">Registration Required</h1>
                <p className="text-gray-300 mb-8 max-w-md mx-auto">
                    Your wallet is connected, but not registered in the EchoNet network. To start earning rewards and view analytics, you need to register your sensor device.
                </p>
                <button
                    onClick={handleRegister}
                    className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-all text-lg"
                >
                    Register Your Sensor Now
                </button>
            </div>
        </div>
    );
};

export default RegistrationPrompt;
