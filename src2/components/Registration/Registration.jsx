import React, { useState } from 'react';
import MapPinIcon from './icons/MapPinIcon.jsx';
import GlobeIcon from './icons/GlobeIcon.jsx';
import ServerIcon from './icons/ServerIcon.jsx';
import { useRegisterDevice } from '../../hooks/UseRegisterDevice.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { Navigate, useNavigate } from 'react-router-dom';

function Registration() {
  const [latitude, setLatitude] = useState('23.901');
  const [longitude, setLongitude] = useState('-16.982');
  const [macAddress, setMacAddress] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [deviceType, setDeviceType] = useState('Sound');
  const [deviceLocation, setDeviceLocation] = useState('Delhi');
  const [locality, setLocality] = useState('Yashbhumi');
  const [dataType, setDataType] = useState('DB');
  const [projectName, setProjectName] = useState('Echonet');
  const [sectorNo,setSectorNo] = useState('24');

  const { registerDevice, isLoading, error, isSuccess } = useRegisterDevice();
  const { setIsRegistered } = useAuth();    

  const Navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerDevice({
      latitude,
      longitude,
      macAddress,
      deviceId,
      deviceType,
      deviceLocation,
      locality,
      dataType,
      projectName,
      sectorNo
    });

    if (result.success) {
      setLatitude('');
      setLongitude('');
      setMacAddress('');
      setDeviceId('');
      setDeviceType('');
      setDeviceLocation('');
      setLocality('');
      setDataType('');
      setProjectName('');
      setIsRegistered(true);
      setSectorNo('')
      Navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 to-gray-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl mx-auto p-10 space-y-8 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Register Your Device</h1>
          <p className="text-gray-400 text-lg">Provide device, project & location details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Device Details Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">Device Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Device ID"
              />
              <input
                type="text"
                required
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Device Type"
              />
              <input
                type="text"
                required
                value={deviceLocation}
                onChange={(e) => setDeviceLocation(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Device Location"
              />
              <input
                type="text"
                required
                value={sectorNo}
                onChange={(e) => setSectorNo(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Sector no"
              />
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Locality"
              />
            </div>
          </div>

          {/* Project Details Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                required
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Data Type"
              />
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Project Name"
              />
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Latitude"
                />
              </div>
              <div className="relative">
                <GlobeIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Longitude"
                />
              </div>
              <div className="relative">
                <ServerIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={macAddress}
                  onChange={(e) => setMacAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="MAC Address"
                />
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="h-5 text-center">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {isSuccess && <p className="text-green-500 text-sm">Device registered successfully!</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 font-semibold text-white bg-blue-600 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:scale-100 flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : (
              'Register Device'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Registration;
