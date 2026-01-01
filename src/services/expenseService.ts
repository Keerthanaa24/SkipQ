import { Expense } from '@/types/expense';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CreateExpenseData {
  userId: string;
  amount: number;
  category: string;
  description: string;
  date?: string;
}

export const getMonthlyExpenses = async (userId: string): Promise<Expense[]> => {
  try {
    const expenseQuery = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(expenseQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate() || new Date();
      return {
        id: doc.id,
        userId: data.userId,
        date: data.date || createdAt.toLocaleDateString('en-IN'),
        amount: data.amount || 0,
        category: data.category || 'Other',
        createdAt: createdAt.toISOString(),
        description: data.description || 'Expense',
      };
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

export const createExpense = async (data: CreateExpenseData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...data,
      createdAt: serverTimestamp(),
      date: data.date || new Date().toISOString().split('T')[0],
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

export const getExpenseCategories = (): string[] => {
  return [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Education',
    'Healthcare',
    'Bills & Utilities',
    'Other'
  ];
};
