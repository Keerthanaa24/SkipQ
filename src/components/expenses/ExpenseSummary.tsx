import React from "react";
import { Card } from "@/components/ui/card";

const ExpenseSummary = () => {
  return (
    <Card className="bg-[#0f172a] border-slate-800/50 p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-slate-200">Expense Summary</h3>
          <p className="text-xs text-slate-500">Category breakdown</p>
        </div>
        <div className="p-2 bg-[#1e293b] rounded-lg">
           <div className="w-4 h-4 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Total Spent</span>
          <span className="text-[#3b82f6] font-bold text-xl">₹315</span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-800/50 pt-4">
          <span className="text-slate-400 text-sm">Categories Used</span>
          <span className="text-[#3b82f6] font-bold">1</span>
        </div>
        
        <div className="pt-4">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">
            Category Breakdown
          </p>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300">Food & Dining</span>
            <span className="text-slate-300 font-semibold">₹315</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseSummary;