import React from "react";
import { Timer } from "lucide-react"; // Matching the clock/timer icon from the screenshot
import { Card } from "@/components/ui/card";

const ExpenseQuickStats: React.FC = () => {
  return (
    <Card className="bg-[#0f172a] border-slate-800/50 p-6 h-full text-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <Timer className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-semibold">Quick Stats</h3>
      </div>

      <div className="space-y-4 text-sm">
        {/* Total Orders - Matching image values */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Total Orders</span>
          <span className="font-bold text-lg">13</span>
        </div>

        {/* This Month - Matching image values */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">This Month</span>
          <span className="font-bold text-lg">13</span>
        </div>

        {/* Total Spent - Highlighting the blue price as seen in reference */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
          <span className="text-slate-400">Total Spent</span>
          <span className="font-bold text-xl text-[#3b82f6]">₹315</span>
        </div>

        {/* Favorite Counter - Extra insight from your insights bar */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-400">Favorite Counter</span>
          <span className="font-bold text-[#3b82f6]">Counter B</span>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseQuickStats;