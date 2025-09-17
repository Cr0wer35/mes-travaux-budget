import { supabase } from '@/integrations/supabase/client';
import type { Expense, Budget } from '@/types';

// Expenses
export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
  
  return data.map(expense => ({
    ...expense,
    invoiceUrl: expense.invoice_url,
    createdAt: expense.created_at
  }));
}

export async function saveExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .insert({
      date: expense.date,
      amount: expense.amount,
      category: expense.category,
      room: expense.room,
      supplier: expense.supplier,
      description: expense.description,
      invoice_url: expense.invoiceUrl
    });
    
  if (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
}

export async function updateExpense(id: string, expense: Partial<Expense>): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .update({
      ...(expense.date && { date: expense.date }),
      ...(expense.amount && { amount: expense.amount }),
      ...(expense.category && { category: expense.category }),
      ...(expense.room && { room: expense.room }),
      ...(expense.supplier && { supplier: expense.supplier }),
      ...(expense.description && { description: expense.description }),
      ...(expense.invoiceUrl !== undefined && { invoice_url: expense.invoiceUrl })
    })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

// Budgets
export async function getBudgets(): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
  
  return data.map(budget => ({
    ...budget,
    createdAt: budget.created_at
  })) as Budget[];
}

export async function saveBudget(budget: Omit<Budget, 'id' | 'createdAt'>): Promise<void> {
  const { error } = await supabase
    .from('budgets')
    .insert({
      type: budget.type,
      name: budget.name,
      amount: budget.amount,
      category: budget.category,
      room: budget.room
    });
    
  if (error) {
    console.error('Error saving budget:', error);
    throw error;
  }
}

export async function updateBudget(id: string, budget: Partial<Budget>): Promise<void> {
  const { error } = await supabase
    .from('budgets')
    .update({
      ...(budget.type && { type: budget.type }),
      ...(budget.name && { name: budget.name }),
      ...(budget.amount && { amount: budget.amount }),
      ...(budget.category !== undefined && { category: budget.category }),
      ...(budget.room !== undefined && { room: budget.room })
    })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
}