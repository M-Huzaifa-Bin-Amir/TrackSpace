import React from 'react';
import AskAI from '../components/AskAI'; 

const HomePage = ({ setCurrentPage, content }) => {
  return (
    <div className="flex flex-col w-full">
      
      {/* ─── HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative w-full py-28 px-6 text-center text-white rounded-b-xl overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=1500&q=80")' }}
        ></div>
        <div className="absolute inset-0 z-10 bg-[#000040]/60"></div>

        <div className="relative z-20 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            {content?.hero?.title || "Welcome to TrackSphere"}
          </h1>
          <p className="text-lg md:text-xl text-gray-100 font-light mb-8">
            {content?.hero?.subtitle || "Smart Solutions for Asset Tracking & Management"}
          </p>
          <button 
            onClick={() => setCurrentPage('dashboard')} 
            className="bg-[#7e3ff2] hover:bg-[#4B0082] text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* ─── AI ASSISTANT SECTION (NEW) ────────────────────────────── */}
      <section className="py-12 px-4 -mt-10 relative z-30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">New Feature</span>
            <h2 className="text-2xl font-bold text-[#340158] mt-2">Have questions? Ask our AI.</h2>
          </div>
          <AskAI />
        </div>
      </section>

      {/* ─── INFO SECTION ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#f7f9fc] to-[#eef2f7]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
          <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-[#1a237e] mb-4 border-b-4 border-[#1a237e] inline-block pb-1">
              How It Works
            </h2>
            <p className="text-gray-600 leading-relaxed">
              TrackSphere simplifies asset management by assigning every item a unique digital identity. 
              Once added to the system, assets can be monitored in real time through our secure platform.
            </p>
          </div>

          <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-[#1a237e] mb-4 border-b-4 border-[#1a237e] inline-block pb-1">
              Our Services
            </h2>
            <ul className="space-y-3">
              {[
                { icon: "📦", text: "Real-time Asset Tracking" },
                { icon: "📊", text: "Analytics & Reporting" },
                { icon: "⏰", text: "Maintenance Scheduling" },
                { icon: "☁️", text: "Cloud-Based Storage" },
                { icon: "🔒", text: "Data Security" }
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-700">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;