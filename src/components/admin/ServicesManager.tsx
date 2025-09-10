import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageManager from './ImageManager';
import { Grip } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
}

const ServicesManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      setServices(data || []);
    } catch (error) {
      toast({
        title: 'Erro ao carregar serviços',
        description: 'Não foi possível carregar os serviços.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (serviceId: string) => {
    setSaving(serviceId);
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) return;

      const { error } = await supabase
        .from('services')
        .update({
          title: service.title,
          description: service.description,
          image_url: service.image_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: `Serviço ${service.title} atualizado.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const updateService = (serviceId: string, field: keyof Service, value: any) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, [field]: value }
        : service
    ));
  };

  const toggleServiceStatus = async (serviceId: string) => {
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) return;

      const newStatus = !service.active;
      
      const { error } = await supabase
        .from('services')
        .update({ active: newStatus })
        .eq('id', serviceId);

      if (error) throw error;

      updateService(serviceId, 'active', newStatus);

      toast({
        title: 'Sucesso!',
        description: `Serviço ${newStatus ? 'ativado' : 'desativado'}.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do serviço.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando serviços...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-paradise-blue mb-2">Gerenciar Serviços</h2>
        <p className="text-muted-foreground">
          Edite as informações e imagens dos serviços oferecidos
        </p>
      </div>

      <div className="grid gap-6">
        {services.map((service) => (
          <Card key={service.id} className={`${!service.active ? 'opacity-60' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Grip className="w-4 h-4 text-muted-foreground" />
                {service.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={service.active ? "outline" : "default"}
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
                  <Label>Título do Serviço</Label>
                  <Input
                    value={service.title}
                    onChange={(e) => updateService(service.id, 'title', e.target.value)}
                    placeholder="Nome do serviço"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ordem de Exibição</Label>
                  <Input
                    type="number"
                    value={service.sort_order}
                    onChange={(e) => updateService(service.id, 'sort_order', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={service.description}
                  onChange={(e) => updateService(service.id, 'description', e.target.value)}
                  placeholder="Descrição do serviço"
                  rows={3}
                />
              </div>

              {/* Image Manager */}
              <ImageManager
                pageKey={`service-${service.id}`}
                currentImageUrl={service.image_url}
                onImageUpdate={(imageUrl) => updateService(service.id, 'image_url', imageUrl)}
              />

              <Button 
                onClick={() => handleSave(service.id)}
                disabled={saving === service.id}
                variant="paradise"
                className="w-full"
              >
                {saving === service.id ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicesManager;