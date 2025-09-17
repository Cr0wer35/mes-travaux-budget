import { getExpenses } from '@/lib/storage';
import { getBudgets } from '@/lib/supabase';
import { ExpenseStats } from '@/types';
import { useEffect, useState } from 'react';

export function useExpenseStats() {
  const [stats, setStats] = useState<ExpenseStats>({
    totalSpent: 0,
    totalBudget: 0,
    remainingBudget: 0,
    budgetUsedPercentage: 0,
    byCategory: {},
    byRoom: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [expenses, budgets] = await Promise.all([
          getExpenses(),
          getBudgets()
        ]);

        const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
        const remainingBudget = totalBudget - totalSpent;
        const budgetUsedPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        // Calculate by category
        const byCategory: Record<string, { spent: number; budget: number }> = {};

        // Initialize with budgets
        budgets.forEach(budget => {
          if (budget.type === 'category' && budget.category) {
            if (!byCategory[budget.category]) {
              byCategory[budget.category] = { spent: 0, budget: 0 };
            }
            byCategory[budget.category].budget += budget.amount;
          }
        });

        // Add expenses
        expenses.forEach(expense => {
          if (!byCategory[expense.category]) {
            byCategory[expense.category] = { spent: 0, budget: 0 };
          }
          byCategory[expense.category].spent += expense.amount;
        });

        // Calculate by room
        const byRoom: Record<string, { spent: number; budget: number }> = {};

        // Initialize with budgets
        budgets.forEach(budget => {
          if (budget.type === 'room' && budget.room) {
            if (!byRoom[budget.room]) {
              byRoom[budget.room] = { spent: 0, budget: 0 };
            }
            byRoom[budget.room].budget += budget.amount;
          }
        });

        // Add expenses
        expenses.forEach(expense => {
          if (!byRoom[expense.room]) {
            byRoom[expense.room] = { spent: 0, budget: 0 };
          }
          byRoom[expense.room].spent += expense.amount;
        });

        setStats({
          totalSpent,
          totalBudget,
          remainingBudget,
          budgetUsedPercentage,
          byCategory,
          byRoom
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
        console.error('Error loading expense stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const refresh = () => {
    const loadStats = async () => {
      try {
        setError(null);

        const [expenses, budgets] = await Promise.all([
          getExpenses(),
          getBudgets()
        ]);

        const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
        const remainingBudget = totalBudget - totalSpent;
        const budgetUsedPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        // Calculate by category
        const byCategory: Record<string, { spent: number; budget: number }> = {};

        // Initialize with budgets
        budgets.forEach(budget => {
          if (budget.type === 'category' && budget.category) {
            if (!byCategory[budget.category]) {
              byCategory[budget.category] = { spent: 0, budget: 0 };
            }
            byCategory[budget.category].budget += budget.amount;
          }
        });

        // Add expenses
        expenses.forEach(expense => {
          if (!byCategory[expense.category]) {
            byCategory[expense.category] = { spent: 0, budget: 0 };
          }
          byCategory[expense.category].spent += expense.amount;
        });

        // Calculate by room
        const byRoom: Record<string, { spent: number; budget: number }> = {};

        // Initialize with budgets
        budgets.forEach(budget => {
          if (budget.type === 'room' && budget.room) {
            if (!byRoom[budget.room]) {
              byRoom[budget.room] = { spent: 0, budget: 0 };
            }
            byRoom[budget.room].budget += budget.amount;
          }
        });

        // Add expenses
        expenses.forEach(expense => {
          if (!byRoom[expense.room]) {
            byRoom[expense.room] = { spent: 0, budget: 0 };
          }
          byRoom[expense.room].spent += expense.amount;
        });

        setStats({
          totalSpent,
          totalBudget,
          remainingBudget,
          budgetUsedPercentage,
          byCategory,
          byRoom
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
        console.error('Error loading expense stats:', err);
      }
    };

    loadStats();
  };

  return {
    ...stats,
    loading,
    error,
    refresh
  };
}