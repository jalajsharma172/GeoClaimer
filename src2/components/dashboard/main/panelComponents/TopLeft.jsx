import React, { useMemo } from 'react';
import { useCid } from '@/context/CidContext';
import { BarChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function TopLeft() {
  const { sensorData, loading } = useCid();

  // Timport { Synapse, RPC_URLS, TOKENS } from "@filoz/synapse-sdk";ransform API data to recharts format
  const chartData = useMemo(() => {
    if (!sensorData || !Array.isArray(sensorData.data)) return [];
    return sensorData.data.map((item) => ({
      date: new Date(item.timestamp).toLocaleString(),
      decibel: parseFloat(item.decibel),
    }));
  }, [sensorData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/80 backdrop-blur-sm border border-white/20 p-3 rounded-lg shadow-lg">
          <p className="label text-gray-300">{`Date: ${label}`}</p>
          <p className="intro text-cyan-400 font-semibold">{`Decibel: ${payload[0].value} dB`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full h-64 bg-white/5 rounded-lg p-4 flex items-center justify-center">
        {loading ? (
          <div className="text-cyan-400">Loading sound data...</div>
        ) : chartData.length === 0 ? (
          <div className="text-gray-400">No sound data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" tick={{ fill: '#a0aec0' }} stroke="#a0aec0" label={{ value: 'Day', position: 'insideBottom', offset: -5, fill: '#a0aec0' }} />
              <YAxis tick={{ fill: '#a0aec0' }} stroke="#a0aec0" unit=" dB" label={{ value: 'Level (dB)', angle: -90, position: 'insideLeft', fill: '#a0aec0' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
              <Line type="monotone" dataKey="decibel" stroke="#2dd4bf" strokeWidth={3} dot={{ r: 4, fill: '#2dd4bf' }} activeDot={{ r: 6 }} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default TopLeft;
