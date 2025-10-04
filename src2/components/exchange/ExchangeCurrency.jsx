import React from 'react';
import ExchangeView from './ExchangeView.jsx';
import Bg from './background/Bg.jsx';

export default function ExchangeCurrency() {
  return (
    <div className="w-full h-full flex justify-center items-center bg-gradient-to-br text-white font-sans relative overflow-hidden">
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>

      {/* Background - no overflow */}
      {/* <div className="absolute inset-0 z-0 overflow-hidden">
        <Bg />
      </div> */}

      {/* Foreground Content */}
      <div className="w-full h-full flex items-center justify-center relative z-10">
        <ExchangeView />
      </div>
    </div>
  );
}
