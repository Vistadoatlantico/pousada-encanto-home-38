import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Eye, Video, Image as ImageIcon } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: 'photo' | 'video';
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MainGalleryManager = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [categories, setCategories] = useState<string[]>(['Geral', 'Piscina', 'Quartos', 'Restaurante', 'SPA', 'Área VIP']);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'photo' as 'photo' | 'video',
    category: 'Geral',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems((data || []) as GalleryItem[]);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      toast.error('Erro ao carregar itens da galeria');
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalMediaUrl = '';

      if (uploadType === 'file') {
        if (selectedFile) {
          finalMediaUrl = await uploadFile(selectedFile);
        } else if (editingItem) {
          finalMediaUrl = editingItem.media_url;
        } else {
          throw new Error('Arquivo é obrigatório');
        }
      } else {
        if (mediaUrl.trim()) {
          finalMediaUrl = mediaUrl.trim();
        } else if (editingItem) {
          finalMediaUrl = editingItem.media_url;
        } else {
          throw new Error('URL é obrigatória');
        }
      }

      const itemData = {
        ...formData,
        media_url: finalMediaUrl
      };

      if (editingItem) {
        const { error } = await supabase
          .from('gallery_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Item atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('gallery_items')
          .insert([itemData]);

        if (error) throw error;
        toast.success('Item adicionado com sucesso!');
      }

      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error saving gallery item:', error);
      toast.error('Erro ao salvar item da galeria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      media_type: item.media_type,
      category: item.category,
      display_order: item.display_order,
      is_active: item.is_active
    });
    setMediaUrl(item.media_url);
    setUploadType('url'); // Default to URL when editing
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Item excluído com sucesso!');
      fetchItems();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Item ${!isActive ? 'ativado' : 'desativado'} com sucesso!`);
      fetchItems();
    } catch (error) {
      console.error('Error toggling item status:', error);
      toast.error('Erro ao alterar status do item');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      media_type: 'photo',
      category: 'Geral',
      display_order: 0,
      is_active: true
    });
    setEditingItem(null);
    setSelectedFile(null);
    setMediaUrl('');
    setUploadType('file');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-paradise-blue">Gerenciar Galeria</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-paradise-blue hover:bg-paradise-blue/90">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Item' : 'Adicionar Item à Galeria'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Título *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título do item"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Mídia *</label>
                <Select 
                  value={formData.media_type} 
                  onValueChange={(value: 'photo' | 'video') => setFormData({ ...formData, media_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Foto</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Categoria *</label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ordem de Exibição</label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Método de Adição *</label>
                <Select 
                  value={uploadType} 
                  onValueChange={(value: 'file' | 'url') => {
                    setUploadType(value);
                    setSelectedFile(null);
                    setMediaUrl('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">Upload de Arquivo</SelectItem>
                    <SelectItem value="url">Link/URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {uploadType === 'file' ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {editingItem ? 'Alterar Arquivo (opcional)' : 'Arquivo *'}
                  </label>
                  <Input
                    type="file"
                    accept={formData.media_type === 'photo' ? 'image/*' : 'video/*'}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    required={!editingItem && uploadType === 'file'}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {editingItem ? 'Alterar URL (opcional)' : 'URL da Imagem/Vídeo *'}
                  </label>
                  <Input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    required={!editingItem && uploadType === 'url'}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole o link direto da imagem ou vídeo
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm font-medium">Ativo</label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Salvando...' : editingItem ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className={`${!item.is_active ? 'opacity-50' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {item.media_type === 'photo' ? (
                      <ImageIcon className="w-5 h-5" />
                    ) : (
                      <Video className="w-5 h-5" />
                    )}
                    {item.title}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    <Badge variant={item.is_active ? "default" : "destructive"}>
                      {item.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(item.id, item.is_active)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.description && (
                <p className="text-muted-foreground mb-3">{item.description}</p>
              )}
              <div className="relative rounded-lg overflow-hidden">
                {item.media_type === 'photo' ? (
                  <img
                    src={item.media_url}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <video
                    src={item.media_url}
                    controls
                    className="w-full h-48 object-cover"
                  />
                )}
              </div>
              <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
                <span>Ordem: {item.display_order}</span>
                <span>Criado: {new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhum item na galeria ainda.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em "Adicionar Item" para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MainGalleryManager;