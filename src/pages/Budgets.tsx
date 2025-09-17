import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, Trash2 } from 'lucide-react';
import { Budget, EXPENSE_CATEGORIES, ROOM_CATEGORIES } from '@/types';
import { getBudgets, saveBudget, deleteBudget } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>(getBudgets());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'global' as Budget['type'],
    name: '',
    amount: '',
    category: '',
    room: '',
  });
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    const newBudget: Budget = {
      id: crypto.randomUUID(),
      type: formData.type,
      name: formData.name,
      amount: parseFloat(formData.amount),
      category: formData.type === 'category' ? formData.category : undefined,
      room: formData.type === 'room' ? formData.room : undefined,
      createdAt: new Date().toISOString(),
    };

    saveBudget(newBudget);
    setBudgets(getBudgets());
    setShowForm(false);
    setFormData({
      type: 'global',
      name: '',
      amount: '',
      category: '',
      room: '',
    });

    toast({
      title: 'Budget créé',
      description: 'Le budget a été ajouté avec succès',
    });
  };

  const handleDelete = (id: string) => {
    deleteBudget(id);
    setBudgets(getBudgets());
    toast({
      title: 'Budget supprimé',
      description: 'Le budget a été supprimé avec succès',
    });
  };

  const globalBudgets = budgets.filter(b => b.type === 'global');
  const categoryBudgets = budgets.filter(b => b.type === 'category');
  const roomBudgets = budgets.filter(b => b.type === 'room');

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Budgets</h1>
          <p className="text-muted-foreground">Définissez et suivez vos budgets prévisionnels</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="gradient-primary text-primary-foreground shadow-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Budget
        </Button>
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Nouveau Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type de budget</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: Budget['type']) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Budget global</SelectItem>
                      <SelectItem value="category">Par catégorie</SelectItem>
                      <SelectItem value="room">Par pièce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Nom du budget</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: Budget renovation complète"
                  />
                </div>

                {formData.type === 'category' && (
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.type === 'room' && (
                  <div>
                    <Label htmlFor="room">Pièce</Label>
                    <Select 
                      value={formData.room} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, room: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une pièce" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_CATEGORIES.map(room => (
                          <SelectItem key={room} value={room}>{room}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="amount">Montant (€)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="gradient-success text-success-foreground">
                  <Target className="h-4 w-4 mr-2" />
                  Créer le budget
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Budget Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Budgets */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Budget Global</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {globalBudgets.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun budget global défini</p>
            ) : (
              globalBudgets.map(budget => (
                <div key={budget.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{budget.name}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(budget.amount)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(budget.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Category Budgets */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Budget par Catégorie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryBudgets.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun budget par catégorie</p>
            ) : (
              categoryBudgets.map(budget => (
                <div key={budget.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{budget.category}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(budget.amount)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(budget.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Room Budgets */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Budget par Pièce</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {roomBudgets.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun budget par pièce</p>
            ) : (
              roomBudgets.map(budget => (
                <div key={budget.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{budget.room}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(budget.amount)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(budget.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}