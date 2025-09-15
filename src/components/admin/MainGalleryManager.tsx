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
import { Trash2, Edit, Plus, Eye, Video, Image as ImageIcon, Loader2 } from "lucide-react";
import MediaManager from "./MediaManager";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  media_urls: string[]; // Corrected type
  media_type: 'photo' | 'video' | 'mixed';
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const MainGalleryManager = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [categories] = useState<string[]>(['Geral', 'Piscina', 'Quartos', 'Restaurante', 'SPA', 'Área VIP']);

  // Separate state for the form data
  const [formData, setFormData] = useState<Omit<GalleryItem, 'id' | 'created_at' | 'media_type'> & { media_urls: string[] }>({
    title: '',
    description: '',
    media_urls: [],
    category: 'Geral',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems(data?.map(item => ({...item, media_urls: Array.isArray(item.media_urls) ? item.media_urls : [item.media_urls].filter(Boolean)})) || []);
    } catch (error: any) {
      toast.error('Erro ao carregar itens da galeria', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      media_urls: [],
      category: 'Geral',
      display_order: 0,
      is_active: true,
    });
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.media_urls.length === 0) {
      toast.error("Por favor, adicione pelo menos uma mídia.");
      return;
    }
    setIsSaving(true);

    try {
      const hasImages = formData.media_urls.some(url => url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/));
      const hasVideos = formData.media_urls.some(url => url.toLowerCase().match(/\.(mp4|webm|ogv)$/));
      let media_type: 'photo' | 'video' | 'mixed' = hasImages ? 'photo' : 'video';
      if (hasImages && hasVideos) media_type = 'mixed';

      const dataToSave = { ...formData, media_type };

      const { error } = await supabase
        .from('gallery_items')
        .upsert({ ...dataToSave, id: editingItem?.id }, { onConflict: 'id' });

      if (error) throw error;

      toast.success(editingItem ? 'Item atualizado com sucesso!' : 'Item adicionado com sucesso!');
      resetForm();
      fetchItems();
    } catch (error: any) {
      toast.error('Erro ao salvar item.', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
        title: item.title,
        description: item.description || '',
        media_urls: Array.isArray(item.media_urls) ? item.media_urls : [item.media_urls].filter(Boolean),
        category: item.category,
        display_order: item.display_order,
        is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este item permanentemente?')) return;

    try {
      // Note: This does not delete files from storage. That would require a more complex setup.
      const { error } = await supabase.from('gallery_items').delete().eq('id', id);
      if (error) throw error;
      toast.success('Item excluído com sucesso!');
      fetchItems();
    } catch (error: any) {
      toast.error('Erro ao excluir item', { description: error.message });
    }
  };

  const toggleActive = async (item: GalleryItem) => {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({ is_active: !item.is_active })
        .eq('id', item.id);

      if (error) throw error;
      toast.success(`Status do item atualizado!`);
      fetchItems(); // Refresh data
    } catch (error: any) {
      toast.error('Erro ao alterar status do item', { description: error.message });
    }
  };

  const getMediaTypeIcon = (type: string | undefined) => {
    if (type === 'video') return <Video className="w-4 h-4 text-muted-foreground" />;
    if (type === 'mixed') return <><ImageIcon className="w-4 h-4 text-muted-foreground" /><Video className="w-4 h-4 text-muted-foreground" /></>;
    return <ImageIcon className="w-4 h-4 text-muted-foreground" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Gerenciar Galeria Principal</CardTitle>
                <p className="text-sm text-muted-foreground pt-1">Adicione, edite e remova os itens da galeria de fotos e vídeos.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => resetForm()} variant="paradise">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>{editingItem ? 'Editar Item' : 'Adicionar Novo Item'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Título *</label>
                        <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Categoria *</label>
                        <Select value={formData.category} onValueChange={value => setFormData({...formData, category: value})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
                </div>
                <div>
                    <label className="text-sm font-medium">Mídias</label>
                    <MediaManager
                        folder={`gallery/${editingItem?.id || 'new'}`}
                        mediaUrls={formData.media_urls}
                        onMediaUpdate={urls => setFormData({...formData, media_urls: urls})}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="text-sm font-medium">Ordem de Exibição</label>
                        <Input type="number" value={formData.display_order} onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="flex items-center space-x-2 pb-1">
                        <input type="checkbox" id="is_active_checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="h-4 w-4"/>
                        <label htmlFor="is_active_checkbox" className="text-sm font-medium">Item Ativo</label>
                    </div>
                </div>
                <div className="flex gap-2 pt-4 justify-end">
                    <Button type="button" variant="ghost" onClick={resetForm}>Cancelar</Button>
                    <Button type="submit" disabled={isSaving} variant="paradise">
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                        {editingItem ? 'Salvar Alterações' : 'Criar Item'}
                    </Button>
                </div>
                </form>
            </DialogContent>
            </Dialog>
        </CardHeader>

        <CardContent className="pt-6">
            {isLoading ? <div className="text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div> :
            items.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">Nenhum item na galeria.</div>
            ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                <Card key={item.id} className={`${!item.is_active ? 'opacity-50 bg-muted/50' : ''}`}>
                    <CardHeader className="p-0 relative">
                        <div className="aspect-video w-full bg-muted overflow-hidden rounded-t-lg">
                           {item.media_urls[0] ? <img src={item.media_urls[0]} alt={item.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-muted-foreground"><ImageIcon/></div>}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold leading-snug flex-1 mr-2">{item.title}</h3>
                            <div className="flex items-center gap-2">
                                {getMediaTypeIcon(item.media_type)}
                                <Badge variant="secondary">{item.category}</Badge>
                            </div>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <div className="text-xs text-muted-foreground">Ordem: {item.display_order}</div>
                            <div className="flex gap-1">
                                <Button size="icon" variant={item.is_active ? 'outline' : 'secondary'} onClick={() => toggleActive(item)} className="h-8 w-8">
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="outline" onClick={() => handleEdit(item)} className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                                <Button size="icon" variant="destructive-outline" onClick={() => handleDelete(item.id)} className="h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                ))}
            </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MainGalleryManager;
