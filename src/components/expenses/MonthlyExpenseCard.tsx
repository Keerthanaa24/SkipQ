import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const MonthlyExpenseCard = () => {
  return (
    <Card className="bg-[#0f172a] border-slate-800/50 p-6 h-full flex flex-col justify-between min-h-[180px]">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-200">Monthly Expenses</h3>
          <p className="text-xs text-slate-500">Current month total</p>
        </div>
        <div className="p-2 bg-[#1e293b] rounded-lg">
          <TrendingUp className="w-4 h-4 text-[#3b82f6]" />
        </div>
      </div>
      
      {/* Filled with hardcoded values instead of bars */}
      <div className="space-y-1 mb-2">
        <p className="text-3xl font-bold text-[#3b82f6]">₹315</p>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          Top Item: Veg Biryani
        </p>
      </div>
    </Card>
  );
};

export default MonthlyExpenseCard;