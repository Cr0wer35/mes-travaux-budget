import { useMemo } from 'react';
import { Expense, Budget, ExpenseStats } from '@/types';
import { getExpenses, getBudgets } from '@/lib/storage';

export function useExpenseStats(): ExpenseStats {
  return useMemo(() => {
    const expenses = getExpenses();
    const budgets = getBudgets();

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
    };
  }, []);
}