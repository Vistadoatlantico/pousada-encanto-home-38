import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, MapPin } from 'lucide-react';

interface LocationContent {
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  directions: string[];
  landmarks: string[];
}

const LocationManager = () => {
  const [content, setContent] = useState<LocationContent>({
    title: '',
    subtitle: '',
    address: '',
    phone: '',
    email: '',
    hours: '',
    directions: [],
    landmarks: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [directionsText, setDirectionsText] = useState('');
  const [landmarksText, setLandmarksText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'localizacao')
        .single();
      
      if (data?.content && typeof data.content === 'object') {
        const locationContent = data.content as Partial<LocationContent>;
        setContent(prev => ({ ...prev, ...locationContent }));
        setDirectionsText(locationContent.directions?.join('\n') || '');
        setLandmarksText(locationContent.landmarks?.join('\n') || '');
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedContent = {
        ...content,
        directions: directionsText.split('\n').filter(line => line.trim()),
        landmarks: landmarksText.split('\n').filter(line => line.trim())
      };

      // Verificar se o registro já existe
      const { data: existing } = await supabase
        .from('site_content')
        .select('id')
        .eq('section_name', 'localizacao')
        .single();

      let error;
      if (existing) {
        // Atualizar registro existente
        ({ error } = await supabase
          .from('site_content')
          .update({ content: updatedContent })
          .eq('section_name', 'localizacao'));
      } else {
        // Criar novo registro
        ({ error } = await supabase
          .from('site_content')
          .insert({
            section_name: 'localizacao',
            content: updatedContent
          }));
      }

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Conteúdo da localização atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o conteúdo da localização.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Gerenciar Página de Localização
          </CardTitle>
          <CardDescription>
            Configure as informações e conteúdo da página de localização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Títulos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título Principal</label>
              <Input
                value={content.title}
                onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Localização"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subtítulo</label>
              <Input
                value={content.subtitle}
                onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Ex: Fácil acesso e vista privilegiada"
              />
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Endereço</label>
              <Textarea
                value={content.address}
                onChange={(e) => setContent(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Ex: Rua da Praia, 123 - Beira Mar, Cidade - Estado"
                rows={3}
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={content.phone}
                  onChange={(e) => setContent(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ex: (11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-mail</label>
                <Input
                  value={content.email}
                  onChange={(e) => setContent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ex: contato@paradise.com.br"
                />
              </div>
            </div>
          </div>

          {/* Horário de Funcionamento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Horário de Funcionamento</label>
            <Input
              value={content.hours}
              onChange={(e) => setContent(prev => ({ ...prev, hours: e.target.value }))}
              placeholder="Ex: Todos os dias das 7h às 22h"
            />
          </div>

          {/* Como Chegar */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Como Chegar</label>
            <Textarea
              value={directionsText}
              onChange={(e) => setDirectionsText(e.target.value)}
              placeholder="Digite cada direção em uma linha separada&#10;Ex:&#10;Pela BR-101, saia no km 125&#10;Siga por 5km até a orla&#10;Vire à direita na Rua da Praia"
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Digite cada direção em uma linha separada
            </p>
          </div>

          {/* Pontos de Referência */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pontos de Referência</label>
            <Textarea
              value={landmarksText}
              onChange={(e) => setLandmarksText(e.target.value)}
              placeholder="Digite cada ponto de referência em uma linha separada&#10;Ex:&#10;Próximo ao Farol da Cidade&#10;500m da Praça Central&#10;1km do Shopping Mar Azul"
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Digite cada ponto de referência em uma linha separada
            </p>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationManager;