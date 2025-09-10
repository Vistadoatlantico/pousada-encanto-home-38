import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HospedagemContent {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

const HospedagemManager = () => {
  const [content, setContent] = useState<HospedagemContent>({
    title: "Hospedagem",
    subtitle: "Conforto e tranquilidade com vista para o mar",
    description: "Quartos aconchegantes com todas as comodidades para uma estadia perfeita.",
    features: []
  });
  const [loading, setLoading] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('section_name', 'hospedagem')
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao buscar conteúdo:', error);
      return;
    }
    
    if (data?.content && typeof data.content === 'object') {
      const existingContent = data.content as any;
      setContent(prev => ({ 
        ...prev, 
        title: existingContent.title || prev.title,
        subtitle: existingContent.subtitle || prev.subtitle,
        description: existingContent.description || prev.description,
        features: existingContent.features || []
      }));
    }
  };

  const saveContent = async () => {
    setLoading(true);
    
    try {
      // Primeiro verifica se o registro existe
      const { data: existing } = await supabase
        .from('site_content')
        .select('id')
        .eq('section_name', 'hospedagem')
        .maybeSingle();

      let result;
      if (existing) {
        // Atualiza o registro existente
        result = await supabase
          .from('site_content')
          .update({ content: content as any })
          .eq('section_name', 'hospedagem');
      } else {
        // Insere novo registro
        result = await supabase
          .from('site_content')
          .insert({
            section_name: 'hospedagem',
            content: content as any
          });
      }

      if (result.error) {
        toast({
          title: "Erro ao salvar conteúdo",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Conteúdo salvo com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar conteúdo",
        description: "Erro inesperado ao salvar",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    
    setContent({
      ...content,
      features: [...content.features, newFeature.trim()]
    });
    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    setContent({
      ...content,
      features: content.features.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo da Página de Hospedagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título Principal</Label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) => setContent({...content, title: e.target.value})}
              placeholder="Título da página"
            />
          </div>

          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={content.subtitle}
              onChange={(e) => setContent({...content, subtitle: e.target.value})}
              placeholder="Subtítulo da página"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={content.description}
              onChange={(e) => setContent({...content, description: e.target.value})}
              placeholder="Descrição das acomodações"
            />
          </div>

          {/* Features */}
          <div>
            <Label>Facilidades Incluídas</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Nova facilidade..."
                onKeyPress={(e) => e.key === 'Enter' && addFeature()}
              />
              <Button onClick={addFeature} type="button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded">
                  <span className="text-sm">{feature}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFeature(index)}
                    className="h-auto p-0 w-4 h-4 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={saveContent} disabled={loading} className="w-full">
            {loading ? 'Salvando...' : 'Salvar Conteúdo'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospedagemManager;