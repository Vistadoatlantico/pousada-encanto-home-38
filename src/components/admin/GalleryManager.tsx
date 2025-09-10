import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GalleryManagerProps {
  pageKey: string;
  galleryImages: string[];
  onGalleryUpdate: (images: string[]) => void;
  maxImages?: number;
}

const GalleryManager = ({ pageKey, galleryImages, onGalleryUpdate, maxImages = 10 }: GalleryManagerProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pageKey}-gallery-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `pages/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(selectedFile);
      const updatedImages = [...galleryImages, imageUrl];
      onGalleryUpdate(updatedImages);
      setSelectedFile(null);
      toast.success('Imagem adicionada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = galleryImages.filter((_, index) => index !== indexToRemove);
    onGalleryUpdate(updatedImages);
    toast.success('Imagem removida com sucesso!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galeria de Imagens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="space-y-3">
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              disabled={galleryImages.length >= maxImages}
            />
            {galleryImages.length >= maxImages && (
              <p className="text-sm text-muted-foreground mt-1">
                Máximo de {maxImages} imagens atingido
              </p>
            )}
          </div>
          <Button
            onClick={handleFileUpload}
            disabled={!selectedFile || isUploading || galleryImages.length >= maxImages}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isUploading ? 'Enviando...' : 'Adicionar Imagem'}
          </Button>
        </div>

        {/* Images Grid */}
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Galeria ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {galleryImages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma imagem na galeria</p>
            <p className="text-sm">Adicione imagens usando o botão acima</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GalleryManager;