import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  display_order: number;
  is_active: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image_url: string;
  category_id: string;
  display_order: number;
  is_active: boolean;
  stock_quantity: number;
}

const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    display_order: 0,
    is_active: true,
    stock_quantity: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            categories (
              name
            )
          `)
          .order('display_order', { ascending: true }),
        supabase
          .from('categories')
          .select('id, name, is_active')
          .eq('is_active', true)
          .order('name')
      ]);

      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const priceAsNumber = parseFloat(formData.price.replace(',', '.')) || 0;

      const productData = {
        ...formData,
        price: priceAsNumber,
        category_id: formData.category_id || null
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Produto criado com sucesso!');
      }

      resetForm();
      fetchData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      image_url: product.image_url || '',
      category_id: product.category_id || '',
      display_order: product.display_order,
      is_active: product.is_active,
      stock_quantity: product.stock_quantity
    });
    setMediaPreview(product.image_url || null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Produto excluído com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      display_order: 0,
      is_active: true,
      stock_quantity: 0
    });
    setEditingProduct(null);
    setMediaPreview(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem ou vídeo');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 50MB permitido');
      return;
    }

    setUploadingMedia(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      setMediaPreview(publicUrl);
      toast.success('Mídia enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload da mídia:', error);
      toast.error('Erro ao enviar mídia');
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = () => {
    setFormData({ ...formData, image_url: '' });
    setMediaPreview(null);
  };

  const isVideo = (url: string | null): boolean => {
    if (!url) return false;
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  if (loading && products.length === 0) {
    return <div className="p-6">Carregando produtos...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
          <p className="text-muted-foreground">Adicione e edite os produtos da loja virtual</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Edite os dados do produto' : 'Preencha os dados do novo produto'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="text"
                  inputMode="decimal"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="ex: 25,99"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category_id">Categoria</Label>
                <Select value={formData.category_id || "none"} onValueChange={(value) => setFormData({ ...formData, category_id: value === "none" ? "" : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="media">Imagem ou Vídeo do Produto</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      id="media"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={uploadingMedia}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingMedia}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {mediaPreview && (
                    <div className="relative w-full aspect-video border rounded-md overflow-hidden bg-slate-100">
                      {isVideo(mediaPreview) ? (
                        <video
                          src={mediaPreview}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={removeMedia}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="image_url" className="text-sm text-muted-foreground">
                      Ou insira uma URL de imagem/vídeo:
                    </Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setMediaPreview(e.target.value || null);
                      }}
                      placeholder="https://exemplo.com/midia.jpg"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_order">Ordem</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock_quantity">Estoque</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Produto ativo</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || uploadingMedia}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum produto cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {product.name}
                      {!product.is_active && (
                        <span className="px-2 py-1 text-xs bg-muted rounded">Inativo</span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {product.categories?.name && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-2">
                          {product.categories.name}
                        </span>
                      )}
                      R$ {product.price.toFixed(2)}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Estoque: {product.stock_quantity}</span>
                  <span>Ordem: {product.display_order}</span>
                </div>
                {product.description && (
                  <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductsManager;
