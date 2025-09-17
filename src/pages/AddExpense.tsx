import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Receipt, Save } from 'lucide-react';
import { Expense, EXPENSE_CATEGORIES, ROOM_CATEGORIES } from '@/types';
import { saveExpense } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export default function AddExpense() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    room: '',
    supplier: '',
    description: '',
    invoiceUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.amount || !formData.category || !formData.room || !formData.supplier || !formData.description) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Le montant doit être un nombre valide supérieur à 0',
        variant: 'destructive',
      });
      return;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      room: formData.room,
      supplier: formData.supplier,
      description: formData.description,
      invoiceUrl: formData.invoiceUrl || undefined,
      createdAt: new Date().toISOString(),
    };

    saveExpense(newExpense);
    
    toast({
      title: 'Dépense ajoutée',
      description: 'La dépense a été enregistrée avec succès',
    });

    navigate('/expenses');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/expenses')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle Dépense</h1>
          <p className="text-muted-foreground">Enregistrer une nouvelle dépense de travaux</p>
        </div>
      </div>

      {/* Form */}
      <Card className="shadow-card max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Détails de la dépense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date de la dépense *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="amount">Montant (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
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

              <div>
                <Label htmlFor="room">Pièce concernée *</Label>
                <Select value={formData.room} onValueChange={(value) => handleInputChange('room', value)}>
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

              <div className="md:col-span-2">
                <Label htmlFor="supplier">Fournisseur / Magasin / Artisan *</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="ex: Leroy Merlin, Jean Dupont (plombier)..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez précisément l'achat ou le service..."
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="invoiceUrl">Lien facture/justificatif (optionnel)</Label>
                <Input
                  id="invoiceUrl"
                  type="url"
                  value={formData.invoiceUrl}
                  onChange={(e) => handleInputChange('invoiceUrl', e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lien vers Google Drive, Dropbox, ou tout autre service de stockage
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="gradient-success text-success-foreground shadow-primary">
                <Save className="h-4 w-4 mr-2" />
                Enregistrer la dépense
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/expenses')}>
                Annuler
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              * Champs obligatoires
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}