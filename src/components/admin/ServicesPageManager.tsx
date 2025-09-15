import { useState, useEffect, useCallback } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import MediaManager from './MediaManager';
import { set } from 'lodash';
import { Label } from '@/components/ui/label'; // Correctly import Label

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  duration?: string;
  images?: string[];
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  images: string[];
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const normalizeUrls = (field: any): string[] => {
    let urls: any[] = [];
    if (Array.isArray(field)) {
      urls = field;
    } else if (typeof field === 'string' && field.trim()) {
      const trimmedField = field.trim();
      if (trimmedField.startsWith('[') && trimmedField.endsWith(']')) {
        try {
          urls = JSON.parse(trimmedField);
          if (!Array.isArray(urls)) urls = [urls];
        } catch { urls = [field]; }
      } else {
        urls = [field];
      }
    }
    return urls.filter(u => typeof u === 'string' && u.trim() !== '').map(u => u.trim());
  };

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('services_page_content').select('*').single();
      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const categories = (data.categories as any[] || [])
          .filter(cat => cat) // Robustness: filter out null/undefined categories
          .map((cat, index) => ({
            ...cat,
            id: cat.id || `cat_${index}_${Date.now()}`,
            images: normalizeUrls(cat.images),
            services: (cat.services as any[] || [])
              .filter(srv => srv) // Robustness: filter out null/undefined services
              .map((srv, srvIndex) => ({
                ...srv,
                id: srv.id || `srv_${srvIndex}_${Date.now()}`,
                images: normalizeUrls(srv.images),
              }))
        }));
        setContent({ ...data, categories });
      } else {
        const { data: newData } = await supabase.from('services_page_content').insert({ title: 'Nossos Serviços', description: 'Descubra os serviços que oferecemos.', categories: [] }).select().single();
        if (newData) setContent(newData as ServicesPageContent);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar conteúdo', { description: error.message });
      setContent(null); // Ensure content is null on error to show error message
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleSave = async () => {
    if (!content) return;
    setIsSaving(true);
    try {
      const contentToSave = {
        title: content.title,
        description: content.description,
        categories: content.categories.map(category => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...restOfCategory } = category;
          return {
            ...restOfCategory,
            services: category.services.map(service => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, ...restOfService } = service;
              return restOfService;
            }),
          };
        }),
      };

      const { error } = await supabase.from('services_page_content').update(contentToSave).eq('id', content.id);
      if (error) throw error;
      toast.success('Página de Serviços atualizada com sucesso!');
      fetchContent();
    } catch (error: any) {
      toast.error('Erro ao salvar as alterações.', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  const updateField = (path: string, value: any) => {
    setContent(prev => {
      if (!prev) return null;
      const newContent = JSON.parse(JSON.stringify(prev));
      set(newContent, path, value);
      return newContent;
    });
  };

  const addCategory = () => {
    if (!content) return;
    const newCategory: ServiceCategory = { id: `new_cat_${Date.now()}`, name: 'Nova Categoria', description: '', images: [], services: [] };
    updateField('categories', [...content.categories, newCategory]);
  };

  const removeCategory = (index: number) => {
    if (!content) return;
    updateField('categories', content.categories.filter((_, i) => i !== index));
  };

  const addService = (catIndex: number) => {
    if (!content) return;
    const newService: ServiceItem = { id: `new_srv_${Date.now()}`, name: 'Novo Serviço', description: '', price: 'R$ 0,00', images: [] };
    updateField(`categories[${catIndex}].services`, [...content.categories[catIndex].services, newService]);
  };

  const removeService = (catIndex: number, serviceIndex: number) => {
    if (!content) return;
    updateField(`categories[${catIndex}].services`, content.categories[catIndex].services.filter((_, i) => i !== serviceIndex));
  };

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-paradise-blue"/></div>;
  if (!content) return <div className="text-center py-8 text-destructive">Erro crítico: Não foi possível carregar o conteúdo. Por favor, atualize a página. Se o erro persistir, pode haver dados corrompidos no banco.</div>;

  return (
    <div className="space-y-6">
        <Card>
             <CardHeader className="flex-row justify-between items-center">
                <div className="space-y-1">
                    <CardTitle>Gerenciar Página de Serviços</CardTitle>
                    <p className="text-sm text-muted-foreground">Edite o título, categorias e todos os serviços oferecidos.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} variant="paradise">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {isSaving ? 'Salvando...' : 'Salvar Página'}
                </Button>
            </CardHeader>
        </Card>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Informações Gerais</TabsTrigger>
          <TabsTrigger value="categories">Categorias e Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="pt-6">
          <Card>
            <CardHeader><CardTitle>Conteúdo Principal da Página</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Título Principal</Label><Input value={content.title} onChange={(e) => updateField('title', e.target.value)} /></div>
              <div><Label>Descrição da Página</Label><Textarea value={content.description} onChange={(e) => updateField('description', e.target.value)} rows={4} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="pt-6">
          <div className="text-right mb-4"><Button onClick={addCategory}><Plus className="w-4 h-4 mr-2" /> Nova Categoria</Button></div>
          <div className="space-y-6">
            {content.categories.map((category, catIndex) => (
                <Card key={category.id} className="border-l-4 border-paradise-blue/80">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/30">
                        <Input value={category.name} onChange={(e) => updateField(`categories[${catIndex}].name`, e.target.value)} className="text-lg font-bold border-none bg-transparent focus-visible:ring-1 h-auto"/>
                        <Button variant="ghost" onClick={() => removeCategory(catIndex)} className={buttonVariants({variant: "destructive"})}>Remover Categoria</Button>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-6">
                        <div><Label>Descrição da Categoria</Label><Textarea value={category.description} onChange={(e) => updateField(`categories[${catIndex}].description`, e.target.value)} rows={3} /></div>
                        <div><Label className="font-medium">Imagens da Categoria</Label><MediaManager folder={`services_page/categories/${category.id}`} mediaUrls={category.images} onMediaUpdate={(urls) => updateField(`categories[${catIndex}].images`, urls)} /></div>
                        <div className="space-y-4 pt-6 border-t">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold">Serviços em "{category.name}"</h4>
                                <Button variant="outline" size="sm" onClick={() => addService(catIndex)}><Plus className="w-4 h-4 mr-2" /> Adicionar Serviço</Button>
                            </div>
                            {category.services.map((service, srvIndex) => (
                                <div key={service.id} className="p-4 border rounded-lg bg-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <Input value={service.name} onChange={(e) => updateField(`categories[${catIndex}].services[${srvIndex}].name`, e.target.value)} className="font-semibold border-none focus-visible:ring-1 h-auto"/>
                                        <Button variant="ghost" size="icon" onClick={() => removeService(catIndex, srvIndex)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div><Label>Preço</Label><Input value={service.price} onChange={(e) => updateField(`categories[${catIndex}].services[${srvIndex}].price`, e.target.value)} /></div>
                                          <div><Label>Duração/Detalhe</Label><Input value={service.duration || ''} onChange={(e) => updateField(`categories[${catIndex}].services[${srvIndex}].duration`, e.target.value)} /></div>
                                      </div>
                                      <div><Label>Descrição do Serviço</Label><Textarea value={service.description} onChange={(e) => updateField(`categories[${catIndex}].services[${srvIndex}].description`, e.target.value)} rows={2} /></div>
                                      <div><Label className="text-sm">Imagens do Serviço</Label><MediaManager folder={`services_page/services/${service.id}`} mediaUrls={service.images || []} onMediaUpdate={(urls) => updateField(`categories[${catIndex}].services[${srvIndex}].images`, urls)} /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServicesPageManager;
