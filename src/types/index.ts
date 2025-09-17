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

export interface Budget {
  id: string;
  type: 'global' | 'category' | 'room';
  name: string;
  amount: number;
  category?: string;
  room?: string;
  createdAt: string;
}

export interface ExpenseStats {
  totalSpent: number;
  totalBudget: number;
  remainingBudget: number;
  budgetUsedPercentage: number;
  byCategory: Record<string, { spent: number; budget: number }>;
  byRoom: Record<string, { spent: number; budget: number }>;
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