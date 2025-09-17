import { supabase } from '@/integrations/supabase/client';
import type {
  BudgetStats,
  CategoryAllocation,
  CategoryStats,
  Expense,
  GlobalBudget
} from '@/types';

// ===== EXPENSES =====

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw new Error(`Erreur lors de la récupération des dépenses: ${error.message}`);
  }

  return data.map(expense => ({
    id: expense.id,
    date: expense.date,
    amount: expense.amount,
    category: expense.category,
    room: expense.room,
    supplier: expense.supplier,
    description: expense.description,
    invoiceUrl: expense.invoice_url || undefined,
    createdAt: expense.created_at
  }));
}

export async function saveExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      date: expense.date,
      amount: expense.amount,
      category: expense.category,
      room: expense.room,
      supplier: expense.supplier,
      description: expense.description,
      invoice_url: expense.invoiceUrl || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving expense:', error);
    throw new Error(`Erreur lors de la sauvegarde de la dépense: ${error.message}`);
  }

  return {
    id: data.id,
    date: data.date,
    amount: data.amount,
    category: data.category,
    room: data.room,
    supplier: data.supplier,
    description: data.description,
    invoiceUrl: data.invoice_url || undefined,
    createdAt: data.created_at
  };
}

export async function updateExpense(id: string, expense: Partial<Expense>): Promise<void> {
  const updateData: any = {};

  if (expense.date) updateData.date = expense.date;
  if (expense.amount !== undefined) updateData.amount = expense.amount;
  if (expense.category) updateData.category = expense.category;
  if (expense.room) updateData.room = expense.room;
  if (expense.supplier) updateData.supplier = expense.supplier;
  if (expense.description) updateData.description = expense.description;
  if (expense.invoiceUrl !== undefined) updateData.invoice_url = expense.invoiceUrl;

  const { error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating expense:', error);
    throw new Error(`Erreur lors de la mise à jour de la dépense: ${error.message}`);
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    throw new Error(`Erreur lors de la suppression de la dépense: ${error.message}`);
  }
}

// ===== HIERARCHICAL BUDGET SYSTEM =====

// Global Budgets
export async function getGlobalBudgets(): Promise<GlobalBudget[]> {
  const { data, error } = await supabase
    .from('global_budgets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching global budgets:', error);
    throw new Error(`Erreur lors de la récupération des budgets globaux: ${error.message}`);
  }

  return data.map(budget => ({
    id: budget.id,
    name: budget.name,
    totalAmount: budget.total_amount,
    createdAt: budget.created_at,
    updatedAt: budget.updated_at
  }));
}

