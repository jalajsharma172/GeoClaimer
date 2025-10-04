import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Stats from "../components/hyperGraph/Stats";
import Discovery from "../components/hyperGraph/Discovery";
import LiveFeed from "../components/hyperGraph/LiveFeed";
import SuccessModal from "../components/hyperGraph/SuccessModal";

const API_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [stats, setStats] = useState({ totalSensors: 0, totalProjects: 0, activeLocations: 0 });
  const [liveFeedSensors, setLiveFeedSensors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [discoveryResults, setDiscoveryResults] = useState(null);

  const fetchSensors = useCallback(async () => {
    try {
      const response = await axios.get(API_URL+'/api/hypergraph');
      if (response.data.success) {
        const sensors = response.data.sensors;
        setStats({
          totalSensors: sensors.length,
          totalProjects: new Set(sensors.map((s) => s.project)).size,
          activeLocations: new Set(sensors.map((s) => s.location)).size,
        });
        setLiveFeedSensors(sensors.slice(0, 6));
      }
    } catch (error) {
      console.error("Failed to fetch sensors:", error);
    }
  }, []);

  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 30000);
    return () => clearInterval(interval);
  }, [fetchSensors]);

  const handleSearch = async (location, type) => {
    try {
      console.log(`Searching for location: ${location}, type: ${type}`);
      
      const response = await axios.get(`${API_URL}?location=${location}&type=${type}`);

      console.log("Search response:", response.data);
      
      if (response.data.success) setDiscoveryResults(response.data.sensors);
    } catch (error) {
      alert(`Search failed: ${error.message}`);
    }
  };

  const handleDelete = async (sensorId, sensorName) => {
    if (!window.confirm(`Delete "${sensorName}"?`)) return;
    try {
      await axios.delete(`${API_URL}/${sensorId}`);
      fetchSensors();
      if (discoveryResults) {
        setDiscoveryResults((prev) => prev.filter((s) => s.id !== sensorId));
      }
    } catch (error) {
      alert(`Failed to delete sensor: ${error.message}`);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center overflow-y-auto">
      <div className="w-[90%] md:w-[85%] lg:w-[80%] max-w-7xl min-h-screen pt-20">
        <main className="container mx-auto px-4 py-10 space-y-10">
          {/* Grid Section */}
          <div className="grid grid-cols-1 gap-10">
            <Stats stats={stats} />
            <Discovery onSearch={handleSearch} results={discoveryResults} onDelete={handleDelete} />
            <LiveFeed sensors={liveFeedSensors} onDelete={handleDelete} />
          </div>
        </main>
        <SuccessModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          message={modalMessage}
        />
      </div>
    </div>
  );
}

export default App;
