import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, Upload } from "lucide-react";

interface CarouselImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CarouselManager = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    image_url: "",
    alt_text: "",
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar imagens do carrossel",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `carousel-${Date.now()}.${fileExt}`;
      const filePath = `carousel/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro",
        description: "Falha ao fazer upload da imagem",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('carousel_images')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Imagem atualizada com sucesso"
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('carousel_images')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Sucesso", 
          description: "Imagem adicionada com sucesso"
        });
      }

      resetForm();
      fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar imagem",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (image: CarouselImage) => {
    setEditingId(image.id);
    setFormData({
      image_url: image.image_url,
      alt_text: image.alt_text || "",
      display_order: image.display_order,
      is_active: image.is_active
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      const { error } = await supabase
        .from('carousel_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Imagem excluída com sucesso"
      });

      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir imagem",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      image_url: "",
      alt_text: "",
      display_order: 0,
      is_active: true
    });
    setEditingId(null);
    setIsAdding(false);
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Carrossel</h2>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Imagem
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Imagem' : 'Adicionar Nova Imagem'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="image_url">URL da Imagem</Label>
                <div className="flex gap-2">
                  <Input
                    id="image_url"
                    type="url"
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file);
                        if (url) {
                          setFormData({ ...formData, image_url: url });
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="alt_text">Texto Alternativo</Label>
                <Input
                  id="alt_text"
                  placeholder="Descrição da imagem"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="display_order">Ordem de Exibição</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id}>
            <CardContent className="p-4">
              <div className="aspect-video mb-3 overflow-hidden rounded-lg">
                <img
                  src={image.image_url}
                  alt={image.alt_text || 'Imagem do carrossel'}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600 truncate">
                  {image.alt_text || 'Sem descrição'}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Ordem: {image.display_order}</span>
                  <span className={`px-2 py-1 rounded ${image.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {image.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(image)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhuma imagem cadastrada ainda.</p>
            <Button onClick={() => setIsAdding(true)} className="mt-4">
              Adicionar Primeira Imagem
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CarouselManager;