import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import MediaManager from "./MediaManager";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [newAmenity, setNewAmenity] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      setRooms(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar quartos", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewRoom = () => {
    const newRoom: Room = {
      id: 'new', // A temporary ID for a new room
      name: '',
      description: '',
      price: '',
      amenities: [],
      images: [],
      is_active: true,
      display_order: rooms.length > 0 ? Math.max(...rooms.map(r => r.display_order)) + 1 : 1
    };
    setEditingRoom(newRoom);
  };

  const handleSaveRoom = async () => {
    if (!editingRoom) return;

    // Prevent saving a new room without a name
    if (editingRoom.id === 'new' && !editingRoom.name.trim()) {
      toast.error("O nome do quarto é obrigatório.");
      return;
    }
    
    setIsSaving(true);
    
    const { id, ...roomData } = editingRoom;

    try {
      let error;
      if (id === 'new') {
        // Insert new room and get the new ID back
        const { data, error: insertError } = await supabase
          .from('rooms')
          .insert(roomData)
          .select('id')
          .single();
        error = insertError;
        // Potentially rename image folder if needed, though MediaManager handles paths
      } else {
        // Update existing room
        const { error: updateError } = await supabase
          .from('rooms')
          .update(roomData)
          .eq('id', id);
        error = updateError;
      }

      if (error) throw error;

      toast.success("Quarto salvo com sucesso!");
      setEditingRoom(null);
      fetchRooms(); // Refresh the list
    } catch (error: any) {
      toast.error("Erro ao salvar o quarto.", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este quarto? As imagens associadas não serão removidas do armazenamento.')) {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) {
        toast.error("Erro ao excluir o quarto.", { description: error.message });
      } else {
        toast.success("Quarto excluído com sucesso!");
        fetchRooms();
      }
    }
  };
  
  // Using useCallback to memoize these handlers
  const updateEditingRoomField = useCallback((field: keyof Room, value: any) => {
    setEditingRoom(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  const handleImagesUpdate = useCallback((urls: string[]) => {
    updateEditingRoomField('images', urls);
  }, [updateEditingRoomField]);

  const addAmenity = () => {
    if (!editingRoom || !newAmenity.trim()) return;
    const updatedAmenities = [...editingRoom.amenities, newAmenity.trim()];
    updateEditingRoomField('amenities', updatedAmenities);
    setNewAmenity("");
  };

  const removeAmenity = (index: number) => {
    if (!editingRoom) return;
    const updatedAmenities = editingRoom.amenities.filter((_, i) => i !== index);
    updateEditingRoomField('amenities', updatedAmenities);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-paradise-blue" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row justify-between items-center">
           <CardTitle>Gerenciamento de Quartos</CardTitle>
           <Button onClick={createNewRoom}><Plus className="w-4 h-4 mr-2" />Novo Quarto</Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Adicione, edite ou remova os quartos/suítes para exibição no site.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="truncate pr-2">{room.name || "Quarto sem nome"}</span>
                <Switch
                  checked={room.is_active}
                  onCheckedChange={async (checked) => {
                    const { error } = await supabase.from('rooms').update({ is_active: checked }).eq('id', room.id);
                    if(error) toast.error("Falha ao atualizar status.");
                    else toast.success(`Quarto ${checked ? 'ativado' : 'desativado'}.`);
                    fetchRooms();
                  }}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
                {room.images?.[0] ? 
                  <img src={room.images[0]} alt={room.name} className="object-cover w-full h-full rounded-md"/> : 
                  <span className="text-xs text-muted-foreground">Sem Imagem</span>
                }
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
            </CardContent>
            <div className="p-4 pt-0 flex gap-2">
              <Button className="w-full" onClick={() => setEditingRoom(room)}>Editar</Button>
              <Button className="w-full" variant="destructive" onClick={() => handleDeleteRoom(room.id)}>Excluir</Button>
            </div>
          </Card>
        ))}
      </div>

      {editingRoom && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setEditingRoom(null)}/>
      )}
      {editingRoom && (
        <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-card z-50 shadow-lg">
          <Card className="h-full flex flex-col rounded-none">
            <CardHeader className="flex-row justify-between items-center">
              <CardTitle>{editingRoom.id === 'new' ? 'Adicionar Novo Quarto' : 'Editar Quarto'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingRoom(null)}><X className="w-5 h-5" /></Button>
            </CardHeader>
            <div className="flex-grow overflow-y-auto">
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>Nome</Label><Input value={editingRoom.name} onChange={(e) => updateEditingRoomField('name', e.target.value)} /></div>
                    <div><Label>Preço</Label><Input value={editingRoom.price} onChange={(e) => updateEditingRoomField('price', e.target.value)} /></div>
                </div>
                <div><Label>Descrição</Label><Textarea value={editingRoom.description} onChange={(e) => updateEditingRoomField('description', e.target.value)} rows={4}/></div>
                
                <div>
                  <Label>Imagens</Label>
                  <MediaManager 
                    mediaUrls={editingRoom.images || []}
                    onMediaUpdate={handleImagesUpdate}
                    folder={`rooms/${editingRoom.id}`}
                  />
                </div>

                <div>
                  <Label>Comodidades</Label>
                  <div className="flex gap-2 mb-2">
                    <Input value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} placeholder="Ex: Wifi Grátis" onKeyPress={(e) => e.key === 'Enter' && addAmenity()}/>
                    <Button onClick={addAmenity}>Adicionar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingRoom.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                        <span>{amenity}</span>
                        <button onClick={() => removeAmenity(index)} className="hover:text-destructive"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                    <div>
                      <Label>Ordem de Exibição</Label>
                      <Input type="number" value={editingRoom.display_order} onChange={(e) => updateEditingRoomField('display_order', parseInt(e.target.value, 10) || 0)} />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                        <Switch id="active-switch" checked={editingRoom.is_active} onCheckedChange={(checked) => updateEditingRoomField('is_active', checked)}/>
                        <Label htmlFor="active-switch">{editingRoom.is_active ? 'Ativo' : 'Inativo'}</Label>
                    </div>
                </div>
              </CardContent>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingRoom(null)}>Cancelar</Button>
                <Button onClick={handleSaveRoom} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingRoom.id === 'new' ? 'Criar Quarto' : 'Salvar Alterações')}
                </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RoomsManager;
