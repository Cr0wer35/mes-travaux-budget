import { Expense, Budget } from '@/types';

const STORAGE_KEYS = {
  EXPENSES: 'renovation_expenses',
  BUDGETS: 'renovation_budgets',
} as const;

// Expenses
export const getExpenses = (): Expense[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  return stored ? JSON.parse(stored) : [];
};

export const saveExpense = (expense: Expense): void => {
  const expenses = getExpenses();
  const existingIndex = expenses.findIndex(e => e.id === expense.id);
  
  if (existingIndex >= 0) {
    expenses[existingIndex] = expense;
  } else {
    expenses.push(expense);
  }
  
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const deleteExpense = (id: string): void => {
  const expenses = getExpenses().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

// Budgets
export const getBudgets = (): Budget[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  return stored ? JSON.parse(stored) : [];
};

export const saveBudget = (budget: Budget): void => {
  const budgets = getBudgets();
  const existingIndex = budgets.findIndex(b => b.id === budget.id);
  
  if (existingIndex >= 0) {
    budgets[existingIndex] = budget;
  } else {
    budgets.push(budget);
  }
  
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
};

export const deleteBudget = (id: string): void => {
  const budgets = getBudgets().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
};