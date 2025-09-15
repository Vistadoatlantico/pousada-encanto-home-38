import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import MediaManager from "./MediaManager";

interface DayUsePackage {
  name: string;
  description: string;
  price: string;
  duration: string;
}

interface DayUseContent {
  title: string;
  subtitle: string;
  description: string;
  hours: string;
  price: string;
  includes: string[];
  packages: DayUsePackage[];
  heroImage?: string;
  galleryImages?: string[];
}

const DayUseManager = () => {
  const [content, setContent] = useState<DayUseContent>({
    title: "",
    subtitle: "",
    description: "",
    hours: "",
    price: "",
    includes: [],
    packages: [],
    heroImage: "",
    galleryImages: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'day_use')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.content && typeof data.content === 'object') {
        const fetched = data.content as Partial<DayUseContent>;

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
          includes: Array.isArray(fetched.includes) ? fetched.includes : [],
          packages: Array.isArray(fetched.packages) ? fetched.packages : [],
          heroImage: normalizeUrls(fetched.heroImage)[0] || '',
          galleryImages: normalizeUrls(fetched.galleryImages)
        }));
      }
    } catch (error: any) {
      toast.error("Não foi possível carregar o conteúdo do Day Use.", { description: error.message });
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
        .upsert({ section_name: 'day_use', content: content as any }, { onConflict: 'section_name' });

      if (error) throw error;
      toast.success("Conteúdo do Day Use salvo com sucesso!");
    } catch (error: any) {
      toast.error("Não foi possível salvar o conteúdo.", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  const updateField = useCallback((field: keyof DayUseContent, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  }, []);

  const addIncludeItem = () => updateField('includes', [...content.includes, ""]);
  const removeIncludeItem = (index: number) => updateField('includes', content.includes.filter((_, i) => i !== index));
  const updateIncludeItem = (index: number, value: string) => updateField('includes', content.includes.map((item, i) => (i === index ? value : item)));
  
  const addPackage = () => updateField('packages', [...content.packages, { name: "", description: "", price: "", duration: "" }]);
  const removePackage = (index: number) => updateField('packages', content.packages.filter((_, i) => i !== index));
  const updatePackage = (index: number, field: keyof DayUsePackage, value: string) => {
    const newPackages = [...content.packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    updateField('packages', newPackages);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-paradise-blue" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row justify-between items-center">
          <div className="space-y-1">
            <CardTitle>Gerenciar Página "Day Use"</CardTitle>
            <p className="text-sm text-muted-foreground">Edite as informações da página, preços, imagens e pacotes.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} variant="paradise">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader><CardTitle>Informações Principais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Título da Página</Label><Input value={content.title} onChange={(e) => updateField('title', e.target.value)} /></div>
            <div><Label>Subtítulo</Label><Input value={content.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} /></div>
          </div>
          <div><Label>Descrição Principal</Label><Textarea value={content.description} onChange={(e) => updateField('description', e.target.value)} rows={4} /></div>
          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div><Label>Horário de Funcionamento</Label><Input value={content.hours} onChange={(e) => updateField('hours', e.target.value)} placeholder="Ex: 09h às 18h"/></div>
            <div><Label>Preço Base (por pessoa)</Label><Input value={content.price} onChange={(e) => updateField('price', e.target.value)} placeholder="Ex: R$ 150,00"/></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mídias da Página</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Imagem Principal (Hero)</Label>
            <p className="text-sm text-muted-foreground mb-2">Imagem de destaque que aparece no topo da página.</p>
            <MediaManager
              mediaUrls={content.heroImage ? [content.heroImage] : []}
              onMediaUpdate={(urls) => updateField('heroImage', urls[0] || '')}
              folder="day-use/hero"
              isSingle
            />
          </div>
          <div className="border-t pt-6">
            <Label className="text-base font-medium">Galeria de Imagens</Label>
            <p className="text-sm text-muted-foreground mb-2">Imagens adicionais para a galeria da página.</p>
            <MediaManager
              mediaUrls={content.galleryImages || []}
              onMediaUpdate={(urls) => updateField('galleryImages', urls)}
              folder="day-use/gallery"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex justify-between items-center">Itens Inclusos no Day Use<Button onClick={addIncludeItem} size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Adicionar</Button></CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {content.includes.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input value={item} onChange={(e) => updateIncludeItem(index, e.target.value)} placeholder="Ex: Acesso à piscina"/>
              <Button onClick={() => removeIncludeItem(index)} size="icon" variant="destructive-outline"><Minus className="w-4 h-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex justify-between items-center">Pacotes Opcionais<Button onClick={addPackage} size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Adicionar Pacote</Button></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {content.packages.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum pacote opcional adicionado.</p>}
          {content.packages.map((pkg, index) => (
            <div key={index} className="border rounded-lg p-4 bg-muted/50 space-y-3">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-lg">{pkg.name || `Pacote ${index + 1}`}</h4>
                    <Button onClick={() => removePackage(index)} size="sm" variant="destructive">Remover</Button>
                </div>
                <div className="space-y-3">
                    <div><Label>Nome do Pacote</Label><Input value={pkg.name} onChange={(e) => updatePackage(index, 'name', e.target.value)} /></div>
                    <div><Label>Descrição</Label><Textarea value={pkg.description} onChange={(e) => updatePackage(index, 'description', e.target.value)} rows={3} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Preço Adicional</Label><Input value={pkg.price} onChange={(e) => updatePackage(index, 'price', e.target.value)} /></div>
                        <div><Label>Duração / Detalhes</Label><Input value={pkg.duration} onChange={(e) => updatePackage(index, 'duration', e.target.value)} /></div>
                    </div>
                </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DayUseManager;
