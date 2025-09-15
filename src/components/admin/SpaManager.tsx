import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MediaManager from "./MediaManager";
import { Plus, Minus, Loader2, Save } from 'lucide-react';

interface SpaService {
  name: string;
  description: string;
  duration: string;
  price: string;
  media: string[];
}

interface SpaContent {
  title: string;
  subtitle: string;
  description: string;
  services: SpaService[];
  packages: Array<{
    name: string;
    description: string;
    price: string;
    includes: string[];
  }>;
  heroImage?: string;
  galleryImages?: string[];
  hours: string;
  benefits: string[];
}

const SpaManager = () => {
  const [content, setContent] = useState<SpaContent>({
    title: "SPA",
    subtitle: "Relaxamento e bem-estar",
    description: "Desconecte-se da rotina e conecte-se com o seu bem-estar em nosso spa exclusivo.",
    services: [],
    packages: [],
    heroImage: "",
    galleryImages: [],
    hours: "Das 9h às 19h",
    benefits: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'spa')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.content && typeof data.content === 'object') {
        const fetched = data.content as Partial<SpaContent>;

        const normalizeUrls = (field: any): string[] => {
            if (Array.isArray(field)) {
                return field.filter(u => typeof u === 'string' && u);
            }
            if (typeof field === 'string') {
                if (field.startsWith('[') && field.endsWith(']')) {
                    try {
                        const parsed = JSON.parse(field);
                        return Array.isArray(parsed) ? parsed.filter(u => typeof u === 'string' && u) : [];
                    } catch (e) {
                        return [];
                    }
                }
                return field.trim() ? [field] : [];
            }
            return [];
        };

        setContent(prev => ({
          ...prev,
          ...fetched,
          heroImage: normalizeUrls(fetched.heroImage)[0] || '',
          galleryImages: normalizeUrls(fetched.galleryImages),
          services: (Array.isArray(fetched.services) ? fetched.services : []).map(s => ({
            ...s,
            media: normalizeUrls(s.media)
          })),
          packages: Array.isArray(fetched.packages) ? fetched.packages : [],
          benefits: Array.isArray(fetched.benefits) ? fetched.benefits : [],
        }));
      }
    } catch (error: any) {
      console.error('Error fetching spa content:', error);
      toast.error("Falha ao carregar conteúdo do SPA.", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ section_name: 'spa', content: content as any }, { onConflict: 'section_name' });

      if (error) throw error;
      toast.success("Conteúdo do SPA salvo com sucesso!");
      fetchContent(); // Re-fetch to ensure sync
    } catch (error: any) {
      console.error('Error saving spa content:', error);
      toast.error("Erro ao salvar conteúdo do SPA.", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof SpaContent, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  }

  const updateService = (index: number, field: keyof SpaService, value: any) => {
    setContent(prev => ({
      ...prev,
      services: prev.services.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const addService = () => {
    setContent(prev => ({
      ...prev,
      services: [...prev.services, { name: "", description: "", duration: "", price: "", media: [] }]
    }));
  };

  const removeService = (index: number) => {
    setContent(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
  };
  
  const updateBenefit = (index: number, value: string) => {
    setContent(prev => ({ ...prev, benefits: prev.benefits.map((b, i) => i === index ? value : b) }));
  };
  const addBenefit = () => setContent(prev => ({ ...prev, benefits: [...prev.benefits, ""] }));
  const removeBenefit = (index: number) => {
    setContent(prev => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== index) }));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-paradise-blue" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row justify-between items-center">
            <div className="space-y-1">
                <CardTitle>Gerenciar Página do SPA</CardTitle>
                <p className="text-sm text-muted-foreground">Edite as informações da página, serviços, tratamentos e galeria.</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving} variant="paradise">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
                {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
        </CardHeader>
    </Card>

      <Card>
        <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Título</Label><Input value={content.title} onChange={(e) => updateField('title', e.target.value)} /></div>
            <div><Label>Subtítulo</Label><Input value={content.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} /></div>
          </div>
          <div><Label>Descrição Principal</Label><Textarea value={content.description} onChange={(e) => updateField('description', e.target.value)} /></div>
          <div><Label>Horário de Funcionamento</Label><Input value={content.hours} onChange={(e) => updateField('hours', e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mídia da Página</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="border-b pb-6">
            <Label className="text-base font-medium">Imagem Principal (Hero)</Label>
            <p className="text-sm text-muted-foreground mb-2">Imagem de destaque que aparece no topo da página.</p>
            <MediaManager
              mediaUrls={content.heroImage ? [content.heroImage] : []}
              onMediaUpdate={(urls) => updateField('heroImage', urls[0] || '')}
              folder="spa/hero"
              isSingle
            />
          </div>
          <div>
            <Label className="text-base font-medium">Galeria de Imagens da Página</Label>
             <p className="text-sm text-muted-foreground mb-2">Imagens adicionais para a galeria da página do SPA.</p>
            <MediaManager
              mediaUrls={content.galleryImages || []}
              onMediaUpdate={(urls) => updateField('galleryImages', urls)}
              folder="spa/gallery"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex justify-between items-center">Benefícios<Button onClick={addBenefit} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4"/>Adicionar</Button></CardTitle></CardHeader>
        <CardContent className="space-y-2">
            {content.benefits.length === 0 && <p className="text-sm text-center text-muted-foreground">Nenhum benefício adicionado.</p>}
            {content.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2 items-center">
                <Input value={benefit} onChange={(e) => updateBenefit(index, e.target.value)} placeholder="Ex: Redução de estresse"/>
                <Button onClick={() => removeBenefit(index)} variant="destructive-outline" size="icon"><Minus className="h-4 w-4"/></Button>
                </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Tratamentos e Serviços
            <Button onClick={addService} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4"/>Adicionar</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.services.length === 0 && <p className="text-sm text-center text-muted-foreground">Nenhum serviço adicionado.</p>}
          {content.services.map((service, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">{service.name || `Serviço ${index + 1}`}</h4>
                <Button onClick={() => removeService(index)} variant="destructive" size="sm">Remover</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Nome</Label><Input value={service.name} onChange={(e) => updateService(index, 'name', e.target.value)} /></div>
                <div><Label>Preço</Label><Input value={service.price} onChange={(e) => updateService(index, 'price', e.target.value)} /></div>
              </div>
              <div><Label>Descrição</Label><Textarea value={service.description} onChange={(e) => updateService(index, 'description', e.target.value)} /></div>
              <div><Label>Duração</Label><Input value={service.duration} onChange={(e) => updateService(index, 'duration', e.gtarget.value)} /></div>
              <div>
                <Label>Mídias do Serviço (Imagens ou Vídeos)</Label>
                <MediaManager
                  mediaUrls={service.media}
                  onMediaUpdate={(urls) => updateService(index, 'media', urls)}
                  folder={`spa/services/${service.name.toLowerCase().replace(/\s+/g, '-') || index}`}
                />
              </div>
            </div>
          ))}\
        </CardContent>
      </Card>

    </div>
  );
};

export default SpaManager;
