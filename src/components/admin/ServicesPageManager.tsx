import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit } from 'lucide-react';
import ImageManager from './ImageManager';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  duration?: string;
  image?: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  serviceCount: number;
  services: ServiceItem[];
}

interface ServicesPageContent {
  id: string;
  title: string;
  description: string;
  categories: ServiceCategory[];
}

const ServicesPageManager = () => {
  const [content, setContent] = useState<ServicesPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('services_page_content')
        .select('*')
        .single();

      if (error) throw error;

      setContent({
        id: data.id,
        title: data.title,
        description: data.description,
        categories: (data.categories as any) || []
      });
    } catch (error) {
      toast({
        title: 'Erro ao carregar conteúdo',
        description: 'Não foi possível carregar o conteúdo da página.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('services_page_content')
        .update({
          title: content.title,
          description: content.description,
          categories: content.categories as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Conteúdo da página atualizado.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateBasicInfo = (field: 'title' | 'description', value: string) => {
    if (!content) return;
    setContent({ ...content, [field]: value });
  };

  const addCategory = () => {
    if (!content) return;
    const newCategory: ServiceCategory = {
      id: `category_${Date.now()}`,
      name: 'Nova Categoria',
      description: 'Descrição da categoria',
      image: '',
      serviceCount: 0,
      services: []
    };
    setContent({
      ...content,
      categories: [...content.categories, newCategory]
    });
  };

  const updateCategory = (categoryId: string, field: keyof ServiceCategory, value: any) => {
    if (!content) return;
    setContent({
      ...content,
      categories: content.categories.map(cat =>
        cat.id === categoryId 
          ? { ...cat, [field]: value, serviceCount: field === 'services' ? value.length : cat.serviceCount }
          : cat
      )
    });
  };

  const removeCategory = (categoryId: string) => {
    if (!content) return;
    setContent({
      ...content,
      categories: content.categories.filter(cat => cat.id !== categoryId)
    });
  };

  const addService = (categoryId: string, template?: Partial<ServiceItem>) => {
    if (!content) return;
    const newService: ServiceItem = {
      id: `service_${Date.now()}`,
      name: template?.name || '',
      description: template?.description || '',
      price: template?.price || 'R$ 0,00',
      duration: template?.duration || '01:00:00',
      image: template?.image || ''
    };
    
    updateCategory(categoryId, 'services', [
      ...content.categories.find(cat => cat.id === categoryId)?.services || [],
      newService
    ]);
  };

  const serviceTemplates = [
    { name: 'Massagem Relaxante', description: 'Massagem completa para relaxamento', price: 'R$ 80,00', duration: '01:00:00' },
    { name: 'Massagem Terapêutica', description: 'Massagem focada em alívio de tensões', price: 'R$ 100,00', duration: '01:30:00' },
    { name: 'Decoração Básica', description: 'Decoração simples para eventos', price: 'R$ 150,00', duration: '02:00:00' },
    { name: 'Decoração Premium', description: 'Decoração completa personalizada', price: 'R$ 300,00', duration: '04:00:00' },
  ];

  const updateService = (categoryId: string, serviceId: string, field: keyof ServiceItem, value: string) => {
    if (!content) return;
    const category = content.categories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const updatedServices = category.services.map(service =>
      service.id === serviceId ? { ...service, [field]: value } : service
    );
    
    updateCategory(categoryId, 'services', updatedServices);
  };

  const updateServiceImage = (categoryId: string, serviceId: string, imageUrl: string) => {
    updateService(categoryId, serviceId, 'image', imageUrl);
  };

  const removeService = (categoryId: string, serviceId: string) => {
    if (!content) return;
    const category = content.categories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const updatedServices = category.services.filter(service => service.id !== serviceId);
    updateCategory(categoryId, 'services', updatedServices);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando conteúdo da página...</div>;
  }

  if (!content) {
    return <div className="text-center py-8">Erro ao carregar conteúdo.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-paradise-blue mb-2">Gerenciar Página de Serviços</h2>
        <p className="text-muted-foreground">
          Edite o conteúdo da página de serviços, categorias e itens
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Informações Gerais</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Página</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título da Página</Label>
                <Input
                  value={content.title}
                  onChange={(e) => updateBasicInfo('title', e.target.value)}
                  placeholder="Título da página"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={content.description}
                  onChange={(e) => updateBasicInfo('description', e.target.value)}
                  placeholder="Descrição da página"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Categorias de Serviços</h3>
            <Button onClick={addCategory} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Categoria
            </Button>
          </div>

          {content.categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCategory(category.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Categoria</Label>
                    <Input
                      value={category.name}
                      onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                      placeholder="Nome da categoria"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={category.description}
                    onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                    placeholder="Descrição da categoria"
                    rows={3}
                  />
                </div>

                <ImageManager
                  pageKey={`category-${category.id}`}
                  currentImageUrl={category.image}
                  onImageUpdate={(imageUrl) => updateCategory(category.id, 'image', imageUrl)}
                />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Serviços ({category.services.length})</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addService(category.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Serviço Personalizado
                      </Button>
                    </div>
                  </div>

                  {/* Templates de Serviços */}
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">Templates Rápidos:</Label>
                    <div className="flex flex-wrap gap-2">
                      {serviceTemplates.map((template, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => addService(category.id, template)}
                          className="h-7 text-xs"
                        >
                          + {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {category.services.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/10">
                      <p className="text-muted-foreground mb-4">Nenhum serviço adicionado ainda</p>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => addService(category.id)}
                          className="mx-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Serviço Personalizado
                        </Button>
                        <p className="text-xs text-muted-foreground">Ou use um dos templates acima</p>
                      </div>
                    </div>
                  ) : (
                    category.services.map((service) => (
                      <Card key={service.id} className="bg-muted/50 border-l-4 border-l-paradise-blue">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-paradise-blue rounded-full"></div>
                              <h4 className="font-medium text-paradise-blue">{service.name || 'Novo Serviço'}</h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeService(category.id, service.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">Nome do Serviço</Label>
                              <Input
                                value={service.name}
                                onChange={(e) => updateService(category.id, service.id, 'name', e.target.value)}
                                placeholder="Ex: Massagem Relaxante"
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">Preço</Label>
                              <Input
                                value={service.price}
                                onChange={(e) => updateService(category.id, service.id, 'price', e.target.value)}
                                placeholder="Ex: R$ 80,00"
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">Duração (opcional)</Label>
                              <Input
                                value={service.duration || ''}
                                onChange={(e) => updateService(category.id, service.id, 'duration', e.target.value)}
                                placeholder="Ex: 01:00:00"
                                className="h-8"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3 space-y-3">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">Descrição</Label>
                              <Textarea
                                value={service.description}
                                onChange={(e) => updateService(category.id, service.id, 'description', e.target.value)}
                                placeholder="Descreva os benefícios e detalhes do serviço..."
                                rows={2}
                                className="resize-none"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">Imagem do Serviço</Label>
                              <ImageManager
                                pageKey={`service-${service.id}`}
                                currentImageUrl={service.image || ''}
                                onImageUpdate={(imageUrl) => updateServiceImage(category.id, service.id, imageUrl)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Button 
        onClick={handleSave}
        disabled={saving}
        variant="paradise"
        className="w-full"
        size="lg"
      >
        {saving ? 'Salvando...' : 'Salvar Todas as Alterações'}
      </Button>
    </div>
  );
};

export default ServicesPageManager;