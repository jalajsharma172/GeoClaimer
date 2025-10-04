import React, { useRef, useEffect } from 'react';
import videoPlaceholder from '../../assets/earthVideo.mp4';

function DescriptionSection() {
  const videoRef = useRef(null);

  const descriptions = [
    {
      id: 1,
      title: "Decentralized Data Mining",
      text: "Every device connected to our network becomes a data miner. It generates real-time data and contributes to a global, censorship-resistant data cloud — fully owned by the community.",
      color: "bg-blue-600",
    },
    {
      id: 2,
      title: "Trustless Data Verification",
      text: "Before data enters the cloud, independent agents validate its accuracy using our consensus protocol. This ensures that only high-quality, reliable data powers analytics and insights.",
      color: "bg-orange-600",
    },
    {
      id: 3,
      title: "Tokenized Rewards & Economy",
      text: "Verified contributors earn tokens that can be converted to USDC, used to buy more devices, or access premium datasets — creating a self-sustaining data economy.",
      color: "bg-purple-600",
    },
  ];


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId = null;
    const stepBack = () => {
      if (!video) return;
      video.currentTime = Math.max(0, video.currentTime - 0.04);
      if (video.currentTime <= 0) {
        cancelAnimationFrame(rafId);
        video.playbackRate = 1;
        video.play();
      } else {
        rafId = requestAnimationFrame(stepBack);
      }
    };

    const handleEnded = () => {
      try {
        video.pause();
        video.playbackRate = -1;
        const p = video.play();
        if (p && p.catch) {
          p.catch(() => {
            video.playbackRate = 1;
            rafId = requestAnimationFrame(stepBack);
          });
        }
      } catch {
        video.playbackRate = 1;
        rafId = requestAnimationFrame(stepBack);
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="w-screen min-h-screen bg-gray-900 flex flex-col items-center justify-center py-20 px-4 md:px-8 relative overflow-hidden">
      <video
        ref={videoRef}
        src={videoPlaceholder}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-gray-900/60 to-black/80 z-5" />
      <div className="absolute inset-0 opacity-10 z-6" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            How EchoNet Transforms Your City
          </h2>
          <div className="w-24 h-1 bg-white my-2"></div>
          <p className="text-gray-300 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            Discover the revolutionary technology that's reshaping urban environments through intelligent sensing and community participation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {descriptions.map((desc, index) => (
            <div
              key={desc.id}
              className="group relative rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 hover:z-10 flex flex-col"
              style={{
                animationDelay: `${index * 200}ms`,
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              {/* Card Wrapper with Equal Height */}
              <div className="absolute inset-0 rounded-2xl p-[2px] opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl h-full w-full"></div>
              </div>

              {/* Main Card with Fixed Height */}
              <div className="relative rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg overflow-hidden transition-all duration-500 flex flex-col justify-between min-h-[320px] p-8">

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                  <div className="absolute top-12 right-8 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-600 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-white flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
                      {desc.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-base group-hover:text-gray-200 transition-colors duration-300">
                      {desc.text}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="mt-6 h-1 w-0 bg-white rounded-full opacity-80 group-hover:w-full transition-all duration-700 ease-out"></div>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DescriptionSection;
