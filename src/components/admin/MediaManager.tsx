import { useCallback } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Upload, Loader2, ImageOff } from 'lucide-react';
import { useState } from 'react';

interface MediaManagerProps {
  mediaUrls: string[] | string | null; 
  onMediaUpdate: (urls: string[]) => void;
  folder?: string;
  isSingle?: boolean;
}

const MediaManager = ({ 
  mediaUrls,
  onMediaUpdate, 
  folder = 'general',
  isSingle = false
}: MediaManagerProps) => {
  const [uploading, setUploading] = useState(false);

  const currentMedia = Array.isArray(mediaUrls) ? mediaUrls.filter(Boolean) : (typeof mediaUrls === 'string' && mediaUrls ? [mediaUrls] : []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExtension = file.name.split('.').pop();
      const filePath = `${folder}/${uuidv4()}.${fileExtension}`;
      
      try {
        const { error: uploadError } = await supabase.storage
          .from('lovable-uploads')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('lovable-uploads')
          .getPublicUrl(filePath);

        if (!publicUrl) throw new Error('Não foi possível obter a URL pública.');

        uploadedUrls.push(publicUrl);

      } catch (error: any) {
        toast.error(`Falha ao enviar o arquivo: ${file.name}`, { description: error.message });
      }
    }

    if (uploadedUrls.length > 0) {
      const newMedia = isSingle ? uploadedUrls.slice(0, 1) : [...currentMedia, ...uploadedUrls];
      onMediaUpdate(newMedia);
      toast.success(`${uploadedUrls.length} arquivo(s) enviados com sucesso.`);
    }

    setUploading(false);
    event.target.value = ''; 
  };

  const handleRemove = useCallback(async (urlToDelete: string) => {
    if (!urlToDelete) return;

    try {
      const bucketName = 'lovable-uploads';
      let filePath = '';

      if (urlToDelete.includes(`/${bucketName}/`)) {
        const pathParts = urlToDelete.split(`/${bucketName}/`);
        if (pathParts.length < 2) {
          toast.error('Não foi possível remover o arquivo.', { description: 'URL inválida ou malformada.' });
          return;
        }
        filePath = decodeURIComponent(pathParts[1]);
      } else {
        if (urlToDelete.startsWith('/') || urlToDelete.includes('..')) {
          toast.error('Não foi possível remover o arquivo.', { description: 'Caminho do arquivo inválido.' });
          return;
        }
        filePath = urlToDelete;
      }

      if (!filePath) {
        toast.error('Não foi possível determinar o caminho do arquivo para remoção.');
        return;
      }

      const { error } = await supabase.storage.from(bucketName).remove([filePath]);

      if (error && error.message !== 'The resource was not found') {
        throw error;
      }
      
      onMediaUpdate(currentMedia.filter(url => url !== urlToDelete));
      toast.success('Mídia removida com sucesso.');

    } catch (error: any) {
      toast.error('Erro ao remover a mídia.', { description: error.message });
    }
  }, [currentMedia, onMediaUpdate]);

  const canAddMore = !isSingle || currentMedia.length === 0;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          {isSingle ? 'Gerenciar Mídia' : 'Gerenciar Mídias'}
        </h3>
        
        {canAddMore && (
          <label htmlFor={`media-upload-${folder}`} 
            className={`${buttonVariants({ variant: 'outline', size: 'sm' })} cursor-pointer flex items-center`}
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {uploading ? 'Enviando...' : 'Adicionar'}
          </label>
        )}
        <Input 
          id={`media-upload-${folder}`} 
          type="file" 
          multiple={!isSingle}
          accept="image/*,video/*"
          className="hidden" 
          onChange={handleFileChange} 
          disabled={uploading || !canAddMore}
        />
      </div>
      
      {currentMedia.length > 0 ? (
        <div className={`grid gap-4 ${isSingle ? 'grid-cols-1 max-w-xs' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'}`}>
          {currentMedia.map((url, index) => (
            <div key={url || index} className="relative group aspect-square">
              <img 
                src={url} 
                alt={`Mídia ${index + 1}`} 
                className="w-full h-full object-cover rounded-md border"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-md -z-10">
                  <ImageOff className="w-8 h-8 text-muted-foreground"/>
              </div>
              <button 
                className={`${buttonVariants({ variant: "destructive", size: "icon" })} absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => handleRemove(url)}
                title="Remover mídia"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-center text-muted-foreground py-4 border-dashed border-2 rounded-lg">
          Nenhuma mídia adicionada.
        </div>
      )}
    </div>
  );
};

export default MediaManager;
