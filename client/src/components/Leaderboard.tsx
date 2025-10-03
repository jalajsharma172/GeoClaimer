// import { useEffect, useState } from "react";
// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "YOUR_SUPABASE_URL";
// const supabaseKey = "YOUR_SUPABASE_ANON_KEY";
// const supabase = createClient(supabaseUrl, supabaseKey);

// interface LeaderboardRow {
//   id: number;
//   username: string;
//   nft_count: number;
// }

// export default function Leaderboard() {
//   const [rows, setRows] = useState<LeaderboardRow[]>([]);
//   const [loading, setLoading] = useState(true);

// try{
//     useEffect(() => {
//     async function fetchLeaderboard() {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from("leaderboard")
//         .select("id,username,nft_count")
//         .order("nft_count", { ascending: false });
//       if (!error && data) {
//         setRows(data);
//       }
//       setLoading(false);
//     }
//     fetchLeaderboard();
//   }, []);
// }catch(err){
//   console.error("Error fetching leaderboard:", err);
//   setLoading(false);
// }

//   return (
//     <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
//       <h1 className="text-2xl font-bold text-blue-800 mb-6">Leaderboard</h1>
//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-blue-100">
//             <th className="py-2 px-4 border">Serial Number</th>
//             <th className="py-2 px-4 border">User Name</th>
//             <th className="py-2 px-4 border">Number of NFTs</th>
//           </tr>
//         </thead>
//         <tbody>
//           {loading ? (
//             <tr>
//               <td colSpan={3} className="text-center py-6">Loading...</td>
//             </tr>
//           ) : rows.length === 0 ? (
//             <tr>
//               <td colSpan={3} className="text-center py-6">No data found.</td>
//             </tr>
//           ) : (
//             rows.map((row, idx) => (
//               <tr key={row.id} className="hover:bg-blue-50">
//                 <td className="py-2 px-4 border">{idx + 1}</td>
//                 <td className="py-2 px-4 border">{row.username}</td>
//                 <td className="py-2 px-4 border">{row.nft_count}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }