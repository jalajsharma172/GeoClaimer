import React from 'react';
import { useData } from '../../context/DataContext';

function Data() {
  const { stakeData } = useData();

  if (!stakeData) return <div>No stake data available.</div>;

  // If stakeData is an array of objects
  if (Array.isArray(stakeData) && stakeData.length > 0) {
    return (
      <div>
        <h2>Stake Data</h2>
        <table>
          <thead>
            <tr>
              {Object.keys(stakeData[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stakeData.map((item, idx) => (
              <tr key={idx}>
                {Object.values(item).map((val, i) => (
                  <td key={i}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // If stakeData is a single object
  if (typeof stakeData === 'object') {
    return (
      <div>
        <h2>Stake Data</h2>
        <pre>{JSON.stringify(stakeData, null, 2)}</pre>
      </div>
    );
  }

  return <div>No stake data found.</div>;
}

export default Data;