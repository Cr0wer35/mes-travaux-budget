// Ce fichier fait maintenant office de proxy vers les services Supabase
// Il maintient la compatibilité avec l'ancien code tout en utilisant Supabase

import {
  BudgetStats,
  CategoryAllocation,
  Expense,
  GlobalBudget,
} from '@/types';

import * as supabaseService from './supabase';

// ===== EXPENSES =====

export const getExpenses = (): Promise<Expense[]> => {
  return supabaseService.getExpenses();
};

export const saveExpense = (expense: Expense): Promise<void> => {
  if (expense.id) {
    // Si l'expense a un ID, c'est une mise à jour
    return supabaseService.updateExpense(expense.id, expense);
  } else {
    // Sinon c'est une création
    return supabaseService.saveExpense(expense).then(() => { });
  }
};

export const deleteExpense = (id: string): Promise<void> => {
  return supabaseService.deleteExpense(id);
};

// ===== HIERARCHICAL BUDGET SYSTEM =====

// Global Budgets
export const getGlobalBudgets = (): Promise<GlobalBudget[]> => {
  return supabaseService.getGlobalBudgets();
};

export const saveGlobalBudget = (budget: GlobalBudget): Promise<void> => {
  if (budget.id) {
    return supabaseService.updateGlobalBudget(budget.id, budget);
  } else {
    return supabaseService.saveGlobalBudget(budget).then(() => { });
  }
};

export const deleteGlobalBudget = (id: string): Promise<void> => {
  return supabaseService.deleteGlobalBudget(id);
};

// Category Allocations
export const getCategoryAllocations = (globalBudgetId?: string): Promise<CategoryAllocation[]> => {
  return supabaseService.getCategoryAllocations(globalBudgetId);
};

export const saveCategoryAllocation = (allocation: CategoryAllocation): Promise<void> => {
  if (allocation.id) {
    return supabaseService.updateCategoryAllocation(allocation.id, allocation);
  } else {
    return supabaseService.saveCategoryAllocation(allocation).then(() => { });
  }
};

export const deleteCategoryAllocation = (id: string): Promise<void> => {
  return supabaseService.deleteCategoryAllocation(id);
};

// ===== BUDGET STATISTICS =====

export const calculateBudgetStats = (globalBudgetId: string): Promise<BudgetStats | null> => {
  return supabaseService.calculateBudgetStats(globalBudgetId);
};