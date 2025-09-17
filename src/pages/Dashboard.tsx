import { MetricCard } from '@/components/MetricCard';
import { useExpenseStats } from '@/hooks/useExpenseStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

export default function Dashboard() {
  const stats = useExpenseStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Prepare data for pie chart (categories)
  const categoryData = Object.entries(stats.byCategory)
    .filter(([_, data]) => data.spent > 0)
    .map(([category, data]) => ({
      name: category,
      value: data.spent,
    }));

  // Prepare data for bar chart (budget vs actual)
  const comparisonData = Object.entries(stats.byCategory)
    .filter(([_, data]) => data.budget > 0 || data.spent > 0)
    .map(([category, data]) => ({
      category: category.length > 10 ? category.substring(0, 10) + '...' : category,
      budget: data.budget,
      spent: data.spent,
    }));

  const getBudgetVariant = () => {
    if (stats.budgetUsedPercentage > 100) return 'danger';
    if (stats.budgetUsedPercentage > 80) return 'warning';
    return 'success';
  };

  const getBudgetTrend = () => {
    if (stats.budgetUsedPercentage > 100) return 'down';
    if (stats.budgetUsedPercentage > 80) return 'up';
    return 'neutral';
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Travaux</h1>
        <p className="text-muted-foreground">Vue d'ensemble de vos dépenses et budget</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total dépensé"
          value={formatCurrency(stats.totalSpent)}
          subtitle="Montant total des travaux"
        />
        <MetricCard
          title="Budget total"
          value={formatCurrency(stats.totalBudget)}
          subtitle="Budget prévu initialement"
        />
        <MetricCard
          title="Budget restant"
          value={formatCurrency(stats.remainingBudget)}
          subtitle={stats.remainingBudget < 0 ? 'Dépassement!' : 'Disponible'}
          variant={stats.remainingBudget < 0 ? 'danger' : 'success'}
          trend={stats.remainingBudget < 0 ? 'down' : 'up'}
        />
        <MetricCard
          title="Budget utilisé"
          value={`${stats.budgetUsedPercentage.toFixed(1)}%`}
          subtitle="Pourcentage du budget"
          variant={getBudgetVariant()}
          trend={getBudgetTrend()}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Categories */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Budget vs Actual */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Budget vs Réel par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => `${value}€`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="budget" fill="hsl(var(--primary))" name="Budget" />
                <Bar dataKey="spent" fill="hsl(var(--warning))" name="Dépensé" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}