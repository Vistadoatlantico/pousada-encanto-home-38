import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MediaManager from './MediaManager';
import { Loader2 } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  image_urls: string[]; // Always a string array now
  sort_order: number;
  active: boolean;
}

const ServicesManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // This function now robustly handles various data formats for URLs
  // and crucially, trims and filters out empty or whitespace-only strings.
  const normalizeUrls = (field: any): string[] => {
    let urls: any[] = [];

    if (Array.isArray(field)) {
      urls = field;
    } else if (typeof field === 'string' && field.trim()) {
      const trimmedField = field.trim();
      if (trimmedField.startsWith('[') && trimmedField.endsWith(']')) {
        try {
          urls = JSON.parse(trimmedField);
          if (!Array.isArray(urls)) {
            urls = [urls]; // Handle cases like JSON.parse('"a string"')
          }
        } catch (e) {
          urls = [field]; // Treat as a literal string if JSON parsing fails
        }
      } else {
        urls = [field]; // A single URL string
      }
    }

    // Final cleanup: filter out non-strings and empty/whitespace strings, then trim.
    return urls
      .filter(u => typeof u === 'string' && u.trim() !== '')
      .map(u => u.trim());
  };

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, title, description, image_urls, sort_order, active')
        .order('sort_order');

      if (error) throw error;

      const formattedData = data?.map(s => ({
        ...s,
        image_urls: normalizeUrls(s.image_urls),
      })) || [];

      setServices(formattedData);
    } catch (error: any) {
      toast.error('Erro ao carregar serviços', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);
  
  const updateService = useCallback((serviceId: string, field: keyof Omit<Service, 'id'>, value: any) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, [field]: value } : s
    ));
  }, []);

  const handleSave = async (serviceId: string) => {
    setSaving(serviceId);
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) return;
      
      // Filter out any lingering empty strings one last time before saving
      const cleanImageUrls = service.image_urls.filter(url => url && url.trim() !== '');

      const { error } = await supabase
        .from('services')
        .update({
          title: service.title,
          description: service.description,
          image_urls: cleanImageUrls,
          sort_order: service.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId);

      if (error) throw error;

      toast.success(`Serviço ${service.title} atualizado.`);
      fetchServices(); // Refresh to be sure
    } catch (error: any) {
      toast.error('Erro ao salvar', { description: error.message });
    } finally {
      setSaving(null);
    }
  };

  const toggleServiceStatus = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    const newStatus = !service.active;
    try {
      const { error } = await supabase.from('services').update({ active: newStatus }).eq('id', serviceId);
      if (error) throw error;
      updateService(serviceId, 'active', newStatus);
      toast.success(`Serviço ${newStatus ? 'ativado' : 'desativado'}.`);
    } catch (error: any) {
      toast.error('Não foi possível alterar o status do serviço.', { description: error.message });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-paradise-blue"/></div>;
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Gerenciar Serviços da Home</CardTitle>
                <p className="text-sm text-muted-foreground pt-1">
                    Edite as informações e imagens dos serviços que aparecem na página inicial.
                </p>
            </CardHeader>
        </Card>

      <div className="grid gap-6">
        {services.map((service) => (
          <Card key={service.id} className={`${!service.active ? 'bg-muted/30' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-semibold">
                {service.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={service.active ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => toggleServiceStatus(service.id)}
                >
                  {service.active ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título do Serviço</label>
                  <Input
                    value={service.title}
                    onChange={(e) => updateService(service.id, 'title', e.target.value)}
                    placeholder="Nome do serviço"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordem de Exibição</label>
                  <Input
                    type="number"
                    value={service.sort_order}
                    onChange={(e) => updateService(service.id, 'sort_order', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                 <textarea
                  value={service.description}
                  onChange={(e) => updateService(service.id, 'description', e.target.value)}
                  placeholder="Descrição do serviço"
                  rows={3}
                  className="w-full p-2 border rounded-md text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                />
              </div>

              <MediaManager
                mediaUrls={service.image_urls}
                onMediaUpdate={(urls) => updateService(service.id, 'image_urls', urls)}
                folder={`services/${service.id}`}
              />

              <Button 
                onClick={() => handleSave(service.id)}
                disabled={saving === service.id}
                variant="paradise"
                className="w-full"
              >
                {saving === service.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicesManager;
