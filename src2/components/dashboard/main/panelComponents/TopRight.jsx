import React from 'react'
import { useAuth } from '@/context/AuthContext';

const WifiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M1.394 8.536a15 15 0 0121.212 0" />
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const LocationMarkerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

function TopRight() {
  const {walletAddress} = useAuth();

  const deviceData = {
    macAddress: '00:1A:2B:3C:4D:5E',
    installationDate: '2024-09-15',
    echoGenerated: 1472.88,
    latitude: 28.6139,
    longitude: 77.2090
  };

  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="font-semibold text-white tracking-wider">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col gap-6">
      <InfoRow icon={<WifiIcon />} label="MAC Address" value={deviceData.macAddress} />
      <InfoRow icon={<CalendarIcon />} label="Installation Date" value={deviceData.installationDate} />
      <InfoRow icon={<ZapIcon />} label="Echo Generated" value={`${deviceData.echoGenerated.toLocaleString()} EC`} />
      <InfoRow icon={<LocationMarkerIcon />} label="Current Location" value={`${deviceData.latitude.toFixed(4)}° N, ${deviceData.longitude.toFixed(4)}° E`} />
    </div>
  );
}

export default TopRight