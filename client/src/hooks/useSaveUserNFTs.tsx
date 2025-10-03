import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

type UserNFTData = {
  UserName: string;
  NumberOfNFTs: number;
};

export function useSaveUserNFTs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Call this function with your JSON data
  const saveUserNFTs = async (data: UserNFTData) => {
    setLoading(true);
    setError(null);

    // Generate a serial number (could be UUID, timestamp, or auto-increment in DB)
    const serialNumber = Date.now(); // Simple example

    const { error: supabaseError } = await supabase.from("NFT").insert([
        {
          serial_number: serialNumber,
          user_name: data.UserName,
          number_of_nfts: data.NumberOfNFTs,
        },
      ]);

    if (supabaseError) {
      setError(supabaseError.message);
    }

    setLoading(false);
  };

  return { saveUserNFTs, loading, error };
}