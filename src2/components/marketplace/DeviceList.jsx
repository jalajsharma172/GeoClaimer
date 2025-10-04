import React from "react";
import { FaEthereum, FaDollarSign } from "react-icons/fa";
import { FaUserAstronaut, FaMapMarkerAlt, FaSatelliteDish, FaInfoCircle } from "react-icons/fa";

const dummyDevices = [
  {
    deviceId: "00:1A:2B:3C:4D:5E",
    name: "Sensor-001",
    type: "Temperature",
    location: "Delhi",
    locality: "Kota",
    latitude: "23.282",
    longitude: "-10.543",
    project: "Echonet",
    ownerAddress: "0xb5f278f22c5e5c42174fc312cc593493d2f3570d",
    status: "active",
    price: "0.5 ETH",
  },
  {
    deviceId: "11:2B:3C:4D:5E:6F",
    name: "Sensor-002",
    type: "Air Quality",
    location: "Mumbai",
    locality: "Bandra",
    latitude: "19.045",
    longitude: "72.873",
    project: "Echonet",
    ownerAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    status: "inactive",
    price: "120 USDC",
  },
];

const PriceDisplay = ({ price }) => {
  const isEth = price.includes("ETH");
  const isUsdc = price.includes("USDC");
  const icon = isEth ? <FaEthereum /> : isUsdc ? <FaDollarSign /> : null;

  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-md border border-gray-300">
      {icon}
      <span>{price}</span>
    </div>
  );
};

const shortenAddress = (address) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "N/A";

const DeviceCard = ({ device }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200">
    {/* Header */}
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <FaSatelliteDish className="text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
      </div>
      <PriceDisplay price={device.price} />
    </div>

    {/* Device Info */}
    <div className="space-y-2 text-gray-700">
      <div className="flex items-center gap-2">
        <FaInfoCircle className="text-gray-500" />
        <p className="text-sm">{device.type} Sensor</p>
      </div>

      <div className="flex items-center gap-2">
        <FaMapMarkerAlt className="text-gray-500" />
        <p className="text-sm">
          {device.locality}, {device.location}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <FaUserAstronaut className="text-gray-500" />
        <p className="font-mono text-xs text-gray-600">
          {shortenAddress(device.ownerAddress)}
        </p>
      </div>

      <div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium border ${
            device.status === "active"
              ? "bg-green-50 text-green-700 border-green-300"
              : "bg-red-50 text-red-700 border-red-300"
          }`}
        >
          {device.status.toUpperCase()}
        </span>
      </div>
    </div>

    {/* Button */}
    <button className="w-full mt-4 bg-black text-white font-medium py-2 rounded-md hover:bg-gray-800 transition-colors duration-200">
      Purchase Device
    </button>
  </div>
);

const DeviceList = () => (
  <div className="w-full max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold text-center text-gray-200 mb-8">
      DePIN Device Marketplace
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {dummyDevices.map((device) => (
        <DeviceCard key={device.deviceId} device={device} />
      ))}
    </div>
  </div>
);

export default DeviceList;
