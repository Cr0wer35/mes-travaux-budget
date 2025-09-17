import { calculateBudgetStats, getGlobalBudgets } from '@/lib/storage';
import { BudgetStats } from '@/types';
import { useEffect, useState } from 'react';

export function useHierarchicalBudgetStats() {
  const [stats, setStats] = useState<BudgetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const globalBudgets = await getGlobalBudgets();

        if (globalBudgets.length === 0) {
          setStats(null);
          return;
        }

        // Prendre le premier budget global (ou le plus récent)
        const latestBudget = globalBudgets.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        const budgetStats = await calculateBudgetStats(latestBudget.id);
        setStats(budgetStats);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const refresh = async () => {
    try {
      setError(null);

      const globalBudgets = await getGlobalBudgets();

      if (globalBudgets.length === 0) {
        setStats(null);
        return;
      }

      const latestBudget = globalBudgets.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      const budgetStats = await calculateBudgetStats(latestBudget.id);
      setStats(budgetStats);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      setStats(null);
    }
  };

  // Calculer des statistiques compatibles avec l'ancien système
  const legacyStats = stats ? {
    totalSpent: stats.totalSpent,
    totalBudget: stats.globalBudget.totalAmount,
    remainingBudget: stats.totalRemaining,
    budgetUsedPercentage: stats.globalBudget.totalAmount > 0
      ? (stats.totalSpent / stats.globalBudget.totalAmount) * 100
      : 0,
    byCategory: stats.rooms.reduce((acc, room) => {
      room.categories.forEach(category => {
        if (!acc[category.category]) {
          acc[category.category] = { spent: 0, budget: 0 };
        }
        acc[category.category].spent += category.spent;
        acc[category.category].budget += category.allocated;
      });
      return acc;
    }, {} as Record<string, { spent: number; budget: number }>),
    byRoom: stats.rooms.reduce((acc, room) => {
      acc[room.room] = {
        spent: room.spent,
        budget: room.allocated
      };
      return acc;
    }, {} as Record<string, { spent: number; budget: number }>)
  } : null;

  return {
    stats,
    legacyStats,
    loading,
    error,
    refresh,
    hasHierarchicalBudget: stats !== null
  };
}
