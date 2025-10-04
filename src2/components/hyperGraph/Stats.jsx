import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon, label, value }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-black border border-white/20 rounded-2xl shadow-lg p-6 text-center"
  >
    <i className={`${icon} text-3xl mb-2`}></i>
    <div className="text-3xl font-bold text-white">{value}</div>
    <div className="text-gray-300 text-sm">{label}</div>
  </motion.div>
);

function Stats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard icon="fas fa-satellite-dish text-blue-400" label="Total Sensors" value={stats.totalSensors} />
      <StatCard icon="fas fa-project-diagram text-green-400" label="DePIN Projects" value={stats.totalProjects} />
      <StatCard icon="fas fa-map-marker-alt text-purple-400" label="Active Locations" value={stats.activeLocations} />
      <StatCard icon="fas fa-clock text-orange-400" label="Live Monitoring" value="24/7" />
    </div>
  );
}

export default Stats;
