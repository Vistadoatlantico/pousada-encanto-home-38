import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Save, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'day_use')
        .maybeSingle();
      
      if (error) throw error;
      
      if (data?.content && typeof data.content === 'object') {
        const fetchedContent = data.content as unknown as Partial<DayUseContent>;
        setContent(prev => ({
          ...prev,
          ...fetchedContent,
          includes: Array.isArray(fetchedContent.includes) ? fetchedContent.includes : prev.includes,
          packages: Array.isArray(fetchedContent.packages) ? fetchedContent.packages : prev.packages,
          galleryImages: Array.isArray(fetchedContent.galleryImages) ? fetchedContent.galleryImages : prev.galleryImages || []
        }));
      }
    } catch (error) {
      console.error('Error fetching day use content:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o conteúdo do Day Use.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Primeiro verificar se já existe um registro
      const { data: existingData } = await supabase
        .from('site_content')
        .select('id')
        .eq('section_name', 'day_use')
        .maybeSingle();

      let error;
      if (existingData) {
        // Se existe, fazer UPDATE
        const { error: updateError } = await supabase
          .from('site_content')
          .update({ content: content as any })
          .eq('section_name', 'day_use');
        error = updateError;
      } else {
        // Se não existe, fazer INSERT
        const { error: insertError } = await supabase
          .from('site_content')
          .insert({
            section_name: 'day_use',
            content: content as any
          });
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conteúdo do Day Use salvo com sucesso!",
      });
    } catch (error) {
      console.error('Error saving day use content:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o conteúdo do Day Use.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addIncludeItem = () => {
    setContent(prev => ({
      ...prev,
      includes: [...prev.includes, ""]
    }));
  };

  const removeIncludeItem = (index: number) => {
    setContent(prev => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index)
    }));
  };

  const updateIncludeItem = (index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      includes: prev.includes.map((item, i) => i === index ? value : item)
    }));
  };

  const addPackage = () => {
    setContent(prev => ({
      ...prev,
      packages: [...prev.packages, { name: "", description: "", price: "", duration: "" }]
    }));
  };

  const removePackage = (index: number) => {
    setContent(prev => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index)
    }));
  };

  const updatePackage = (index: number, field: keyof DayUsePackage, value: string) => {
    setContent(prev => ({
      ...prev,
      packages: prev.packages.map((pkg, i) => 
        i === index ? { ...pkg, [field]: value } : pkg
      )
    }));
  };

  const handleImageUpload = async (file: File, isHero: boolean = false) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `day-use/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const imageUrl = data.publicUrl;

      if (isHero) {
        setContent(prev => ({ ...prev, heroImage: imageUrl }));
      } else {
        setContent(prev => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), imageUrl]
        }));
      }

      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setContent(prev => ({
      ...prev,
      galleryImages: prev.galleryImages?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gerenciar Day Use
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid gap-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Day Use"
            />
          </div>
          
          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={content.subtitle}
              onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Desfrute de um dia completo de lazer"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={content.description}
              onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Aproveite todas as nossas facilidades durante o dia..."
              rows={3}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hours">Horário de Funcionamento</Label>
              <Input
                id="hours"
                value={content.hours}
                onChange={(e) => setContent(prev => ({ ...prev, hours: e.target.value }))}
                placeholder="Das 8h às 18h"
              />
            </div>
            
            <div>
              <Label htmlFor="price">Preço Base</Label>
              <Input
                id="price"
                value={content.price}
                onChange={(e) => setContent(prev => ({ ...prev, price: e.target.value }))}
                placeholder="R$ 80,00 por pessoa"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* What's Included */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">O que está incluso</Label>
            <Button onClick={addIncludeItem} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {content.includes.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateIncludeItem(index, e.target.value)}
                  placeholder="Ex: Piscina, Área de lazer..."
                />
                <Button
                  onClick={() => removeIncludeItem(index)}
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Images Management */}
        <div>
          <Label className="text-base font-semibold mb-4 block">Gerenciamento de Imagens</Label>
          
          {/* Hero Image */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">Imagem Principal</Label>
            <div className="flex items-center gap-4">
              <Input
                type="url"
                value={content.heroImage || ""}
                onChange={(e) => setContent(prev => ({ ...prev, heroImage: e.target.value }))}
                placeholder="URL da imagem principal"
                className="flex-1"
              />
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], true)}
                  className="hidden"
                  id="hero-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('hero-image-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
            {content.heroImage && (
              <div className="mt-2">
                <img 
                  src={content.heroImage} 
                  alt="Imagem principal" 
                  className="w-32 h-20 object-cover rounded border"
                />
              </div>
            )}
          </div>

          {/* Gallery Images */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">Galeria de Imagens</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], false)}
                  className="hidden"
                  id="gallery-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('gallery-image-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar à Galeria
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {(content.galleryImages || []).map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={image} 
                    alt={`Galeria ${index + 1}`} 
                    className="w-full h-24 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                    onClick={() => removeGalleryImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Packages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">Pacotes de Day Use</Label>
            <Button onClick={addPackage} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Pacote
            </Button>
          </div>
          
          <div className="space-y-6">
            {content.packages.map((pkg, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Pacote {index + 1}</h4>
                    <Button
                      onClick={() => removePackage(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor={`pkg-name-${index}`}>Nome do Pacote</Label>
                      <Input
                        id={`pkg-name-${index}`}
                        value={pkg.name}
                        onChange={(e) => updatePackage(index, 'name', e.target.value)}
                        placeholder="Ex: Day Use Premium"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`pkg-desc-${index}`}>Descrição</Label>
                      <Textarea
                        id={`pkg-desc-${index}`}
                        value={pkg.description}
                        onChange={(e) => updatePackage(index, 'description', e.target.value)}
                        placeholder="Descreva o que inclui este pacote"
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`pkg-price-${index}`}>Preço</Label>
                        <Input
                          id={`pkg-price-${index}`}
                          value={pkg.price}
                          onChange={(e) => updatePackage(index, 'price', e.target.value)}
                          placeholder="R$ 150,00"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`pkg-duration-${index}`}>Duração</Label>
                        <Input
                          id={`pkg-duration-${index}`}
                          value={pkg.duration}
                          onChange={(e) => updatePackage(index, 'duration', e.target.value)}
                          placeholder="8h às 18h"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DayUseManager;