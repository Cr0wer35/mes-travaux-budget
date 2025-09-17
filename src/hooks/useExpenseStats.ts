import { useMemo, useEffect, useState } from 'react';
import { getExpenses, getBudgets } from '@/lib/supabase';
import type { ExpenseStats, Expense, Budget } from '@/types';

export function useExpenseStats(): ExpenseStats & { loading: boolean; error: string | null } {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [expensesData, budgetsData] = await Promise.all([
          getExpenses(),
          getBudgets()
        ]);
        setExpenses(expensesData);
        setBudgets(budgetsData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return useMemo(() => {

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const globalBudget = budgets.find(b => b.type === 'global');
    const totalBudget = globalBudget?.amount || 0;
    
    const remainingBudget = totalBudget - totalSpent;
    const budgetUsedPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Calculate by category
    const byCategory: Record<string, { spent: number; budget: number }> = {};
    expenses.forEach(expense => {
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = { spent: 0, budget: 0 };
      }
      byCategory[expense.category].spent += expense.amount;
    });

    budgets.filter(b => b.type === 'category').forEach(budget => {
      if (budget.category && !byCategory[budget.category]) {
        byCategory[budget.category] = { spent: 0, budget: 0 };
      }
      if (budget.category) {
        byCategory[budget.category].budget = budget.amount;
      }
    });

    // Calculate by room
    const byRoom: Record<string, { spent: number; budget: number }> = {};
    expenses.forEach(expense => {
      if (!byRoom[expense.room]) {
        byRoom[expense.room] = { spent: 0, budget: 0 };
      }
      byRoom[expense.room].spent += expense.amount;
    });

    budgets.filter(b => b.type === 'room').forEach(budget => {
      if (budget.room && !byRoom[budget.room]) {
        byRoom[budget.room] = { spent: 0, budget: 0 };
      }
      if (budget.room) {
        byRoom[budget.room].budget = budget.amount;
      }
    });

    return {
      totalSpent,
      totalBudget,
      remainingBudget,
      budgetUsedPercentage,
      byCategory,
      byRoom,
      loading,
      error
    };
  }, [expenses, budgets, loading, error]);
}