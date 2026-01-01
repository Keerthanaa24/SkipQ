import { useState } from "react";
import { predictRush } from "../api/rushPrediction";

const RushPrediction = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkRush = async () => {
    setLoading(true);
    try {
      const data = await predictRush("Monday", "12:45 PM");
      setResult(data);
    } catch {
      alert("Failed to get rush prediction");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Canteen Rush Predictor
      </h1>

      <button
        onClick={checkRush}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Checking..." : "Check Rush"}
      </button>

      {result && (
        <div className="mt-6 p-4 border rounded-lg">
          <p className="text-lg">
            Current Rush:{" "}
            <strong
              className={
                result.rush === "High"
                  ? "text-red-600"
                  : result.rush === "Medium"
                  ? "text-yellow-600"
                  : "text-green-600"
              }
            >
              {result.rush}
            </strong>
          </p>

          <p className="mt-2">
            ✅ Best time to order: <strong>{result.bestTime}</strong>
          </p>

          <p className="mt-1">
            ⏱️ Expected wait time: <strong>{result.waitTime}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default RushPrediction;
