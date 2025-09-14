import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageManager from './ImageManager';
import GalleryManager from './GalleryManager';
import FAQManager from './FAQManager';

interface PageContent {
  section_name: string;
  content: any;
}

const pages = [
  { key: 'hero', name: 'Início', description: 'Conteúdo da página inicial' },
  { key: 'cafe_da_manha', name: 'Café da Manhã', description: 'Informações sobre café da manhã' },
  { key: 'duvidas', name: 'Dúvidas', description: 'Perguntas frequentes' },
];

const PagesEditor = () => {
  const [contents, setContents] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllContents();
  }, []);

  const fetchAllContents = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .in('section_name', pages.map(p => p.key));

      if (error) throw error;

      const contentMap: Record<string, any> = {};
      data?.forEach(item => {
        contentMap[item.section_name] = item.content || {};
      });
      
      setContents(contentMap);
    } catch (error) {
      toast({
        title: 'Erro ao carregar conteúdos',
        description: 'Não foi possível carregar os conteúdos das páginas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pageKey: string) => {
    setSaving(pageKey);
    try {
      // Verificar se o registro já existe
      const { data: existing } = await supabase
        .from('site_content')
        .select('id')
        .eq('section_name', pageKey)
        .maybeSingle();

      if (existing) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('site_content')
          .update({
            content: contents[pageKey] || {},
            updated_at: new Date().toISOString(),
          })
          .eq('section_name', pageKey);

        if (error) throw error;
      } else {
        // Inserir novo registro
        const { error } = await supabase
          .from('site_content')
          .insert({
            section_name: pageKey,
            content: contents[pageKey] || {},
          });

        if (error) throw error;
      }

      toast({
        title: 'Sucesso!',
        description: `Conteúdo da página ${pages.find(p => p.key === pageKey)?.name} atualizado.`,
      });
      
      // Recarregar conteúdos para garantir sincronização
      await fetchAllContents();
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const updateContent = (pageKey: string, field: string, value: any) => {
    setContents(prev => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Carregando conteúdos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-paradise-blue mb-2">Editor de Páginas</h2>
        <p className="text-muted-foreground">
          Edite o conteúdo de todas as páginas do site
        </p>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-1">
          {pages.map(page => (
            <TabsTrigger key={page.key} value={page.key} className="text-xs">
              {page.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {pages.map(page => (
          <TabsContent key={page.key} value={page.key}>
            <Card>
              <CardHeader>
                <CardTitle>{page.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{page.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {page.key === 'hero' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Texto do Logo</Label>
                        <Input
                          value={contents[page.key]?.logo_text || 'Paradise'}
                          onChange={(e) => updateContent(page.key, 'logo_text', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtítulo</Label>
                        <Input
                          value={contents[page.key]?.subtitle || 'Vista do Atlântico'}
                          onChange={(e) => updateContent(page.key, 'subtitle', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Título Principal</Label>
                      <Input
                        value={contents[page.key]?.main_title || 'CONFIRA NOSSAS OFERTAS'}
                        onChange={(e) => updateContent(page.key, 'main_title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Texto do Botão</Label>
                      <Input
                        value={contents[page.key]?.cta_text || 'Reserve agora!'}
                        onChange={(e) => updateContent(page.key, 'cta_text', e.target.value)}
                      />
                    </div>
                    
                    {/* Background Image Manager for Hero */}
                    {/* <ImageManager
                      pageKey="hero-background"
                      currentImageUrl={contents[page.key]?.background_image_url}
                      onImageUpdate={(imageUrl) => updateContent(page.key, 'background_image_url', imageUrl)}
                    /> */}
                  </>
                )}

                {page.key === 'cafe_da_manha' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={contents[page.key]?.title || ''}
                          onChange={(e) => updateContent(page.key, 'title', e.target.value)}
                          placeholder="Título da página"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtítulo</Label>
                        <Input
                          value={contents[page.key]?.subtitle || ''}
                          onChange={(e) => updateContent(page.key, 'subtitle', e.target.value)}
                          placeholder="Subtítulo da página"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={contents[page.key]?.description || ''}
                        onChange={(e) => updateContent(page.key, 'description', e.target.value)}
                        placeholder="Descrição principal"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Horário</Label>
                        <Input
                          value={contents[page.key]?.hours || ''}
                          onChange={(e) => updateContent(page.key, 'hours', e.target.value)}
                          placeholder="Ex: Servido das 7h às 10h"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Preço</Label>
                        <Input
                          value={contents[page.key]?.price || ''}
                          onChange={(e) => updateContent(page.key, 'price', e.target.value)}
                          placeholder="Ex: R$ 25,00 por pessoa"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>O que está incluído (separe por vírgula)</Label>
                      <Input
                        value={contents[page.key]?.includes?.join(', ') || ''}
                        onChange={(e) => updateContent(page.key, 'includes', e.target.value.split(',').map(s => s.trim()))}
                        placeholder="Ex: Frutas frescas, Pães artesanais, Café premium"
                      />
                    </div>
                    
                    {/* Background Image Manager */}
                    <ImageManager
                      pageKey="cafe-background"
                      currentImageUrl={contents[page.key]?.background_image_url}
                      onImageUpdate={(imageUrl) => updateContent(page.key, 'background_image_url', imageUrl)}
                    />
                    
                    {/* Gallery Manager */}
                    <GalleryManager
                      pageKey="cafe"
                      galleryImages={contents[page.key]?.gallery_images || []}
                      onGalleryUpdate={(images) => updateContent(page.key, 'gallery_images', images)}
                      maxImages={6}
                    />
                  </>
                )}


                {page.key === 'duvidas' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Título da Página</Label>
                        <Input
                          value={contents[page.key]?.title || 'Dúvidas'}
                          onChange={(e) => updateContent(page.key, 'title', e.target.value)}
                          placeholder="Título da página"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtítulo da Página</Label>
                        <Input
                          value={contents[page.key]?.subtitle || 'Encontre respostas para as perguntas mais frequentes'}
                          onChange={(e) => updateContent(page.key, 'subtitle', e.target.value)}
                          placeholder="Subtítulo da página"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Descrição da Seção FAQ</Label>
                      <Textarea
                        value={contents[page.key]?.faq_description || 'Tire suas dúvidas antes de sua visita ao Paradise Vista do Atlântico'}
                        onChange={(e) => updateContent(page.key, 'faq_description', e.target.value)}
                        placeholder="Descrição que aparece acima das perguntas frequentes"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Título da Seção de Contato</Label>
                      <Input
                        value={contents[page.key]?.contact_title || 'Não encontrou sua resposta?'}
                        onChange={(e) => updateContent(page.key, 'contact_title', e.target.value)}
                        placeholder="Título da seção de contato"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição da Seção de Contato</Label>
                      <Input
                        value={contents[page.key]?.contact_description || 'Entre em contato conosco e teremos prazer em ajudá-lo'}
                        onChange={(e) => updateContent(page.key, 'contact_description', e.target.value)}
                        placeholder="Descrição da seção de contato"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email de Contato</Label>
                        <Input
                          value={contents[page.key]?.contact_email || 'diretoria@pousadavistadoatlantico.com.br'}
                          onChange={(e) => updateContent(page.key, 'contact_email', e.target.value)}
                          placeholder="email@paradise.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <Input
                          value={contents[page.key]?.whatsapp || '5582982235336'}
                          onChange={(e) => updateContent(page.key, 'whatsapp', e.target.value)}
                          placeholder="5582999999999 (somente números)"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={contents[page.key]?.phone || '5582982235336'}
                        onChange={(e) => updateContent(page.key, 'phone', e.target.value)}
                        placeholder="5582999999999 (somente números)"
                      />
                    </div>
                    
                    {/* Background Image Manager */}
                    <ImageManager
                      pageKey="duvidas-background"
                      currentImageUrl={contents[page.key]?.background_image_url}
                      onImageUpdate={(imageUrl) => updateContent(page.key, 'background_image_url', imageUrl)}
                    />

                    {/* FAQ Manager */}
                    <FAQManager
                      faqs={contents[page.key]?.faqs || []}
                      onFAQsUpdate={(faqs) => updateContent(page.key, 'faqs', faqs)}
                    />
                  </>
                )}

                <Button 
                  onClick={() => handleSave(page.key)}
                  disabled={saving === page.key}
                  variant="paradise"
                  className="w-full"
                >
                  {saving === page.key ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PagesEditor;