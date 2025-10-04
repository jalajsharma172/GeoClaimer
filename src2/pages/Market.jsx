import React, { useState, useEffect } from "react";
import DeviceList from "../components/marketplace/DeviceList.jsx";
import DataList from "../components/marketplace/DataList.jsx";
import { ChevronDown } from "lucide-react";

const Market = () => {
  const [selectedMarketplace, setSelectedMarketplace] = useState("data");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [subscribedItems, setSubscribedItems] = useState(new Set());
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  const marketplaceOptions = [
    { value: "devices", label: "Devices" },
    { value: "data", label: "Data Streams" },
  ];

  // useEffect to handle successful purchases
  useEffect(() => {
    if (purchaseSuccess) {
      setSubscribedItems(prev => new Set([...prev, purchaseSuccess]));
      setPurchaseSuccess(null);
    }
  }, [purchaseSuccess]);

  const handleBuyData = async (dataPoint) => {
    setLoadingId(dataPoint.id);
    console.log("Device id :", dataPoint.deviceId);
    console.log("Owner Address :", dataPoint.owner);
    
    let success = false;
    let attempts = 0;

    while (!success && attempts < 30) {
      try {
        const response = await fetch("http://82.177.167.151:5002/market/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId: dataPoint.deviceId,
            ownerAddress: dataPoint.owner,
            priceAmount: "0.01" // you can make this dynamic too
          }),
        });

        if (!response.ok) throw new Error("API call failed");

        const result = await response.json();
        console.log("Purchase API Response:", result);

        if (result.success) {
          setPurchaseSuccess(dataPoint.id);
          success = true;
        } else {
          attempts++;
          await new Promise(res => setTimeout(res, 2000));
        }
      } catch (error) {
        console.error("Purchase API Error:", error);
        attempts++;
        await new Promise(res => setTimeout(res, 2000));
      }
    }

    if (!success) {
      alert("Purchase failed after multiple attempts.");
    }

    setLoadingId(null);
  };


  return (
    <div className="bg-black min-h-screen">
      <div className="container mx-auto w-[90%] md:w-[85%] lg:w-[80%] max-w-7xl pt-28">
        {/* Marketplace Selector */}
        <div className="relative mb-8">
          <button
            className="flex items-center justify-between w-full bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-md border border-gray-700 hover:bg-neutral-800 transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-lg font-semibold">
              {marketplaceOptions.find((opt) => opt.value === selectedMarketplace)?.label}
            </span>
            <ChevronDown className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute mt-2 w-full bg-neutral-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
              {marketplaceOptions.map((option) => (
                <button
                  key={option.value}
                  className={`w-full text-left px-5 py-3 text-white hover:bg-neutral-700 transition-colors ${selectedMarketplace === option.value ? "bg-neutral-800" : ""
                    }`}
                  onClick={() => {
                    setSelectedMarketplace(option.value);
                    setIsDropdownOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Marketplace Content */}
        <div className="bg-neutral-950 p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-700">
          {selectedMarketplace === "devices" && <DeviceList />}
          {selectedMarketplace === "data" && <DataList handleBuyData={handleBuyData} loadingId={loadingId} subscribedItems={subscribedItems} />}
        </div>
      </div>
    </div>
  );
};

export default Market;
