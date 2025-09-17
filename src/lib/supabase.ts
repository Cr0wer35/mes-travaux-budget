import { supabase } from '@/integrations/supabase/client';
import type {
  Budget,
  BudgetStats,
  CategoryAllocation,
  CategoryStats,
  Expense,
  GlobalBudget,
  RoomAllocation,
  RoomStats
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

// ===== LEGACY BUDGETS =====

export async function getBudgets(): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budgets:', error);
    throw new Error(`Erreur lors de la récupération des budgets: ${error.message}`);
  }

  return data.map(budget => ({
    id: budget.id,
    type: budget.type as 'global' | 'category' | 'room',
    name: budget.name,
    amount: budget.amount,
    category: budget.category || undefined,
    room: budget.room || undefined,
    createdAt: budget.created_at
  }));
}

export async function saveBudget(budget: Omit<Budget, 'id' | 'createdAt'>): Promise<Budget> {
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      type: budget.type,
      name: budget.name,
      amount: budget.amount,
      category: budget.category || null,
      room: budget.room || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving budget:', error);
    throw new Error(`Erreur lors de la sauvegarde du budget: ${error.message}`);
  }

  return {
    id: data.id,
    type: data.type as 'global' | 'category' | 'room',
    name: data.name,
    amount: data.amount,
    category: data.category || undefined,
    room: data.room || undefined,
    createdAt: data.created_at
  };
}

export async function updateBudget(id: string, budget: Partial<Budget>): Promise<void> {
  const updateData: any = {};

  if (budget.type) updateData.type = budget.type;
  if (budget.name) updateData.name = budget.name;
  if (budget.amount !== undefined) updateData.amount = budget.amount;
  if (budget.category !== undefined) updateData.category = budget.category;
  if (budget.room !== undefined) updateData.room = budget.room;

  const { error } = await supabase
    .from('budgets')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating budget:', error);
    throw new Error(`Erreur lors de la mise à jour du budget: ${error.message}`);
  }
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting budget:', error);
    throw new Error(`Erreur lors de la suppression du budget: ${error.message}`);
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
  // Les allocations seront supprimées automatiquement grâce à ON DELETE CASCADE
  const { error } = await supabase
    .from('global_budgets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting global budget:', error);
    throw new Error(`Erreur lors de la suppression du budget global: ${error.message}`);
  }
}

// Room Allocations
export async function getRoomAllocations(globalBudgetId?: string): Promise<RoomAllocation[]> {
  let query = supabase
    .from('room_allocations')
    .select('*')
    .order('created_at', { ascending: false });

  if (globalBudgetId) {
    query = query.eq('global_budget_id', globalBudgetId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching room allocations:', error);
    throw new Error(`Erreur lors de la récupération des allocations de pièces: ${error.message}`);
  }

  return data.map(allocation => ({
    id: allocation.id,
    globalBudgetId: allocation.global_budget_id,
    room: allocation.room,
    allocatedAmount: allocation.allocated_amount,
    createdAt: allocation.created_at,
    updatedAt: allocation.updated_at
  }));
}

export async function saveRoomAllocation(allocation: Omit<RoomAllocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoomAllocation> {
  const { data, error } = await supabase
    .from('room_allocations')
    .insert({
      global_budget_id: allocation.globalBudgetId,
      room: allocation.room,
      allocated_amount: allocation.allocatedAmount
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving room allocation:', error);
    throw new Error(`Erreur lors de la sauvegarde de l'allocation de pièce: ${error.message}`);
  }

  return {
    id: data.id,
    globalBudgetId: data.global_budget_id,
    room: data.room,
    allocatedAmount: data.allocated_amount,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateRoomAllocation(id: string, allocation: Partial<RoomAllocation>): Promise<void> {
  const updateData: any = {};

  if (allocation.room) updateData.room = allocation.room;
  if (allocation.allocatedAmount !== undefined) updateData.allocated_amount = allocation.allocatedAmount;

  const { error } = await supabase
    .from('room_allocations')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating room allocation:', error);
    throw new Error(`Erreur lors de la mise à jour de l'allocation de pièce: ${error.message}`);
  }
}

export async function deleteRoomAllocation(id: string): Promise<void> {
  // Les allocations de catégories seront supprimées automatiquement grâce à ON DELETE CASCADE
  const { error } = await supabase
    .from('room_allocations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting room allocation:', error);
    throw new Error(`Erreur lors de la suppression de l'allocation de pièce: ${error.message}`);
  }
}

// Category Allocations
export async function getCategoryAllocations(roomAllocationId?: string): Promise<CategoryAllocation[]> {
  let query = supabase
    .from('category_allocations')
    .select('*')
    .order('created_at', { ascending: false });

  if (roomAllocationId) {
    query = query.eq('room_allocation_id', roomAllocationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching category allocations:', error);
    throw new Error(`Erreur lors de la récupération des allocations de catégories: ${error.message}`);
  }

  return data.map(allocation => ({
    id: allocation.id,
    roomAllocationId: allocation.room_allocation_id,
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
      room_allocation_id: allocation.roomAllocationId,
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
    roomAllocationId: data.room_allocation_id,
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
    // Récupérer le budget global
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

    // Récupérer toutes les allocations de pièces pour ce budget
    const roomAllocations = await getRoomAllocations(globalBudgetId);

    // Récupérer toutes les allocations de catégories
    const categoryAllocations = await getCategoryAllocations();

    // Récupérer toutes les dépenses
    const expenses = await getExpenses();

    // Calculer les statistiques par pièce
    const rooms: RoomStats[] = roomAllocations.map(roomAllocation => {
      const roomCategories = categoryAllocations.filter(c => c.roomAllocationId === roomAllocation.id);
      const roomExpenses = expenses.filter(e => e.room === roomAllocation.room);

      const categories: CategoryStats[] = roomCategories.map(categoryAllocation => {
        const categoryExpenses = roomExpenses.filter(e => e.category === categoryAllocation.category);
        const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

        return {
          category: categoryAllocation.category,
          allocated: categoryAllocation.allocatedAmount,
          spent,
          remaining: categoryAllocation.allocatedAmount - spent,
          percentage: categoryAllocation.allocatedAmount > 0 ? (spent / categoryAllocation.allocatedAmount) * 100 : 0
        };
      });

      // Ajouter les dépenses sans allocation de catégorie
      const allocatedCategories = roomCategories.map(c => c.category);
      const unallocatedExpenses = roomExpenses.filter(e => !allocatedCategories.includes(e.category));

      if (unallocatedExpenses.length > 0) {
        const unallocatedByCategory = unallocatedExpenses.reduce((acc, expense) => {
          if (!acc[expense.category]) {
            acc[expense.category] = 0;
          }
          acc[expense.category] += expense.amount;
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

      const totalSpent = roomExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        room: roomAllocation.room,
        allocated: roomAllocation.allocatedAmount,
        spent: totalSpent,
        remaining: roomAllocation.allocatedAmount - totalSpent,
        percentage: roomAllocation.allocatedAmount > 0 ? (totalSpent / roomAllocation.allocatedAmount) * 100 : 0,
        categories
      };
    });

    const totalAllocated = roomAllocations.reduce((sum, r) => sum + r.allocatedAmount, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      globalBudget,
      totalAllocated,
      totalSpent,
      totalRemaining: globalBudget.totalAmount - totalSpent,
      unallocatedAmount: globalBudget.totalAmount - totalAllocated,
      rooms
    };

  } catch (error) {
    console.error('Error calculating budget stats:', error);
    throw new Error(`Erreur lors du calcul des statistiques: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}