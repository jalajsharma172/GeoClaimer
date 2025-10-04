import React from 'react';

const DetailRow = ({ label, value, isMono = false }) => (
    <div className="flex justify-between">
        <span className="text-white">{label}:</span>
        <span className={isMono ? "font-mono text-white" : "text-white"}>{value || "N/A"}</span>
    </div>
);

function SensorCard({ device, onDelete, isSearchResult = false }) {
    const cardClasses = isSearchResult
        ? `p-4 rounded-lg border-l-4 bg-black border-white/20 ${device.isYours ? "border-green-500" : "border-blue-500"}`
        : "sensor-card p-4 rounded-lg card-hover bg-black border border-white/20";

    return (
        <div className={cardClasses}>
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-white text-sm truncate">{device.name}</h4>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-400">Live</span>
                    </div>
                    <button onClick={() => onDelete(device.id, device.name)} className="bg-red-500 hover:bg-red-600 text-white text-xs px-1 py-1 rounded transition-colors" title="Delete sensor">
                        <i className="fas fa-trash">Delete</i>
                    </button>
                </div>
            </div>
            <div className="space-y-2 text-xs">
                <DetailRow label="Type" value={device.type} />
                <DetailRow label="Data Type" value={device.dataType} />
                <DetailRow label="Project" value={device.project} />
                <DetailRow label="Locality" value={device.locality} />
                <DetailRow label="Coordinates" value={`${device.latitude}, ${device.longitude}`} isMono={true} />
                <div className="flex justify-between items-center">
                    <span className="text-white">Owner:</span>
                    <span className="font-mono text-xs break-all truncate text-white" title={device.ownerAddress}>{device.ownerAddress}</span>
                </div>
                {device.hypergraphEntityId && (
                     <div className="flex justify-between items-center">
                        <span className="text-white">Entity ID:</span>
                        <span className="font-mono text-xs break-all truncate text-white" title={device.hypergraphEntityId}>{device.hypergraphEntityId}</span>
                    </div>
                )}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-700">
                <div className="flex items-center text-xs text-white">
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    <span>{device.location}</span>
                </div>
            </div>
        </div>
    );
}

export default SensorCard;