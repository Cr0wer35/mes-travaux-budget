import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { deleteBudget, getBudgets, saveBudget } from "@/lib/supabase";
import { Budget, EXPENSE_CATEGORIES, ROOM_CATEGORIES } from "@/types";
import { Plus, RefreshCw, Target, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "global" as Budget["type"],
    name: "",
    amount: "",
    category: "",
    room: "",
  });
  const { toast } = useToast();

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await getBudgets();
      setBudgets(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les budgets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.amount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const newBudget: Omit<Budget, "id" | "createdAt"> = {
      type: formData.type,
      name: formData.name,
      amount: parseFloat(formData.amount),
      category: formData.type === "category" ? formData.category : undefined,
      room: formData.type === "room" ? formData.room : undefined,
    };

    try {
      await saveBudget(newBudget);
      await fetchBudgets(); // Re-fetch budgets after saving
      setShowForm(false);
      setFormData({
        type: "global",
        name: "",
        amount: "",
        category: "",
        room: "",
      });

      toast({
        title: "Budget créé",
        description: "Le budget a été ajouté avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Le budget n'a pas pu être créé.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      await fetchBudgets(); // Re-fetch budgets after deleting
      toast({
        title: "Budget supprimé",
        description: "Le budget a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur de suppression",
        description: "Le budget n'a pas pu être supprimé.",
        variant: "destructive",
      });
    }
  };

  const globalBudgets = budgets.filter((b) => b.type === "global");
  const categoryBudgets = budgets.filter((b) => b.type === "category");
  const roomBudgets = budgets.filter((b) => b.type === "room");

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Budgets</h1>
          <p className="text-muted-foreground">
            Définissez et suivez vos budgets prévisionnels
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gradient-primary text-primary-foreground shadow-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Annuler" : "Nouveau Budget"}
        </Button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un nouveau budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type de budget</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: Budget["type"]) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="category">Par Catégorie</SelectItem>
                      <SelectItem value="room">Par Pièce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Nom du budget</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="ex: Budget renovation complète"
                  />
                </div>

                {formData.type === "category" && (
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.type === "room" && (
                  <div>
                    <Label htmlFor="room">Pièce</Label>
                    <Select
                      value={formData.room}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, room: value }))
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
                )}

                <div>
                  <Label htmlFor="amount">Montant</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="0.00"
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
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Affichage des budgets */}
      {loading ? (
        <div className="text-center py-10">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">
            Chargement des budgets...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Budgets Globaux */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary" />
                Budgets Globaux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {globalBudgets.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Aucun budget global défini
                </p>
              ) : (
                globalBudgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{budget.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(budget.amount)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Budgets par Catégorie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary" />
                Budgets par Catégorie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryBudgets.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Aucun budget par catégorie
                </p>
              ) : (
                categoryBudgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{budget.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(budget.amount)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Budgets par Pièce */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary" />
                Budgets par Pièce
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {roomBudgets.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Aucun budget par pièce
                </p>
              ) : (
                roomBudgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{budget.room}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(budget.amount)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
