import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit3 } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQManagerProps {
  faqs: FAQ[];
  onFAQsUpdate: (faqs: FAQ[]) => void;
}

const categories = [
  { value: 'geral', label: 'Geral' },
  { value: 'reservas', label: 'Reservas' },
  { value: 'hospedagem', label: 'Hospedagem' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'dayuse', label: 'Day Use' },
  { value: 'pagamento', label: 'Pagamento' },
];

const FAQManager = ({ faqs, onFAQsUpdate }: FAQManagerProps) => {
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newFAQ, setNewFAQ] = useState<Partial<FAQ>>({
    question: '',
    answer: '',
    category: 'geral'
  });

  const handleAddFAQ = () => {
    if (!newFAQ.question || !newFAQ.answer) return;
    
    const faqToAdd: FAQ = {
      id: Date.now().toString(),
      question: newFAQ.question,
      answer: newFAQ.answer,
      category: newFAQ.category || 'geral'
    };

    onFAQsUpdate([...faqs, faqToAdd]);
    setNewFAQ({ question: '', answer: '', category: 'geral' });
    setIsAdding(false);
  };

  const handleEditFAQ = (faq: FAQ) => {
    setEditingFAQ({ ...faq });
  };

  const handleSaveEdit = () => {
    if (!editingFAQ) return;
    
    const updatedFAQs = faqs.map(faq => 
      faq.id === editingFAQ.id ? editingFAQ : faq
    );
    onFAQsUpdate(updatedFAQs);
    setEditingFAQ(null);
  };

  const handleDeleteFAQ = (id: string) => {
    const updatedFAQs = faqs.filter(faq => faq.id !== id);
    onFAQsUpdate(updatedFAQs);
  };

  const groupedFAQs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Perguntas Frequentes</h3>
          <p className="text-sm text-muted-foreground">Gerencie as perguntas e respostas da página</p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          size="sm"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar FAQ
        </Button>
      </div>

      <Separator />

      {/* Add New FAQ */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nova Pergunta Frequente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={newFAQ.category || 'geral'}
                onValueChange={(value) => setNewFAQ(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pergunta</Label>
              <Input
                value={newFAQ.question || ''}
                onChange={(e) => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Digite a pergunta..."
              />
            </div>

            <div className="space-y-2">
              <Label>Resposta</Label>
              <Textarea
                value={newFAQ.answer || ''}
                onChange={(e) => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Digite a resposta..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddFAQ} size="sm">
                Salvar FAQ
              </Button>
              <Button 
                onClick={() => {
                  setIsAdding(false);
                  setNewFAQ({ question: '', answer: '', category: 'geral' });
                }}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit FAQ */}
      {editingFAQ && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editando Pergunta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={editingFAQ.category}
                onValueChange={(value) => setEditingFAQ(prev => prev ? { ...prev, category: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pergunta</Label>
              <Input
                value={editingFAQ.question}
                onChange={(e) => setEditingFAQ(prev => prev ? { ...prev, question: e.target.value } : null)}
                placeholder="Digite a pergunta..."
              />
            </div>

            <div className="space-y-2">
              <Label>Resposta</Label>
              <Textarea
                value={editingFAQ.answer}
                onChange={(e) => setEditingFAQ(prev => prev ? { ...prev, answer: e.target.value } : null)}
                placeholder="Digite a resposta..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} size="sm">
                Salvar Alterações
              </Button>
              <Button 
                onClick={() => setEditingFAQ(null)}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQs List */}
      <div className="space-y-4">
        {Object.keys(groupedFAQs).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma pergunta cadastrada ainda.</p>
            <p className="text-sm text-muted-foreground mt-1">Clique em "Adicionar FAQ" para começar.</p>
          </div>
        ) : (
          Object.entries(groupedFAQs).map(([categoryKey, categoryFAQs]) => {
            const categoryLabel = categories.find(cat => cat.value === categoryKey)?.label || categoryKey;
            
            return (
              <div key={categoryKey}>
                <h4 className="text-sm font-medium text-paradise-blue mb-3 uppercase tracking-wide">
                  {categoryLabel}
                </h4>
                <div className="space-y-2 ml-4">
                  {categoryFAQs.map((faq) => (
                    <Card key={faq.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h5 className="font-medium mb-2">{faq.question}</h5>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => handleEditFAQ(faq)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteFAQ(faq.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FAQManager;