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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refresh,
    hasHierarchicalBudget: stats !== null
  };
}
