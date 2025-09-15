import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MediaManager from "./MediaManager";
import { Loader2, Save } from "lucide-react";

interface CarouselContent {
  media: string[]; 
}

const CarouselManager = () => {
  const [content, setContent] = useState<CarouselContent>({ media: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'carousel')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error; 

      if (data?.content) {
        const mediaContent = data.content as any;
        const media = Array.isArray(mediaContent.media)
          ? mediaContent.media
          : (Array.isArray(mediaContent) ? mediaContent : []);
        setContent({ media });
      }
    } catch (error: any) {
      toast.error("Falha ao carregar mídias do carrossel.", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          section_name: 'carousel',
          content: { media: content.media },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section_name'
        });

      if (error) throw error;

      toast.success("Carrossel atualizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar o carrossel.", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaUpdate = (urls: string[]) => {
    setContent({ media: urls });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-paradise-blue" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Gerenciar Carrossel Principal</CardTitle>
              <p className="text-sm text-muted-foreground pt-1">
                Adicione e remova as mídias do carrossel da página inicial.
              </p>
            </div>
            <Button onClick={handleSave} disabled={isSaving} variant="paradise">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
        </CardHeader>
        <CardContent>
          <MediaManager
            folder="carousel"
            mediaUrls={content.media}
            onMediaUpdate={handleMediaUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CarouselManager;