export async function saveGlobalBudget(budget: Omit<GlobalBudget, 'id' | 'createdAt' | 'updatedAt'>): Promise<GlobalBudget> {
  const { data, error } = await supabase
    .from('global_budgets')
    .insert({
      name: budget.name,
      total_amount: budget.totalAmount
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving global budget:', error);
    throw new Error(`Erreur lors de la sauvegarde du budget global: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    totalAmount: data.total_amount,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateGlobalBudget(id: string, budget: Partial<GlobalBudget>): Promise<void> {
  const updateData: any = {};

  if (budget.name) updateData.name = budget.name;
  if (budget.totalAmount !== undefined) updateData.total_amount = budget.totalAmount;

  const { error } = await supabase
    .from('global_budgets')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating global budget:', error);
    throw new Error(`Erreur lors de la mise à jour du budget global: ${error.message}`);
  }
}

export async function deleteGlobalBudget(id: string): Promise<void> {
  const { error } = await supabase
    .from('global_budgets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting global budget:', error);
    throw new Error(`Erreur lors de la suppression du budget global: ${error.message}`);
  }
}

// Category Allocations
export async function getCategoryAllocations(globalBudgetId?: string): Promise<CategoryAllocation[]> {
  let query = supabase
    .from('category_allocations')
    .select('*')
    .order('created_at', { ascending: false });

  if (globalBudgetId) {
    query = query.eq('global_budget_id', globalBudgetId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching category allocations:', error);
    throw new Error(`Erreur lors de la récupération des allocations de catégories: ${error.message}`);
  }

  return data.map(allocation => ({
    id: allocation.id,
    globalBudgetId: allocation.global_budget_id,
    category: allocation.category,
    allocatedAmount: allocation.allocated_amount,
    createdAt: allocation.created_at,
    updatedAt: allocation.updated_at
  }));
}

export async function saveCategoryAllocation(allocation: Omit<CategoryAllocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<CategoryAllocation> {
  const { data, error } = await supabase
    .from('category_allocations')
    .insert({
      global_budget_id: allocation.globalBudgetId,
      category: allocation.category,
      allocated_amount: allocation.allocatedAmount
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving category allocation:', error);
    throw new Error(`Erreur lors de la sauvegarde de l'allocation de catégorie: ${error.message}`);
  }

  return {
    id: data.id,
    globalBudgetId: data.global_budget_id,
    category: data.category,
    allocatedAmount: data.allocated_amount,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateCategoryAllocation(id: string, allocation: Partial<CategoryAllocation>): Promise<void> {
  const updateData: any = {};

  if (allocation.category) updateData.category = allocation.category;
  if (allocation.allocatedAmount !== undefined) updateData.allocated_amount = allocation.allocatedAmount;

  const { error } = await supabase
    .from('category_allocations')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating category allocation:', error);
    throw new Error(`Erreur lors de la mise à jour de l'allocation de catégorie: ${error.message}`);
  }
}

export async function deleteCategoryAllocation(id: string): Promise<void> {
  const { error } = await supabase
    .from('category_allocations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category allocation:', error);
    throw new Error(`Erreur lors de la suppression de l'allocation de catégorie: ${error.message}`);
  }
}

// ===== BUDGET STATISTICS CALCULATION =====

export async function calculateBudgetStats(globalBudgetId: string): Promise<BudgetStats | null> {
  try {
    // 1. Récupérer le budget global
    const { data: globalBudgetData, error: globalBudgetError } = await supabase
      .from('global_budgets')
      .select('*')
      .eq('id', globalBudgetId)
      .single();

    if (globalBudgetError || !globalBudgetData) {
      console.error('Error fetching global budget:', globalBudgetError);
      return null;
    }

    const globalBudget: GlobalBudget = {
      id: globalBudgetData.id,
      name: globalBudgetData.name,
      totalAmount: globalBudgetData.total_amount,
      createdAt: globalBudgetData.created_at,
      updatedAt: globalBudgetData.updated_at
    };

    // 2. Récupérer toutes les allocations de catégories pour ce budget
    const categoryAllocations = await getCategoryAllocations(globalBudgetId);

    // 3. Récupérer toutes les dépenses
    const expenses = await getExpenses();

    // 4. Calculer les statistiques par catégorie
    const categories: CategoryStats[] = categoryAllocations.map(categoryAllocation => {
      const categoryExpenses = expenses.filter(e => e.category === categoryAllocation.category);
      const spent = categoryExpenses.reduce((sum, e) => sum + parseFloat(e.amount as any), 0);

      return {
        category: categoryAllocation.category,
        allocated: categoryAllocation.allocatedAmount,
        spent,
        remaining: categoryAllocation.allocatedAmount - spent,
        percentage: categoryAllocation.allocatedAmount > 0 ? (spent / categoryAllocation.allocatedAmount) * 100 : 0
      };
    });

    // Ajouter les dépenses sans allocation de catégorie
    const allocatedCategories = categoryAllocations.map(c => c.category);
    const unallocatedExpenses = expenses.filter(e => !allocatedCategories.includes(e.category));

    if (unallocatedExpenses.length > 0) {
      const unallocatedByCategory = unallocatedExpenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += parseFloat(expense.amount as any);
        return acc;
      }, {} as Record<string, number>);

      Object.entries(unallocatedByCategory).forEach(([category, spent]) => {
        categories.push({
          category,
          allocated: 0,
          spent,
          remaining: -spent,
          percentage: 0
        });
      });
    }

    const totalAllocated = categoryAllocations.reduce((sum, r) => sum + r.allocatedAmount, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount as any), 0);

    return {
      globalBudget,
      totalAllocated,
      totalSpent,
      totalRemaining: globalBudget.totalAmount - totalSpent,
      unallocatedAmount: globalBudget.totalAmount - totalAllocated,
      categories
    };

  } catch (error) {
    console.error('Error calculating budget stats:', error);
    throw new Error(`Erreur lors du calcul des statistiques: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}