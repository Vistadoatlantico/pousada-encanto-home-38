import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageManager from "./ImageManager";
import VideoUploader from "./VideoUploader";

interface SpaService {
  name: string;
  description: string;
  duration: string;
  price: string;
  image?: string;
  video?: string;
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
    services: [
      {
        name: "Massagem Relaxante",
        description: "Técnicas especiais para alívio do stress",
        duration: "60 minutos",
        price: "R$ 180,00"
      },
      {
        name: "Tratamento Facial",
        description: "Limpeza e hidratação profunda",
        duration: "45 minutos", 
        price: "R$ 150,00"
      }
    ],
    packages: [],
    heroImage: "",
    galleryImages: [],
    hours: "Das 9h às 19h",
    benefits: ["Ambiente tranquilo", "Profissionais qualificados", "Produtos premium", "Vista relaxante"]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'spa')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching spa content:', error);
        return;
      }
      
      if (data?.content && typeof data.content === 'object') {
        const fetchedContent = data.content as unknown as Partial<SpaContent>;
        setContent(prev => ({
          ...prev,
          ...fetchedContent,
          services: Array.isArray(fetchedContent.services) ? fetchedContent.services : prev.services,
          packages: Array.isArray(fetchedContent.packages) ? fetchedContent.packages : prev.packages,
          galleryImages: Array.isArray(fetchedContent.galleryImages) ? fetchedContent.galleryImages : prev.galleryImages,
          benefits: Array.isArray(fetchedContent.benefits) ? fetchedContent.benefits : prev.benefits
        }));
      }
    } catch (error) {
      console.error('Error in fetchContent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
        const { error } = await supabase
        .from('site_content')
        .upsert({
          section_name: 'spa',
          content: content as any
        });

      if (error) throw error;
      
      toast.success("Conteúdo do SPA salvo com sucesso!");
    } catch (error) {
      console.error('Error saving spa content:', error);
      toast.error("Erro ao salvar conteúdo do SPA");
    } finally {
      setIsSaving(false);
    }
  };

  const updateService = (index: number, field: keyof SpaService, value: string) => {
    setContent(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const addService = () => {
    setContent(prev => ({
      ...prev,
      services: [...prev.services, {
        name: "",
        description: "",
        duration: "",
        price: "",
        image: "",
        video: ""
      }]
    }));
  };

  const removeService = (index: number) => {
    setContent(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => 
        i === index ? value : benefit
      )
    }));
  };

  const addBenefit = () => {
    setContent(prev => ({
      ...prev,
      benefits: [...prev.benefits, ""]
    }));
  };

  const removeBenefit = (index: number) => {
    setContent(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar SPA</h2>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={content.subtitle}
              onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={content.description}
              onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="hours">Horário de Funcionamento</Label>
            <Input
              id="hours"
              value={content.hours}
              onChange={(e) => setContent(prev => ({ ...prev, hours: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hero Image */}
      <Card>
        <CardHeader>
          <CardTitle>Imagem Principal</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageManager
            pageKey="spa-hero"
            currentImageUrl={content.heroImage}
            onImageUpdate={(url) => setContent(prev => ({ ...prev, heroImage: url }))}
          />
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Serviços
            <Button onClick={addService} variant="outline" size="sm">
              Adicionar Serviço
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {content.services.map((service, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Serviço {index + 1}</h4>
                <Button 
                  onClick={() => removeService(index)} 
                  variant="destructive" 
                  size="sm"
                >
                  Remover
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`service-name-${index}`}>Nome</Label>
                  <Input
                    id={`service-name-${index}`}
                    value={service.name}
                    onChange={(e) => updateService(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`service-price-${index}`}>Preço</Label>
                  <Input
                    id={`service-price-${index}`}
                    value={service.price}
                    onChange={(e) => updateService(index, 'price', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor={`service-description-${index}`}>Descrição</Label>
                <Textarea
                  id={`service-description-${index}`}
                  value={service.description}
                  onChange={(e) => updateService(index, 'description', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor={`service-duration-${index}`}>Duração</Label>
                <Input
                  id={`service-duration-${index}`}
                  value={service.duration}
                  onChange={(e) => updateService(index, 'duration', e.target.value)}
                />
              </div>

              {/* Service Image */}
              <div>
                <Label>Imagem do Serviço</Label>
                <ImageManager
                  pageKey={`spa-service-${index}`}
                  currentImageUrl={service.image}
                  onImageUpdate={(url) => updateService(index, 'image', url || '')}
                />
              </div>

              {/* Service Video */}
              <div>
                <VideoUploader
                  currentVideoUrl={service.video}
                  onVideoUpdate={(url) => updateService(index, 'video', url || '')}
                  folderName={`service-${index}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Benefícios
            <Button onClick={addBenefit} variant="outline" size="sm">
              Adicionar Benefício
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={benefit}
                onChange={(e) => updateBenefit(index, e.target.value)}
                placeholder="Digite o benefício"
              />
              <Button 
                onClick={() => removeBenefit(index)} 
                variant="destructive" 
                size="sm"
              >
                Remover
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
};

export default SpaManager;