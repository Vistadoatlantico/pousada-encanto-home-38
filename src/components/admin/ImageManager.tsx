import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface ImageManagerProps {
  pageKey: string;
  currentImageUrl?: string | null;
  onImageUpdate: (imageUrl: string | null) => void;
}

const ImageManager = ({ pageKey, currentImageUrl, onImageUpdate }: ImageManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione apenas arquivos de imagem.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'O arquivo deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${pageKey}-${Date.now()}.${fileExt}`;
      const filePath = `pages/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Delete old image if exists and it's from Supabase storage
      if (currentImageUrl && currentImageUrl.includes('supabase.co/storage')) {
        const urlParts = currentImageUrl.split('/');
        const oldFileName = urlParts[urlParts.length - 1];
        const oldFilePath = `pages/${oldFileName}`;
        
        await supabase.storage
          .from('images')
          .remove([oldFilePath]);
      }

      // Update page content with new image URL
      onImageUpdate(publicUrl);

      toast({
        title: 'Sucesso!',
        description: 'Imagem enviada com sucesso.',
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Erro ao enviar imagem',
        description: error.message || 'Não foi possível enviar a imagem.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteCurrentImage = async () => {
    if (!currentImageUrl) return;

    setDeleting(true);
    try {
      // Extract file path from URL if it's a Supabase storage URL
      if (currentImageUrl.includes('supabase.co/storage')) {
        const urlParts = currentImageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `pages/${fileName}`;

        // Delete from Supabase Storage
        const { error } = await supabase.storage
          .from('images')
          .remove([filePath]);

        if (error) {
          console.error('Error deleting file from storage:', error);
        }
      }

      // Update page content (set to null)
      onImageUpdate(null);

      toast({
        title: 'Sucesso!',
        description: 'Imagem removida com sucesso.',
      });

    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Erro ao remover imagem',
        description: error.message || 'Não foi possível remover a imagem.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          {pageKey.includes('hero') ? 'Imagem de Fundo' : 'Gerenciar Imagem'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentImageUrl && (
          <div className="space-y-2">
            <Label>Imagem Atual</Label>
            <div className="relative">
              <img 
                src={currentImageUrl} 
                alt="Imagem atual" 
                className="w-full h-32 object-cover rounded-md border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={deleteCurrentImage}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`image-${pageKey}`}>
            {currentImageUrl ? 'Substituir Imagem' : 'Adicionar Imagem'}
          </Label>
          <div className="flex gap-2">
            <Input
              id={`image-${pageKey}`}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              ref={fileInputRef}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Enviando...' : 'Selecionar'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Formatos aceitos: JPG, PNG, GIF, WebP. Tamanho máximo: 5MB.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageManager;