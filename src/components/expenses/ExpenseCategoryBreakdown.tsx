import React from "react";

const ExpenseCategoryBreakdown: React.FC = () => {
  return (
    <div className="dashboard-card">
      <h3 className="font-semibold mb-4">Category Breakdown</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Breakfast</span>
          <span className="font-semibold">₹45</span>
        </div>

        <div className="flex justify-between">
          <span>Beverages</span>
          <span className="font-semibold">₹65</span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategoryBreakdown;
