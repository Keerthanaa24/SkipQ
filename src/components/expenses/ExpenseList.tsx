import React from "react";
import { Card } from "@/components/ui/card";

const ExpenseList = () => {
  // Hardcoded data based on your screenshots
  const hardcodedDetails = [
    { description: "Veg Biryani", qty: 1, amount: 55, time: "1:40 AM" },
    { description: "Chappathi", qty: 1, amount: 35, time: "1:10 AM" },
    { description: "Tea", qty: 1, amount: 10, time: "1:42 AM" },
  ];

  return (
    <Card className="bg-[#0f172a] border-slate-800/50 p-6 h-full">
      <h3 className="font-semibold text-slate-200 mb-6">Expense Details</h3>
      <div className="space-y-6">
        {hardcodedDetails.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-200">
                {item.description} × {item.qty}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tight">
                Ordered at {item.time}
              </p>
            </div>
            {/* Price block matching your UI style */}
            <div className="px-3 py-1 bg-[#1e293b] rounded-xl text-[#3b82f6] text-xs font-bold">
              ₹{item.amount}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ExpenseList;