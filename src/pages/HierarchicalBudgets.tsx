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
  getRoomAllocations,
  saveCategoryAllocation,
  saveGlobalBudget,
  saveRoomAllocation,
} from "@/lib/storage";
import {
  BudgetStats,
  CategoryAllocation,
  EXPENSE_CATEGORIES,
  GlobalBudget,
  ROOM_CATEGORIES,
  RoomAllocation,
} from "@/types";
import {
  AlertTriangle,
  DollarSign,
  Home,
  PieChart,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function HierarchicalBudgets() {
  const [globalBudgets, setGlobalBudgets] = useState<GlobalBudget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [budgetStats, setBudgetStats] = useState<BudgetStats | null>(null);
  const [showGlobalForm, setShowGlobalForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [globalForm, setGlobalForm] = useState({
    name: "",
    totalAmount: "",
  });

  const [roomForm, setRoomForm] = useState({
    room: "",
    allocatedAmount: "",
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
        description: "Vous pouvez maintenant allouer des montants par pièce",
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

  const handleCreateRoomAllocation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomForm.room || !roomForm.allocatedAmount || !selectedBudgetId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      const newAllocation: Omit<
        RoomAllocation,
        "id" | "createdAt" | "updatedAt"
      > = {
        globalBudgetId: selectedBudgetId,
        room: roomForm.room,
        allocatedAmount: parseFloat(roomForm.allocatedAmount),
      };

      await saveRoomAllocation(newAllocation as RoomAllocation);
      setRoomForm({ room: "", allocatedAmount: "" });
      setShowRoomForm(false);

      await loadBudgetStats();

      toast({
        title: "Allocation créée",
        description: `${formatCurrency(
          newAllocation.allocatedAmount
        )} alloués à ${newAllocation.room}`,
      });
    } catch (error) {
      console.error("Error creating room allocation:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'allocation",
        variant: "destructive",
      });
    }
  };

  const handleCreateCategoryAllocation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !categoryForm.category ||
      !categoryForm.allocatedAmount ||
      !selectedRoomId
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
        roomAllocationId: selectedRoomId,
        category: categoryForm.category,
        allocatedAmount: parseFloat(categoryForm.allocatedAmount),
      };

      await saveCategoryAllocation(newAllocation as CategoryAllocation);
      setCategoryForm({ category: "", allocatedAmount: "" });
      setShowCategoryForm(false);
      setSelectedRoomId("");

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

  const findRoomAllocationId = async (room: string): Promise<string | null> => {
    try {
      const roomAllocations = await getRoomAllocations(selectedBudgetId);
      const roomAllocation = roomAllocations.find((r) => r.room === room);
      return roomAllocation?.id || null;
    } catch (error) {
      console.error("Error finding room allocation:", error);
      return null;
    }
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
          <h1 className="text-3xl font-bold">Budget Hiérarchique</h1>
          <p className="text-muted-foreground">
            Gérez vos budgets de manière structurée : Global → Pièces →
            Catégories
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
              <Target className="h-5 w-5" />
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
                  <Target className="h-4 w-4 mr-2" />
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
                  <Home className="h-5 w-5 text-success" />
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

      {/* Room Allocations */}
      {budgetStats && (
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Allocations par Pièce
            </CardTitle>
            <Button
              onClick={() => setShowRoomForm(!showRoomForm)}
              size="sm"
              className="gradient-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une pièce
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showRoomForm && (
              <form
                onSubmit={handleCreateRoomAllocation}
                className="p-4 bg-muted/30 rounded-lg space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="room">Pièce</Label>
                    <Select
                      value={roomForm.room}
                      onValueChange={(value) =>
                        setRoomForm((prev) => ({ ...prev, room: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une pièce" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_CATEGORIES.map((room) => (
                          <SelectItem key={room} value={room}>
                            {room}
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
                      value={roomForm.allocatedAmount}
                      onChange={(e) =>
                        setRoomForm((prev) => ({
                          ...prev,
                          allocatedAmount: e.target.value,
                        }))
                      }
                      placeholder="4000"
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
                    onClick={() => setShowRoomForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}

            {budgetStats.rooms.map((room) => (
              <div key={room.room} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{room.room}</h3>
                    <Badge
                      variant={
                        room.percentage > 100
                          ? "destructive"
                          : room.percentage > 80
                          ? "secondary"
                          : "default"
                      }
                    >
                      {room.percentage.toFixed(1)}%
                    </Badge>
                    {getStatusIcon(room.percentage)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(room.spent)} /{" "}
                      {formatCurrency(room.allocated)}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        room.remaining < 0 ? "text-destructive" : "text-success"
                      }`}
                    >
                      Reste: {formatCurrency(room.remaining)}
                    </p>
                  </div>
                </div>

                <Progress
                  value={Math.min(room.percentage, 100)}
                  className={`h-2 ${getProgressColor(room.percentage)}`}
                />

                {/* Categories for this room */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Catégories
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        const roomAllocationId = await findRoomAllocationId(
                          room.room
                        );
                        if (roomAllocationId) {
                          setSelectedRoomId(roomAllocationId);
                          setShowCategoryForm(true);
                        }
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  </div>

                  {room.categories.map((category) => (
                    <div
                      key={category.category}
                      className="flex items-center justify-between text-sm p-2 bg-muted/20 rounded"
                    >
                      <span>{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {formatCurrency(category.spent)} /{" "}
                          {formatCurrency(category.allocated)}
                        </span>
                        <Badge
                          variant={
                            category.percentage > 100
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {category.percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Category Allocation Form */}
      {showCategoryForm && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Ajouter une Allocation de Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreateCategoryAllocation}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={categoryForm.category}
                    onValueChange={(value) =>
                      setCategoryForm((prev) => ({ ...prev, category: value }))
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
                  <Label htmlFor="categoryAmount">Montant alloué (€)</Label>
                  <Input
                    id="categoryAmount"
                    type="number"
                    step="0.01"
                    value={categoryForm.allocatedAmount}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        allocatedAmount: e.target.value,
                      }))
                    }
                    placeholder="300"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="gradient-success text-success-foreground"
                >
                  Créer l'allocation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setSelectedRoomId("");
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {globalBudgets.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
