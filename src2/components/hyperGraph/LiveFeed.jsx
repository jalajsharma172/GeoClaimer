import React from 'react';
import SensorCard from './SensorCard';

function LiveFeed({ sensors, onDelete }) {
  return (
    <div className="bg-black-900/50 border-white/25 rounded-2xl backdrop-blur-sm shadow-[0_8px_32px_rgba(255,255,255,0.15)] hover:border-white/30 transition-all duration-300">
      <div className="border border-white/20 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <i className="fas fa-broadcast-tower text-2xl text-green-400 mr-3"></i>
            <h2 className="text-2xl font-bold text-white">Live Sensor Network</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full pulse-animation"></div>
            <span className="text-sm text-white">Live Updates</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.length > 0 ? (
            sensors.map((device) => <SensorCard key={device.id} device={device} onDelete={onDelete} />)
          ) : (
            <p className="text-white col-span-full text-center">
              No sensors registered yet. Add one above to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveFeed;
