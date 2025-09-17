import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  calculateBudgetStats,
  getGlobalBudgets,
  saveCategoryAllocation,
  saveGlobalBudget,
} from "@/lib/storage";
import {
  BudgetStats,
  CategoryAllocation,
  EXPENSE_CATEGORIES,
  GlobalBudget,
} from "@/types";
import {
  AlertTriangle,
  DollarSign,
  PieChart,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function HierarchicalBudgets() {
  const [globalBudgets, setGlobalBudgets] = useState<GlobalBudget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [budgetStats, setBudgetStats] = useState<BudgetStats | null>(null);
  const [showGlobalForm, setShowGlobalForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [globalForm, setGlobalForm] = useState({
    name: "",
    totalAmount: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    category: "",
    allocatedAmount: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBudgetId) {
      loadBudgetStats();
    }
  }, [selectedBudgetId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const budgets = await getGlobalBudgets();
      setGlobalBudgets(budgets);
      if (budgets.length > 0 && !selectedBudgetId) {
        setSelectedBudgetId(budgets[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBudgetStats = async () => {
    try {
      const stats = await calculateBudgetStats(selectedBudgetId);
      setBudgetStats(stats);
    } catch (error) {
      console.error("Error loading budget stats:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateGlobalBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!globalForm.name || !globalForm.totalAmount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      const newBudget: Omit<GlobalBudget, "id" | "createdAt" | "updatedAt"> = {
        name: globalForm.name,
        totalAmount: parseFloat(globalForm.totalAmount),
      };

      await saveGlobalBudget(newBudget as GlobalBudget);
      setGlobalForm({ name: "", totalAmount: "" });
      setShowGlobalForm(false);

      // Recharger les données et sélectionner le nouveau budget
      await loadData();
      const budgets = await getGlobalBudgets();
      const createdBudget = budgets.find((b) => b.name === newBudget.name);
      if (createdBudget) {
        setSelectedBudgetId(createdBudget.id);
      }

      toast({
        title: "Budget global créé",
        description:
          "Vous pouvez maintenant allouer des montants par catégorie",
      });
    } catch (error) {
      console.error("Error creating global budget:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du budget global",
        variant: "destructive",
      });
    }
  };

  const handleCreateCategoryAllocation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !categoryForm.category ||
      !categoryForm.allocatedAmount ||
      !selectedBudgetId
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      const newAllocation: Omit<
        CategoryAllocation,
        "id" | "createdAt" | "updatedAt"
      > = {
        globalBudgetId: selectedBudgetId,
        category: categoryForm.category,
        allocatedAmount: parseFloat(categoryForm.allocatedAmount),
      };

      await saveCategoryAllocation(newAllocation as CategoryAllocation);
      setCategoryForm({ category: "", allocatedAmount: "" });
      setShowCategoryForm(false);

      await loadBudgetStats();

      toast({
        title: "Allocation créée",
        description: `${formatCurrency(
          newAllocation.allocatedAmount
        )} alloués à ${newAllocation.category}`,
      });
    } catch (error) {
      console.error("Error creating category allocation:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'allocation",
        variant: "destructive",
      });
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return "bg-destructive";
    if (percentage > 80) return "bg-warning";
    return "bg-success";
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage > 100)
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    if (percentage > 80)
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <TrendingUp className="h-4 w-4 text-success" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Budget</h1>
          <p className="text-muted-foreground">
            Définissez un budget global et allouez-le par catégorie de travaux.
          </p>
        </div>
        <Button
          onClick={() => setShowGlobalForm(!showGlobalForm)}
          className="gradient-primary text-primary-foreground shadow-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Budget Global
        </Button>
      </div>

      {/* Global Budget Selection */}
      {globalBudgets.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Sélection du Budget Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedBudgetId}
              onValueChange={setSelectedBudgetId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un budget global" />
              </SelectTrigger>
              <SelectContent>
                {globalBudgets.map((budget) => (
                  <SelectItem key={budget.id} value={budget.id}>
                    {budget.name} - {formatCurrency(budget.totalAmount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Global Budget Form */}
      {showGlobalForm && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Créer un Budget Global</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGlobalBudget} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du projet</Label>
                  <Input
                    id="name"
                    value={globalForm.name}
                    onChange={(e) =>
                      setGlobalForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="ex: Rénovation appartement"
                  />
                </div>
                <div>
                  <Label htmlFor="totalAmount">Budget total (€)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={globalForm.totalAmount}
                    onChange={(e) =>
                      setGlobalForm((prev) => ({
                        ...prev,
                        totalAmount: e.target.value,
                      }))
                    }
                    placeholder="30000"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="gradient-success text-success-foreground"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Créer le budget
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGlobalForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Budget Stats Overview */}
      {budgetStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget Total</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(budgetStats.globalBudget.totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alloué</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(budgetStats.totalAllocated)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dépensé</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(budgetStats.totalSpent)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Non Alloué</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(budgetStats.unallocatedAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Allocations */}
      {budgetStats && (
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Allocations par Catégorie
            </CardTitle>
            <Button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              size="sm"
              className="gradient-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une catégorie
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showCategoryForm && (
              <form
                onSubmit={handleCreateCategoryAllocation}
                className="p-4 bg-muted/30 rounded-lg space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={categoryForm.category}
                      onValueChange={(value) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          category: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="allocatedAmount">Montant alloué (€)</Label>
                    <Input
                      id="allocatedAmount"
                      type="number"
                      step="0.01"
                      value={categoryForm.allocatedAmount}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          allocatedAmount: e.target.value,
                        }))
                      }
                      placeholder="3000"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="gradient-success text-success-foreground"
                  >
                    Créer l'allocation
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCategoryForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}

            {budgetStats.categories.map((category) => (
              <div
                key={category.category}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {category.category}
                    </h3>
                    <Badge
                      variant={
                        category.percentage > 100
                          ? "destructive"
                          : category.percentage > 80
                          ? "secondary"
                          : "default"
                      }
                    >
                      {category.percentage.toFixed(1)}%
                    </Badge>
                    {getStatusIcon(category.percentage)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(category.spent)} /{" "}
                      {formatCurrency(category.allocated)}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        category.remaining < 0
                          ? "text-destructive"
                          : "text-success"
                      }`}
                    >
                      Reste: {formatCurrency(category.remaining)}
                    </p>
                  </div>
                </div>

                <Progress
                  value={Math.min(category.percentage, 100)}
                  className={`h-2 ${getProgressColor(category.percentage)}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {globalBudgets.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun budget global</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer un budget global pour structurer vos dépenses
            </p>
            <Button
              onClick={() => setShowGlobalForm(true)}
              className="gradient-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer mon premier budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
