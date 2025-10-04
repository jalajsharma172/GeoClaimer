import React from "react";

function AboutUs() {
  return (
    <div className="w-screen min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center py-24 px-6 md:px-16 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/70 to-black/90 z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Page Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
          About <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Our Decentralized Data Cloud</span>
        </h1>

        {/* Intro Paragraph */}
        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
          We are building the future of data — where devices around the world
          generate valuable insights, validators ensure trustless verification,
          and contributors earn rewards for powering a global decentralized data economy.
        </p>

        {/* Section: Our Vision */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 border border-white/20 shadow-lg hover:scale-105 transition-all duration-500">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
              Our Vision
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              To create a world where data is open, community-driven, and free
              from centralized control — empowering individuals and cities to
              make smarter decisions.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 border border-white/20 shadow-lg hover:scale-105 transition-all duration-500">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Devices mine real-time data, independent agents verify its
              integrity, and verified contributors receive token rewards they
              can convert to USDC or reinvest in the ecosystem.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 border border-white/20 shadow-lg hover:scale-105 transition-all duration-500">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-orange-300 bg-clip-text text-transparent">
              Our Mission
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              To build a self-sustaining decentralized data cloud that rewards
              contributors, benefits businesses, and powers smarter AI
              predictions for everyone.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-24 bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 shadow-xl max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Contact Us
          </h2>
          <p className="text-lg text-gray-300 mb-4">
            Have questions, feedback, or want to collaborate? We’d love to hear
            from you!
          </p>
          <div className="text-left space-y-4">
            <p className="text-xl">
              📧 Email: <span className="text-blue-300">support@echonet.ac.in</span>
            </p>
            <p className="text-xl">
              📞 Phone: <span className="text-blue-300">+91 7878156840</span>
            </p>
            <p className="text-xl">
              📍 Location: <span className="text-blue-300">Jalandhar, Punjab, India</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
