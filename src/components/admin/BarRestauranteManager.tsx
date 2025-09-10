import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Save, Loader2 } from "lucide-react";

const BarRestauranteManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [content, setContent] = useState({
    title: "Bar e Restaurante",
    subtitle: "Sabores únicos com vista paradisíaca",
    description: "Desfrute de uma experiência gastronômica inesquecível em nosso restaurante com vista para a natureza",
    background_image: "",
    opening_hours: {
      restaurant: "Café da manhã: 6h às 10h | Almoço: 12h às 15h | Jantar: 18h às 22h",
      bar: "Diariamente das 10h às 23h"
    },
    contact: {
      phone: "(11) 99999-9999",
      whatsapp: "(11) 99999-9999"
    },
    location: "Hotel Paradise - Vista para a natureza",
    menu_categories: [],
    gallery_items: [], // Changed from gallery_images to support both images and videos
    specialties: []
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'bar_restaurante')
        .maybeSingle();

      if (error) throw error;
      
      if (data?.content) {
        const contentData = data.content as any;
        setContent(prev => ({
          ...prev,
          ...contentData,
          menu_categories: contentData.menu_categories || [],
          gallery_items: contentData.gallery_items || [],
          specialties: contentData.specialties || []
        }));
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Erro ao carregar conteúdo');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File, type: 'background' | 'gallery'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const isVideo = file.type.startsWith('video/');
    const fileName = `bar-restaurante-${type}-${Date.now()}.${fileExt}`;
    const bucket = isVideo ? 'spa-videos' : 'images'; // Use existing buckets
    const filePath = `pages/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleBackgroundUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      const file = selectedFiles[0]; // Only first file for background
      const imageUrl = await uploadFile(file, 'background');
      setContent(prev => ({ ...prev, background_image: imageUrl }));
      setSelectedFiles(null);
      toast.success('Imagem de fundo enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading background:', error);
      toast.error('Erro ao enviar imagem de fundo');
    }
  };

  const handleGalleryUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      const uploadPromises = Array.from(selectedFiles).map(file => uploadFile(file, 'gallery'));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const newGalleryItems = uploadedUrls.map(url => ({
        url,
        type: url.includes('spa-videos') ? 'video' : 'image'
      }));

      setContent(prev => ({ 
        ...prev, 
        gallery_items: [...prev.gallery_items, ...newGalleryItems] 
      }));
      setSelectedFiles(null);
      toast.success(`${uploadedUrls.length} arquivo(s) enviado(s) com sucesso!`);
    } catch (error) {
      console.error('Error uploading gallery files:', error);
      toast.error('Erro ao enviar arquivos');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: existing } = await supabase
        .from('site_content')
        .select('id')
        .eq('section_name', 'bar_restaurante')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('site_content')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('section_name', 'bar_restaurante');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_content')
          .insert([{ section_name: 'bar_restaurante', content }]);

        if (error) throw error;
      }

      toast.success('Conteúdo salvo com sucesso!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Erro ao salvar conteúdo');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título da página"
            />
          </div>

          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={content.subtitle}
              onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Subtítulo"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={content.description}
              onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do restaurante"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="restaurant-hours">Horário do Restaurante</Label>
            <Input
              id="restaurant-hours"
              value={content.opening_hours.restaurant}
              onChange={(e) => setContent(prev => ({ 
                ...prev, 
                opening_hours: { ...prev.opening_hours, restaurant: e.target.value }
              }))}
              placeholder="Ex: Café da manhã: 6h às 10h | Almoço: 12h às 15h"
            />
          </div>

          <div>
            <Label htmlFor="bar-hours">Horário do Bar</Label>
            <Input
              id="bar-hours"
              value={content.opening_hours.bar}
              onChange={(e) => setContent(prev => ({ 
                ...prev, 
                opening_hours: { ...prev.opening_hours, bar: e.target.value }
              }))}
              placeholder="Ex: Diariamente das 10h às 23h"
            />
          </div>

          <div>
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={content.location}
              onChange={(e) => setContent(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ex: Hotel Paradise - Vista para a natureza"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={content.contact.phone}
              onChange={(e) => setContent(prev => ({ 
                ...prev, 
                contact: { ...prev.contact, phone: e.target.value }
              }))}
              placeholder="Ex: (11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={content.contact.whatsapp}
              onChange={(e) => setContent(prev => ({ 
                ...prev, 
                contact: { ...prev.contact, whatsapp: e.target.value }
              }))}
              placeholder="Ex: (11) 99999-9999"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imagem de Fundo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Imagem de Fundo da Página</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFiles(e.target.files)}
              />
              <Button
                onClick={handleBackgroundUpload}
                disabled={!selectedFiles || selectedFiles.length === 0}
                variant="outline"
              >
                Enviar
              </Button>
            </div>
            {content.background_image && (
              <img
                src={content.background_image}
                alt="Fundo"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Especialidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.specialties.map((specialty, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={specialty}
                onChange={(e) => {
                  const newSpecialties = [...content.specialties];
                  newSpecialties[index] = e.target.value;
                  setContent(prev => ({ ...prev, specialties: newSpecialties }));
                }}
                placeholder={`Especialidade ${index + 1}`}
              />
              <Button
                onClick={() => {
                  const newSpecialties = content.specialties.filter((_, i) => i !== index);
                  setContent(prev => ({ ...prev, specialties: newSpecialties }));
                }}
                variant="outline"
                size="icon"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button 
            onClick={() => setContent(prev => ({ ...prev, specialties: [...prev.specialties, ''] }))} 
            variant="outline" 
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Especialidade
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Galeria de Imagens e Vídeos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Adicionar Arquivos (Imagens e Vídeos)</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
              />
              <Button
                onClick={handleGalleryUpload}
                disabled={!selectedFiles || selectedFiles.length === 0}
                variant="outline"
              >
                Enviar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {content.gallery_items.map((item, index) => (
              <div key={index} className="relative group">
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-32 object-cover rounded"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={`Galeria ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                )}
                <Button
                  onClick={() => {
                    const newItems = content.gallery_items.filter((_, i) => i !== index);
                    setContent(prev => ({ ...prev, gallery_items: newItems }));
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </>
        )}
      </Button>
    </div>
  );
};

export default BarRestauranteManager;