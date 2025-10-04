import React from 'react';
import { WavyBackground } from '../ui/wavy-background';
import teamImage from '../../assets/team1.png';

function DevTeam() {
  return (
    <WavyBackground 
      fullScreen={false} 
      containerClassName="w-full py-16 bg-gradient-to-b from-black/80 to-black/90 relative" 
      className="max-w-7xl mx-auto pb-40"
    >
      <section id="dev-team" className="w-full">
        <div className="max-w-6xl mx-auto  relative z-20">
          <div className="text-center mb-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              The passionate developers, designers, and engineers building the future of EchoNet.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl max-w-md">
              {/* Team Image */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={teamImage}
                    alt="EchoNet Development Team"
                    className="w-96 h-72 rounded-2xl object-cover border-2 border-white/20 group-hover:border-white/40 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                  EchoNet Development Team
                </h3>
                <p className="text-white/70 text-base font-medium">
                  Building the future of decentralized sensor networks
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </WavyBackground>
  );
}

export default DevTeam;
