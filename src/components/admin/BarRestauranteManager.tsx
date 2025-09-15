import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Save, Loader2 } from "lucide-react";
import MediaManager from "./MediaManager";

interface Content {
  title: string;
  subtitle: string;
  description: string;
  background_image: string;
  opening_hours: { restaurant: string; bar: string };
  contact: { phone: string; whatsapp: string };
  location: string;
  menu_food: string[]; 
  menu_drinks: string[];
  gallery_items: string[];
  specialties: string[];
}

const BarRestauranteManager = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState<Content>({
    title: "",
    subtitle: "",
    description: "",
    background_image: "",
    opening_hours: { restaurant: "", bar: "" },
    contact: { phone: "", whatsapp: "" },
    location: "",
    menu_food: [],
    menu_drinks: [],
    gallery_items: [],
    specialties: []
  });

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'bar_restaurante')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.content) {
        const fetched = data.content as Partial<Content>;

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
          opening_hours: { ...prev.opening_hours, ...fetched.opening_hours },
          contact: { ...prev.contact, ...fetched.contact },
          background_image: normalizeUrls(fetched.background_image)[0] || '',
          menu_food: normalizeUrls(fetched.menu_food),
          menu_drinks: normalizeUrls(fetched.menu_drinks),
          gallery_items: normalizeUrls(fetched.gallery_items),
          specialties: Array.isArray(fetched.specialties) ? fetched.specialties : [],
        }));
      }
    } catch (error: any) {
      toast.error("Erro ao carregar conteúdo.", { description: error.message });
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
        .upsert({ section_name: 'bar_restaurante', content: content as any }, { onConflict: 'section_name' });

      if (error) throw error;
      toast.success("Conteúdo da página salvo com sucesso!");
      fetchContent(); // Re-fetch to ensure sync
    } catch (error: any) {
      toast.error("Erro ao salvar.", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof Content, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNestedFieldChange = (section: 'opening_hours' | 'contact', field: string, value: string) => {
     setContent(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const addSpecialty = () => setContent(prev => ({ ...prev, specialties: [...prev.specialties, ''] }));
  const removeSpecialty = (index: number) => setContent(prev => ({ ...prev, specialties: prev.specialties.filter((_, i) => i !== index) }));
  const updateSpecialty = (index: number, value: string) => {
      const newSpecialties = [...content.specialties];
      newSpecialties[index] = value;
      setContent(prev => ({ ...prev, specialties: newSpecialties }));
  };

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-paradise-blue" /></div>;

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div className="space-y-1">
                    <CardTitle>Gerenciar Bar e Restaurante</CardTitle>
                    <p className="text-sm text-muted-foreground">Edite as informações da página, cardápios e galeria.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} variant="paradise">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </CardHeader>
        </Card>

      <Card>
        <CardHeader><CardTitle>Informações Principais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Título da Página</Label><Input value={content.title} onChange={(e) => handleFieldChange('title', e.target.value)} /></div>
              <div><Label>Subtítulo</Label><Input value={content.subtitle} onChange={(e) => handleFieldChange('subtitle', e.target.value)} /></div>
            </div>
            <div><Label>Texto de Descrição</Label><Textarea value={content.description} onChange={(e) => handleFieldChange('description', e.target.value)} rows={4} /></div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Informações de Contato e Horários</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Horário do Restaurante</Label><Input value={content.opening_hours.restaurant} onChange={(e) => handleNestedFieldChange('opening_hours', 'restaurant', e.target.value)} /></div>
            <div><Label>Horário do Bar</Label><Input value={content.opening_hours.bar} onChange={(e) => handleNestedFieldChange('opening_hours', 'bar', e.target.value)} /></div>
            <div><Label>Telefone de Contato</Label><Input value={content.contact.phone} onChange={(e) => handleNestedFieldChange('contact', 'phone', e.target.value)} /></div>
            <div><Label>Link do WhatsApp</Label><Input value={content.contact.whatsapp} onChange={(e) => handleNestedFieldChange('contact', 'whatsapp', e.target.value)} placeholder="https://wa.me/55..." /></div>
             <div><Label>Localização (texto)</Label><Input value={content.location} onChange={(e) => handleFieldChange('location', e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mídias</CardTitle></CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label className="text-base font-medium">Imagem de Fundo Principal</Label>
                 <p className="text-sm text-muted-foreground mb-2">Esta imagem aparecerá no topo da página.</p>
                <MediaManager mediaUrls={content.background_image ? [content.background_image] : []} onMediaUpdate={(urls) => handleFieldChange('background_image', urls[0] || '')} folder="bar-restaurante/background" isSingle/>
            </div>
            <div className="border-t pt-6">
                <Label className="text-base font-medium">Galeria de Fotos</Label>
                <p className="text-sm text-muted-foreground mb-2">Imagens que aparecerão na galeria da página.</p>
                <MediaManager mediaUrls={content.gallery_items} onMediaUpdate={(urls) => handleFieldChange('gallery_items', urls)} folder="bar-restaurante/gallery" />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Cardápios</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="text-base font-medium">Cardápio de Comidas</Label>
            <p className="text-sm text-muted-foreground mb-2">Envie o arquivo do cardápio (PDF ou imagem).</p>
             <MediaManager mediaUrls={content.menu_food} onMediaUpdate={(urls) => handleFieldChange('menu_food', urls)} folder="bar-restaurante/menus" />
          </div>
          <div>
            <Label className="text-base font-medium">Cardápio de Bebidas</Label>
             <p className="text-sm text-muted-foreground mb-2">Envie o arquivo do cardápio (PDF ou imagem).</p>
            <MediaManager mediaUrls={content.menu_drinks} onMediaUpdate={(urls) => handleFieldChange('menu_drinks', urls)} folder="bar-restaurante/menus" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex justify-between items-center">Especialidades da Casa<Button variant="outline" size="sm" onClick={addSpecialty}><Plus className="w-4 h-4 mr-2"/>Adicionar</Button></CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {content.specialties.map((specialty, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={specialty} onChange={e => updateSpecialty(index, e.target.value)} placeholder="Ex: Moqueca de Frutos do Mar"/>
              <Button variant="destructive-outline" size="icon" onClick={() => removeSpecialty(index)}><Trash2 className="w-4 h-4"/></Button>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
};

export default BarRestauranteManager;
