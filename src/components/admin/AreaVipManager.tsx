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

interface AreaVipPackage {
  name: string;
  description: string;
  price: string;
  capacity: string;
  includes: string[];
}

interface AreaVipContent {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  packages: AreaVipPackage[];
  heroImages?: string[];
  galleryImages?: string[];
}

const AreaVipManager = () => {
  const [content, setContent] = useState<AreaVipContent>({
    title: "",
    subtitle: "",
    description: "",
    features: [],
    packages: [],
    heroImages: [],
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
        .eq('section_name', 'area_vip')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.content && typeof data.content === 'object') {
        const fetched = data.content as Partial<AreaVipContent>;

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

        const hero = normalizeUrls(fetched.heroImages);
        const gallery = normalizeUrls(fetched.galleryImages);

        setContent(prev => ({
          ...prev,
          ...fetched,
          features: Array.isArray(fetched.features) ? fetched.features : [],
          packages: (Array.isArray(fetched.packages) ? fetched.packages : []).map(p => ({ ...p, includes: Array.isArray(p.includes) ? p.includes : [] })),
          heroImages: hero,
          galleryImages: gallery
        }));
      }
    } catch (error: any) {
      toast.error("Falha ao carregar conteúdo da Área VIP.", { description: error.message });
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
        .upsert({ section_name: 'area_vip', content: content as any }, { onConflict: 'section_name' });

      if (error) throw error;
      toast.success("Conteúdo da Área VIP atualizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar conteúdo.", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = useCallback((field: keyof AreaVipContent, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  }, []);

  const updatePackage = (index: number, field: keyof AreaVipPackage, value: any) => {
      const newPackages = [...content.packages];
      newPackages[index] = {...newPackages[index], [field]: value};
      updateField('packages', newPackages);
  };

  const addFeature = () => updateField('features', [...content.features, ""]);
  const removeFeature = (index: number) => updateField('features', content.features.filter((_, i) => i !== index));
  const updateFeature = (index: number, value: string) => updateField('features', content.features.map((f, i) => i === index ? value : f));

  const addPackage = () => updateField('packages', [...content.packages, { name: "", description: "", price: "", capacity: "", includes: [] }]);
  const removePackage = (index: number) => updateField('packages', content.packages.filter((_, i) => i !== index));

  const addPackageInclude = (pkgIndex: number) => {
      const newPackages = [...content.packages];
      newPackages[pkgIndex].includes.push("");
      updateField('packages', newPackages);
  };
  const removePackageInclude = (pkgIndex: number, incIndex: number) => {
      const newPackages = [...content.packages];
      newPackages[pkgIndex].includes = newPackages[pkgIndex].includes.filter((_, i) => i !== incIndex);
      updateField('packages', newPackages);
  };
  const updatePackageInclude = (pkgIndex: number, incIndex: number, value: string) => {
      const newPackages = [...content.packages];
      newPackages[pkgIndex].includes[incIndex] = value;
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
              <CardTitle>Gerenciar Área VIP</CardTitle>
              <p className="text-sm text-muted-foreground">Edite todos os detalhes da página da Área VIP.</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving} variant="paradise">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader><CardTitle>Conteúdo Principal</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Título</Label><Input value={content.title} onChange={(e) => updateField('title', e.target.value)} /></div>
            <div><Label>Subtítulo</Label><Input value={content.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} /></div>
          </div>
          <div><Label>Descrição Principal</Label><Textarea value={content.description} onChange={(e) => updateField('description', e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mídias da Página</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Imagens do Topo (Carrossel)</Label>
            <p className="text-sm text-muted-foreground mb-2">Essas imagens aparecerão no topo da página.</p>
            <MediaManager
              mediaUrls={content.heroImages || []}
              onMediaUpdate={(urls) => updateField('heroImages', urls)}
              folder="area-vip/hero"
            />
          </div>
          <div className="border-t pt-6">
            <Label className="text-base font-medium">Galeria de Fotos</Label>
             <p className="text-sm text-muted-foreground mb-2">Galeria de imagens complementares da área VIP.</p>
            <MediaManager
              mediaUrls={content.galleryImages || []}
              onMediaUpdate={(urls) => updateField('galleryImages', urls)}
              folder="area-vip/gallery"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex justify-between items-center">Características e Benefícios<Button onClick={addFeature} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4"/>Adicionar</Button></CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {content.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={feature} onChange={(e) => updateFeature(index, e.target.value)} placeholder="Ex: Wi-Fi de alta velocidade"/>
              <Button onClick={() => removeFeature(index)} variant="destructive" size="icon"><Minus className="h-4 w-4"/></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex justify-between items-center">Pacotes Disponíveis<Button onClick={addPackage} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4"/>Adicionar</Button></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {content.packages.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum pacote adicionado.</p>}
          {content.packages.map((pkg, index) => (
            <div key={index} className="border rounded-lg p-4 bg-muted/50 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">{pkg.name || `Pacote ${index + 1}`}</h4>
                <Button onClick={() => removePackage(index)} variant="destructive-outline" size="sm">Remover Pacote</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Nome do Pacote</Label><Input value={pkg.name} onChange={(e) => updatePackage(index, 'name', e.target.value)} /></div>
                <div><Label>Preço</Label><Input value={pkg.price} onChange={(e) => updatePackage(index, 'price', e.target.value)} /></div>
                <div><Label>Capacidade de Pessoas</Label><Input value={pkg.capacity} onChange={(e) => updatePackage(index, 'capacity', e.target.value)} /></div>
              </div>
              <div><Label>Descrição do Pacote</Label><Textarea value={pkg.description} onChange={(e) => updatePackage(index, 'description', e.target.value)} /></div>
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <Label>Itens Inclusos no Pacote</Label>
                  <Button onClick={() => addPackageInclude(index)} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4"/>Add Item</Button>
                </div>
                {pkg.includes.map((include, incIndex) => (
                  <div key={incIndex} className="flex items-center gap-2">
                    <Input value={include} onChange={(e) => updatePackageInclude(index, incIndex, e.target.value)} placeholder="Ex: 1 Garrafa de Espumante"/>
                    <Button onClick={() => removePackageInclude(index, incIndex)} variant="ghost" size="icon" className="text-destructive"><Minus className="h-4 w-4"/></Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AreaVipManager;
