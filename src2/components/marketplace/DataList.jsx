import React from "react";
import decibelData from "../../DummyData/decibelData.json";
import { BsSoundwave } from "react-icons/bs";
import { FaUserAstronaut } from "react-icons/fa";

const DataCard = ({ dataPoint, handleBuyData, loading, isSubscribed }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200">
    {/* Header */}
    <div className="flex justify-between items-center mb-4">
      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded border border-gray-300">
        {dataPoint.deviceId}
      </span>
      <span className="text-gray-500 text-xs">
        {new Date(dataPoint.timeline).toLocaleDateString()}
      </span>
    </div>

    {/* Decibel Info */}
    <div className="text-center my-6">
      <BsSoundwave className="text-gray-700 text-4xl mx-auto mb-3" />
      <p className="text-5xl font-bold text-gray-900">
        {dataPoint.data.decibel}
        <span className="text-2xl text-gray-500 align-text-top ml-1">dB</span>
      </p>
      <p className="text-sm text-gray-500 mt-1">Decibel Level</p>
    </div>

    {/* Owner Info */}
    <div className="flex items-center gap-2 text-gray-700 border-t border-gray-200 pt-4">
      <FaUserAstronaut className="text-gray-500 text-lg" />
      <p className="font-mono text-xs break-all text-gray-600">
        {dataPoint.owner}
      </p>
    </div>

    {/* Purchase Button */}
    <button
      onClick={() => !isSubscribed && handleBuyData(dataPoint)}
      className={`w-full mt-6 font-medium py-2 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
        isSubscribed
          ? "bg-green-600 text-white cursor-default"
          : loading
          ? "bg-black text-white opacity-60 cursor-not-allowed"
          : "bg-black text-white hover:bg-gray-800"
      }`}
      disabled={loading || isSubscribed}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : isSubscribed ? (
        "✓ Subscribed"
      ) : (
        "Purchase Data"
      )}
    </button>
  </div>
);

const DataList = ({ handleBuyData, loadingId, subscribedItems }) => (
  <div className="w-full max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold text-center text-gray-200 mb-8">
      Data Stream Marketplace
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {decibelData.map((item) => (
        <DataCard
          key={item.id}
          dataPoint={item}
          handleBuyData={handleBuyData}
          loading={loadingId === item.id}
          isSubscribed={subscribedItems?.has(item.id)}
        />
      ))}
    </div>
  </div>
);

export default DataList;
