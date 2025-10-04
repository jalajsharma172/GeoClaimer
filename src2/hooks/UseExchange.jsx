import { useState, useCallback } from "react";

export const useExchange = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [response, setResponse] = useState(null);

  const convert = useCallback(async (fromCurrency, toCurrency, amount) => {
    setIsConverting(true);
    setResponse(null);

    try {
      // Simulate async request (replace with real API call if needed)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response data
      const result = {
        success: true,
        message: `Converted ${amount} ${fromCurrency} to ${toCurrency} successfully.`,
        timestamp: new Date().toISOString(),
      };

      setResponse(result);
      return result;
    } catch (error) {
      const errorResponse = {
        success: false,
        message: "Conversion failed. Please try again.",
      };
      setResponse(errorResponse);
      return errorResponse;
    } finally {
      setIsConverting(false);
    }
  }, []);

  return { isConverting, response, convert };
};
