import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageManager from "./ImageManager";

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
  heroImage?: string;
  galleryImages?: string[];
}

const AreaVipManager = () => {
  const [content, setContent] = useState<AreaVipContent>({
    title: "Área VIP",
    subtitle: "Exclusividade e conforto para momentos especiais",
    description: "Desfrute de um espaço reservado com serviços premium e atendimento personalizado.",
    features: ["Área privativa", "Serviço de garçom", "Som ambiente", "Decoração especial"],
    packages: [
      {
        name: "VIP Família",
        description: "Perfeito para celebrações familiares",
        price: "R$ 300,00",
        capacity: "Até 8 pessoas",
        includes: ["Área reservada", "Bebidas inclusas", "Petiscos", "4 horas"]
      },
      {
        name: "VIP Premium",
        description: "Para ocasiões ainda mais especiais",
        price: "R$ 500,00", 
        capacity: "Até 12 pessoas",
        includes: ["Área exclusiva", "Open bar", "Buffet completo", "6 horas", "Decoração"]
      }
    ],
    heroImage: "",
    galleryImages: []
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
        .eq('section_name', 'area_vip')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching area VIP content:', error);
        return;
      }
      
      if (data?.content && typeof data.content === 'object') {
        const fetchedContent = data.content as unknown as Partial<AreaVipContent>;
        setContent(prev => ({
          ...prev,
          ...fetchedContent,
          features: Array.isArray(fetchedContent.features) ? fetchedContent.features : prev.features,
          packages: Array.isArray(fetchedContent.packages) ? fetchedContent.packages : prev.packages,
          galleryImages: Array.isArray(fetchedContent.galleryImages) ? fetchedContent.galleryImages : prev.galleryImages
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
      
      // Filter out empty features and package includes
      const cleanedContent = {
        ...content,
        features: content.features.filter(feature => feature.trim() !== ''),
        packages: content.packages.map(pkg => ({
          ...pkg,
          includes: pkg.includes.filter(include => include.trim() !== '')
        }))
      };
      
      // Check if record exists
      const { data: existingRecord } = await supabase
        .from('site_content')
        .select('id')
        .eq('section_name', 'area_vip')
        .maybeSingle();

      let result;
      if (existingRecord) {
        // Update existing record
        result = await supabase
          .from('site_content')
          .update({ content: cleanedContent })
          .eq('section_name', 'area_vip');
      } else {
        // Insert new record
        result = await supabase
          .from('site_content')
          .insert({
            section_name: 'area_vip',
            content: cleanedContent
          });
      }

      if (result.error) throw result.error;
      
      toast.success("Conteúdo da Área VIP salvo com sucesso!");
    } catch (error) {
      console.error('Error saving area VIP content:', error);
      toast.error("Erro ao salvar conteúdo da Área VIP");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePackage = (index: number, field: keyof AreaVipPackage, value: string | string[]) => {
    setContent(prev => ({
      ...prev,
      packages: prev.packages.map((pkg, i) => 
        i === index ? { ...pkg, [field]: value } : pkg
      )
    }));
  };

  const addPackage = () => {
    setContent(prev => ({
      ...prev,
      packages: [...prev.packages, {
        name: "",
        description: "",
        price: "",
        capacity: "",
        includes: []
      }]
    }));
  };

  const removePackage = (index: number) => {
    setContent(prev => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? value : feature
      )
    }));
  };

  const addFeature = () => {
    setContent(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }));
  };

  const removeFeature = (index: number) => {
    setContent(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updatePackageInclude = (packageIndex: number, includeIndex: number, value: string) => {
    setContent(prev => ({
      ...prev,
      packages: prev.packages.map((pkg, i) => 
        i === packageIndex 
          ? { ...pkg, includes: pkg.includes.map((inc, j) => j === includeIndex ? value : inc) }
          : pkg
      )
    }));
  };

  const addPackageInclude = (packageIndex: number) => {
    setContent(prev => ({
      ...prev,
      packages: prev.packages.map((pkg, i) => 
        i === packageIndex 
          ? { ...pkg, includes: [...pkg.includes, ""] }
          : pkg
      )
    }));
  };

  const removePackageInclude = (packageIndex: number, includeIndex: number) => {
    setContent(prev => ({
      ...prev,
      packages: prev.packages.map((pkg, i) => 
        i === packageIndex 
          ? { ...pkg, includes: pkg.includes.filter((_, j) => j !== includeIndex) }
          : pkg
      )
    }));
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Área VIP</h2>
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
        </CardContent>
      </Card>

      {/* Hero Image */}
      <Card>
        <CardHeader>
          <CardTitle>Imagem Principal</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageManager
            pageKey="area-vip-hero"
            currentImageUrl={content.heroImage}
            onImageUpdate={(url) => setContent(prev => ({ ...prev, heroImage: url }))}
          />
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Características da Experiência VIP
            <Button onClick={addFeature} variant="outline" size="sm">
              Adicionar Característica
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.features.map((feature, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Digite a característica"
              />
              <Button 
                onClick={() => removeFeature(index)} 
                variant="destructive" 
                size="sm"
              >
                Remover
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Pacotes VIP
            <Button onClick={addPackage} variant="outline" size="sm">
              Adicionar Pacote
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {content.packages.map((pkg, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Pacote {index + 1}</h4>
                <Button 
                  onClick={() => removePackage(index)} 
                  variant="destructive" 
                  size="sm"
                >
                  Remover
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`package-name-${index}`}>Nome do Pacote</Label>
                  <Input
                    id={`package-name-${index}`}
                    value={pkg.name}
                    onChange={(e) => updatePackage(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`package-price-${index}`}>Preço</Label>
                  <Input
                    id={`package-price-${index}`}
                    value={pkg.price}
                    onChange={(e) => updatePackage(index, 'price', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor={`package-description-${index}`}>Descrição</Label>
                <Textarea
                  id={`package-description-${index}`}
                  value={pkg.description}
                  onChange={(e) => updatePackage(index, 'description', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor={`package-capacity-${index}`}>Capacidade</Label>
                <Input
                  id={`package-capacity-${index}`}
                  value={pkg.capacity}
                  onChange={(e) => updatePackage(index, 'capacity', e.target.value)}
                />
              </div>

              {/* Package Includes */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Itens Inclusos</Label>
                  <Button 
                    onClick={() => addPackageInclude(index)} 
                    variant="outline" 
                    size="sm"
                  >
                    Adicionar Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {pkg.includes.map((include, includeIndex) => (
                    <div key={includeIndex} className="flex gap-2 items-center">
                      <Input
                        value={include}
                        onChange={(e) => updatePackageInclude(index, includeIndex, e.target.value)}
                        placeholder="Digite o item incluso"
                      />
                      <Button 
                        onClick={() => removePackageInclude(index, includeIndex)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Gallery Images */}
      <Card>
        <CardHeader>
          <CardTitle>Galeria de Imagens</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageManager
            pageKey="area-vip-gallery"
            currentImageUrl={content.galleryImages?.[0]}
            onImageUpdate={(url) => {
              setContent(prev => ({
                ...prev,
                galleryImages: url ? [url, ...(prev.galleryImages?.slice(1) || [])] : prev.galleryImages?.slice(1) || []
              }));
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AreaVipManager;