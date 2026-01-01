export interface Expense {
  id: string;
  userId?: string;
  date: string;
  amount: number;
  category: string;
  createdAt: string;
  description: string;
}

export interface MonthlySummary {
  month: string;
  total: number;
  categories: Record<string, number>;
  dailyAverage: number;
}
