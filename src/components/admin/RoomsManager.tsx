import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Room {
  id: string;
  name: string;
  description: string;
  price: string;
  amenities: string[];
  images: string[];
  is_active: boolean;
  display_order: number;
}

const RoomsManager = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [newAmenity, setNewAmenity] = useState("");
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('display_order');
    
    if (error) {
      toast({
        title: "Erro ao carregar quartos",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setRooms(data || []);
    }
  };

  const createNewRoom = () => {
    const newRoom: Room = {
      id: 'new',
      name: '',
      description: '',
      price: '',
      amenities: [],
      images: [],
      is_active: true,
      display_order: rooms.length + 1
    };
    setEditingRoom(newRoom);
  };

  const saveRoom = async () => {
    if (!editingRoom) return;
    
    setLoading(true);
    
    const roomData = {
      name: editingRoom.name,
      description: editingRoom.description,
      price: editingRoom.price,
      amenities: editingRoom.amenities,
      images: editingRoom.images,
      is_active: editingRoom.is_active,
      display_order: editingRoom.display_order
    };

    let error;
    
    if (editingRoom.id === 'new') {
      const { error: insertError } = await supabase
        .from('rooms')
        .insert([roomData]);
      error = insertError;
    } else {
      const { error: updateError } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('id', editingRoom.id);
      error = updateError;
    }

    if (error) {
      toast({
        title: "Erro ao salvar quarto",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Quarto salvo com sucesso!",
      });
      setEditingRoom(null);
      fetchRooms();
    }
    
    setLoading(false);
  };

  const deleteRoom = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este quarto?')) {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro ao excluir quarto",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Quarto excluído com sucesso!",
        });
        fetchRooms();
      }
    }
  };

  const addAmenity = () => {
    if (!editingRoom || !newAmenity.trim()) return;
    
    setEditingRoom({
      ...editingRoom,
      amenities: [...editingRoom.amenities, newAmenity.trim()]
    });
    setNewAmenity("");
  };

  const removeAmenity = (index: number) => {
    if (!editingRoom) return;
    
    setEditingRoom({
      ...editingRoom,
      amenities: editingRoom.amenities.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingRoom || !event.target.files?.length) return;

    const files = Array.from(event.target.files);
    setUploadingImages({ [editingRoom.id]: true });

    try {
      const uploadedImages: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `room-${editingRoom.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);

        uploadedImages.push(publicUrl);
      }

      setEditingRoom({
        ...editingRoom,
        images: [...editingRoom.images, ...uploadedImages]
      });

      toast({
        title: `${uploadedImages.length} imagem(ns) adicionada(s)!`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload da imagem",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingImages({ [editingRoom.id]: false });
    }
  };

  const removeImage = async (imageUrl: string, index: number) => {
    if (!editingRoom) return;

    try {
      // Extract filename from URL to delete from storage
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      await supabase.storage
        .from('images')
        .remove([fileName]);

      setEditingRoom({
        ...editingRoom,
        images: editingRoom.images.filter((_, i) => i !== index)
      });

      toast({
        title: "Imagem removida com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover imagem",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addImageByUrl = () => {
    if (!editingRoom || !imageUrl.trim()) return;

    // Simple URL validation
    try {
      new URL(imageUrl);
    } catch {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida para a imagem",
        variant: "destructive"
      });
      return;
    }

    setEditingRoom({
      ...editingRoom,
      images: [...editingRoom.images, imageUrl.trim()]
    });
    
    setImageUrl("");
    toast({
      title: "Imagem adicionada com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Quartos</h2>
        <Button onClick={createNewRoom}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Quarto
        </Button>
      </div>

      {/* Lista de Quartos */}
      <div className="grid gap-4">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{room.name}</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingRoom(room)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteRoom(room.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">{room.description}</p>
              <p className="font-semibold text-paradise-blue">{room.price}</p>
              <p className="text-sm text-muted-foreground">
                Comodidades: {room.amenities.join(', ')}
              </p>
              <p className="text-sm text-muted-foreground">
                Imagens: {room.images.length}
              </p>
              <p className="text-sm">
                Status: {room.is_active ? 'Ativo' : 'Inativo'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Edição */}
      {editingRoom && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-background">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{editingRoom.id === 'new' ? 'Novo Quarto' : 'Editar Quarto'}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setEditingRoom(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Quarto</Label>
              <Input
                id="name"
                value={editingRoom.name}
                onChange={(e) => setEditingRoom({...editingRoom, name: e.target.value})}
                placeholder="Ex: Suíte Presidencial"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={editingRoom.description}
                onChange={(e) => setEditingRoom({...editingRoom, description: e.target.value})}
                placeholder="Descrição do quarto..."
              />
            </div>

            <div>
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                value={editingRoom.price}
                onChange={(e) => setEditingRoom({...editingRoom, price: e.target.value})}
                placeholder="Ex: R$ 200,00/noite"
              />
            </div>

            {/* Comodidades */}
            <div>
              <Label>Comodidades</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Nova comodidade..."
                  onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                />
                <Button onClick={addAmenity} type="button">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editingRoom.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                    <span className="text-sm">{amenity}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAmenity(index)}
                      className="h-auto p-0 w-4 h-4"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload de Imagens */}
            <div>
              <Label>Imagens do Quarto</Label>
              <div className="space-y-4">
                {/* Upload via arquivo */}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    disabled={uploadingImages[editingRoom.id]}
                    onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImages[editingRoom.id] ? 'Enviando...' : 'Adicionar Imagens'}
                  </Button>
                </div>

                {/* Adicionar via URL */}
                <div className="flex items-center gap-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL da imagem (ex: https://exemplo.com/imagem.jpg)"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addImageByUrl()}
                  />
                  <Button
                    type="button"
                    onClick={addImageByUrl}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar URL
                  </Button>
                </div>

                {/* Grid de Imagens */}
                {editingRoom.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {editingRoom.images.map((image, index) => (
                      <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Quarto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => removeImage(image, index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={editingRoom.is_active}
                onCheckedChange={(checked) => setEditingRoom({...editingRoom, is_active: checked})}
              />
              <Label htmlFor="active">Quarto Ativo</Label>
            </div>

            <div>
              <Label htmlFor="order">Ordem de Exibição</Label>
              <Input
                id="order"
                type="number"
                value={editingRoom.display_order}
                onChange={(e) => setEditingRoom({...editingRoom, display_order: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={saveRoom} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Quarto'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingRoom(null)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoomsManager;