import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Use your actual Supabase credentials from .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY ;

const supabase = createClient(supabaseUrl, supabaseKey);

interface LeaderboardRow {
  id: number;
  username: string;
  nft_count: number;
}

export default function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
    const { data, error } = await supabase
      .from("NFT")
      .select("*"); // Select all columns

      console.log(data);
      if (error) {
        console.error("Error fetching leaderboard:", error.message);
        setRows([]);
      } else if (data) {
        setRows(data);
         console.log("Got Data from Supabase:", data);
      } else {
        setRows([]);
        console.log("No data returned from Supabase");
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Leaderboard</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-100">
            <th className="py-2 px-4 border">Serial Number</th>
            <th className="py-2 px-4 border">User Name</th>
            <th className="py-2 px-4 border">Number of NFTs</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} className="text-center py-6">Loading...</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-6">No data found.</td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-blue-50">
                <td className="py-2 px-4 border">{idx + 1}</td>
                <td className="py-2 px-4 border">{row.username}</td>
                <td className="py-2 px-4 border">{row.nft_count}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}