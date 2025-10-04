import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SensorCard from './SensorCard';

function Discovery({ onSearch, results, onDelete }) {
  const [location, setLocation] = useState('Delhi');
  const [type, setType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    await onSearch(location, type);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="border bg-black-900/50 border-white/25 hover:border-white/30 transition-all duration-300 p-6 rounded-2xl shadow-xl backdrop-blur-lg"
    >
      <div className="flex items-center mb-6">
        <i className="fas fa-search-location text-2xl text-purple-400 mr-3"></i>
        <h2 className="text-2xl font-bold text-white">Discover Devices</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter area name..."
            className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-400"
          >
            <option value="">All Device Types</option>
            <option value="sound">Sound</option>
            <option value="air">Air Quality</option>
            <option value="weather">Weather</option>
          </select>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
        >
          <i className="fas fa-search mr-2"></i>
          {isLoading ? 'Searching...' : 'Search Cross-Project Devices'}
        </motion.button>
      </div>

      <div className="mt-6">
        {results === null ? (
          <p className="text-gray-400 text-center">Search for devices to see results.</p>
        ) : results.length === 0 ? (
          <p className="text-gray-400 text-center">No devices found for this query.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
            {results.map((device) => (
              <SensorCard key={device.id} device={device} onDelete={onDelete} isSearchResult={true} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Discovery;
