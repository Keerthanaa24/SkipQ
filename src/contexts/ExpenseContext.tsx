import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Expense } from "@/types/expense";

interface ExpenseContextType {
  expenses: Expense[];
  monthlyTotal: number;
  totalCategories: number;
  totalOrders: number; // Added to match your "Spending Insights" image
  isLoading: boolean;
  fetchMonthlyExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(
  undefined
);

// src/contexts/ExpenseContext.tsx
const MOCK_EXPENSES: Expense[] = [
  { 
    id: "1", 
    amount: 55, 
    category: "Food & Dining", 
    description: "Veg Biryani", 
    date: "2024-03-20", 
    createdAt: new Date().toISOString() 
  },
  { 
    id: "2", 
    amount: 10, 
    category: "Food & Dining", 
    description: "Tea", 
    date: "2024-03-20", 
    createdAt: new Date().toISOString() 
  },
  { 
    id: "3", 
    amount: 35, 
    category: "Food & Dining", 
    description: "Chappathi", 
    date: "2024-03-19", 
    createdAt: new Date().toISOString() 
  },
  { 
    id: "4", 
    amount: 215, 
    category: "Food & Dining", 
    description: "Lunch Combo & Others", 
    date: "2024-03-18", 
    createdAt: new Date().toISOString() 
  },
];

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initialize with the hardcoded mock data
  const [expenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [isLoading] = useState(false);

  // Total expense amount (will result in 315)
  const monthlyTotal = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Unique category count (matching your image value of 1)
  const totalCategories = new Set(
    expenses.map((expense) => expense.category)
  ).size;

  // Hardcoded count matching your "Orders This Week" image
  const totalOrders = 13; 

  const fetchMonthlyExpenses = async () => {
    // No-op since we are strictly using hardcoded data
    return Promise.resolve();
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        monthlyTotal,
        totalCategories,
        totalOrders,
        isLoading,
        fetchMonthlyExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error(
      "useExpenses must be used within an ExpenseProvider"
    );
  }
  return context;
};