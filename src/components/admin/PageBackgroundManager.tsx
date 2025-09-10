import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageManager from "./ImageManager";

interface PageBackground {
  cafe_da_manha?: string;
  hospedagem?: string;
  day_use?: string;
  area_vip?: string;
  localizacao?: string;
  loja_virtual?: string;
  duvidas?: string;
}

const PageBackgroundManager = () => {
  const [backgrounds, setBackgrounds] = useState<PageBackground>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const fetchBackgrounds = async () => {
    try {
      const { data } = await supabase
        .from('site_content')
        .select('content, section_name')
        .in('section_name', ['cafe_da_manha', 'hospedagem', 'day_use', 'area_vip', 'localizacao', 'loja_virtual', 'duvidas']);
      
      if (data) {
        const backgroundData: PageBackground = {};
        data.forEach((item) => {
          if (item.content && typeof item.content === 'object') {
            const content = item.content as any;
            backgroundData[item.section_name as keyof PageBackground] = content.heroImage || content.background_image;
          }
        });
        setBackgrounds(backgroundData);
      }
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
    }
  };

  const updatePageBackground = async (pageKey: keyof PageBackground, imageUrl: string | null) => {
    setLoading(true);
    try {
      // First, check if content already exists
      const { data: existing } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', pageKey)
        .maybeSingle();

      const currentContent = (existing?.content as Record<string, any>) || {};
      const updatedContent = {
        ...currentContent,
        heroImage: imageUrl,
        background_image: imageUrl
      };

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('site_content')
          .update({ content: updatedContent })
          .eq('section_name', pageKey);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('site_content')
          .insert({
            section_name: pageKey,
            content: updatedContent
          });

        if (error) throw error;
      }

      setBackgrounds(prev => ({
        ...prev,
        [pageKey]: imageUrl
      }));

      toast({
        title: "Sucesso",
        description: "Imagem de fundo atualizada com sucesso!"
      });
    } catch (error) {
      console.error('Error updating background:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar imagem de fundo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const pageLabels = {
    cafe_da_manha: "Café da Manhã",
    hospedagem: "Hospedagem",
    day_use: "Day Use",
    area_vip: "Área VIP",
    localizacao: "Localização",
    loja_virtual: "Loja Virtual",
    duvidas: "Dúvidas"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Imagens de Fundo das Páginas</CardTitle>
        <CardDescription>Configure as imagens de fundo para todas as páginas do site</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cafe_da_manha" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            {Object.entries(pageLabels).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(pageLabels).map(([key, label]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Imagem de Fundo - {label}
                </h3>
                
                <ImageManager
                  pageKey={`${key}-background`}
                  currentImageUrl={backgrounds[key as keyof PageBackground]}
                  onImageUpdate={(imageUrl) => updatePageBackground(key as keyof PageBackground, imageUrl)}
                />
                
                {backgrounds[key as keyof PageBackground] && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Preview</h4>
                    <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={backgrounds[key as keyof PageBackground]} 
                        alt={`Background ${label}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">{label}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PageBackgroundManager;