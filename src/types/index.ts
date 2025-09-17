export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  room: string;
  supplier: string;
  description: string;
  invoiceUrl?: string;
  createdAt: string;
}

// Budget simple pour le système legacy
export interface Budget {
  id: string;
  type: 'global' | 'category' | 'room';
  name: string;
  amount: number;
  category?: string;
  room?: string;
  createdAt: string;
}

// Système de budget hiérarchique
export interface GlobalBudget {
  id: string;
  name: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomAllocation {
  id: string;
  globalBudgetId: string;
  room: string;
  allocatedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryAllocation {
  id: string;
  roomAllocationId: string;
  category: string;
  allocatedAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Interface pour les statistiques hiérarchiques
export interface BudgetHierarchy {
  globalBudget: GlobalBudget;
  roomAllocations: RoomAllocation[];
  categoryAllocations: CategoryAllocation[];
  expenses: Expense[];
}

export interface RoomStats {
  room: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
  categories: CategoryStats[];
}

export interface CategoryStats {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface BudgetStats {
  globalBudget: GlobalBudget;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  unallocatedAmount: number;
  rooms: RoomStats[];
}

export const EXPENSE_CATEGORIES = [
  'Matériaux',
  'Main-d\'œuvre',
  'Plomberie',
  'Électricité',
  'Peinture',
  'Carrelage',
  'Parquet',
  'Menuiserie',
  'Cloisons',
  'Isolation',
  'Chauffage',
  'Outillage',
  'Transport',
  'Nettoyage',
  'Autre'
] as const;

export const ROOM_CATEGORIES = [
  'Cuisine',
  'Salon',
  'Salle de bain',
  'Chambre',
  'Bureau',
  'Couloir',
  'Entrée',
  'Balcon',
  'Cave',
  'Grenier',
  'Garage',
  'Général',
  'Autre'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type RoomCategory = typeof ROOM_CATEGORIES[number];

// Interface pour les statistiques d'expenses
export interface ExpenseStats {
  totalSpent: number;
  totalBudget: number;
  remainingBudget: number;
  budgetUsedPercentage: number;
  byCategory: Record<string, { spent: number; budget: number }>;
  byRoom: Record<string, { spent: number; budget: number }>;
}