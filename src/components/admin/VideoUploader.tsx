import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Upload, Video } from "lucide-react";

interface VideoUploaderProps {
  currentVideoUrl?: string;
  onVideoUpdate: (url: string | null) => void;
  bucketName?: string;
  folderName?: string;
}

const VideoUploader = ({ 
  currentVideoUrl, 
  onVideoUpdate, 
  bucketName = "spa-videos",
  folderName = "" 
}: VideoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error("Por favor, selecione um arquivo de vídeo válido");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 50MB");
      return;
    }

    try {
      setIsUploading(true);
      
      const fileName = `${folderName ? folderName + '/' : ''}${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      onVideoUpdate(publicUrl);
      toast.success("Vídeo enviado com sucesso!");
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error("Erro ao enviar vídeo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = async () => {
    if (currentVideoUrl) {
      try {
        // Extract file path from URL to delete from storage
        const urlParts = currentVideoUrl.split('/');
        const bucketIndex = urlParts.findIndex(part => part === bucketName);
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          const filePath = urlParts.slice(bucketIndex + 1).join('/');
          await supabase.storage.from(bucketName).remove([filePath]);
        }
      } catch (error) {
        console.error('Error removing file from storage:', error);
      }
    }
    
    onVideoUpdate(null);
    toast.success("Vídeo removido com sucesso!");
  };

  return (
    <div className="space-y-4">
      <Label>Vídeo do Serviço</Label>
      
      {currentVideoUrl ? (
        <div className="space-y-2">
          <div className="relative">
            <video 
              src={currentVideoUrl} 
              controls 
              className="w-full max-w-sm h-32 object-cover rounded-lg"
            >
              Seu navegador não suporta vídeos.
            </video>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveVideo}
            >
              <X className="w-4 h-4 mr-2" />
              Remover Vídeo
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Clique para enviar um vídeo</p>
            <p className="text-xs text-gray-500">MP4, WebM, AVI até 50MB</p>
          </div>
          <Input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={isUploading}
            className="mt-4"
          />
          {isUploading && (
            <div className="mt-2 flex items-center justify-center">
              <Upload className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Enviando vídeo...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUploader;