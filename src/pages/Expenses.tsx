import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { deleteExpense, getExpenses } from "@/lib/storage";
import { Expense, EXPENSE_CATEGORIES, ROOM_CATEGORIES } from "@/types";
import {
  ExternalLink,
  Filter,
  Plus,
  Receipt,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterRoom, setFilterRoom] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const expensesData = await getExpenses();
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error loading expenses:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des dépenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      await loadExpenses(); // Recharger les données
      toast({
        title: "Dépense supprimée",
        description: "La dépense a été supprimée avec succès",
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la dépense",
        variant: "destructive",
      });
    }
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.room.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || expense.category === filterCategory;
    const matchesRoom = filterRoom === "all" || expense.room === filterRoom;

    return matchesSearch && matchesCategory && matchesRoom;
  });

  const totalFiltered = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

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
          <h1 className="text-3xl font-bold">Gestion des Dépenses</h1>
          <p className="text-muted-foreground">
            {filteredExpenses.length} dépense(s) • Total:{" "}
            {formatCurrency(totalFiltered)}
          </p>
        </div>
        <Link to="/add-expense">
          <Button className="gradient-primary text-primary-foreground shadow-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Dépense
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par description, fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Select value={filterRoom} onValueChange={setFilterRoom}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes pièces</SelectItem>
                  {ROOM_CATEGORIES.map((room) => (
                    <SelectItem key={room} value={room}>
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Aucune dépense trouvée
              </h3>
              <p className="text-muted-foreground mb-4">
                {expenses.length === 0
                  ? "Commencez par ajouter votre première dépense"
                  : "Essayez de modifier vos filtres de recherche"}
              </p>
              {expenses.length === 0 && (
                <Link to="/add-expense">
                  <Button className="gradient-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une dépense
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <Card
              key={expense.id}
              className="shadow-card hover:shadow-primary transition-smooth"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">
                          {expense.description}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {expense.supplier}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{expense.category}</Badge>
                      <Badge variant="outline">{expense.room}</Badge>
                      {expense.invoiceUrl && (
                        <a
                          href={expense.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-glow"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Facture
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
