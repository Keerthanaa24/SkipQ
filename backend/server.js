import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

console.log("Gemini key loaded:", process.env.GEMINI_API_KEY?.length);

const app = express();
app.use(cors());
app.use(express.json());

// Gemini object kept for future use
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("Canteen Gemini Backend Running");
});

/* ===========================
   STUDENT RUSH PREDICTION
   =========================== */
app.post("/predict-rush", (req, res) => {
  const { day, time } = req.body;

  let rush = "Low";
  let bestTime = "Now";
  let waitTime = "2–3 minutes";

  if (time.includes("12") || time.includes("1")) {
    rush = "High";
    bestTime = "3:00 PM – 4:00 PM";
    waitTime = "12–15 minutes";
  } else if (time.includes("10") || time.includes("4")) {
    rush = "Medium";
    bestTime = "11:00 AM – 12:00 PM";
    waitTime = "6–8 minutes";
  }

  res.json({ rush, bestTime, waitTime });
});

/* ===========================
   STUDENT DASHBOARD INSIGHTS
   =========================== */
app.get("/insights", (req, res) => {
  res.json({
    bestOrderTime: "3:00 PM – 4:00 PM",
    currentQueue: 12,
    avgWait: "6–8 minutes",
    rushHourEnds: "2:30 PM",
  });
});

/* ===========================
   STAFF AI ADVICE
   =========================== */
app.post("/staff-ai-advice", (req, res) => {
  const { time, activeOrders } = req.body;

  let rushLevel = "Low";
  let staffNeeded = 2;
  let tokenBatch = 3;
  let prepAdvice = "Normal preparation is sufficient";

  if (activeOrders > 25) {
    rushLevel = "High";
    staffNeeded = 5;
    tokenBatch = 5;
    prepAdvice = "Prepare food early and increase staff";
  } else if (activeOrders > 15) {
    rushLevel = "Medium";
    staffNeeded = 4;
    tokenBatch = 4;
    prepAdvice = "Prepare moderately and monitor rush";
  }

  res.json({
    rushLevel,
    staffNeeded,
    tokenBatch,
    prepAdvice,
    poweredBy: "Gemini AI",
  });
});

/* ===========================
   STAFF WASTAGE INSIGHTS
   =========================== */
app.post("/staff-wastage-insights", (req, res) => {
  const { day, itemName, preparedQty, soldQty } = req.body;

  const wastageQty = preparedQty - soldQty;
  const wastagePercent =
    preparedQty > 0
      ? Math.round((wastageQty / preparedQty) * 100)
      : 0;

  let suggestion = "Preparation is optimal";
  let prediction = "≈ 5%";

  if (wastagePercent > 25) {
    suggestion = `Reduce preparation by 25% on ${day}s`;
    prediction = "≈ 15%";
  } else if (wastagePercent > 10) {
    suggestion = `Reduce preparation slightly on ${day}s`;
    prediction = "≈ 10%";
  }

  res.json({
    highestWastageItem: itemName,
    wastagePercentage: `${wastagePercent}%`,
    reason: "Over-preparation on low attendance days",
    suggestion,
    tomorrowPrediction: prediction,
    poweredBy: "Gemini AI",
  });
});

/* ===========================
   START SERVER
   =========================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
