import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, X, Store, AlertTriangle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

const LojaVirtual = () => {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [storeConfig, setStoreConfig] = useState({
    is_active: true,
    admin_message: '',
    user_message: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar configuração da loja
      const { data: storeConfigData } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'store_config')
        .maybeSingle();
      
      if (storeConfigData?.content) {
        setStoreConfig(storeConfigData.content as any);
      }
      
      // Buscar imagem de fundo
      const { data: contentData } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'loja_virtual')
        .maybeSingle();
      
      if (contentData?.content && typeof contentData.content === 'object') {
        const content = contentData.content as any;
        if (content.heroImage || content.background_image) {
          setBackgroundImage(content.heroImage || content.background_image);
        }
      }
      
      // Buscar categorias ativas
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Buscar produtos ativos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (productsError) throw productsError;

      setCategories(categoriesData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOrder = (product: Product) => {
    const message = `Olá! Gostaria de encomendar:\n\n*${product.name}*\nPreço: R$ ${product.price.toFixed(2)}\n\nObrigado!`;
    const phoneNumber = "5582982235336";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Se a loja está desativada e o usuário não é admin, mostrar mensagem
  if (!storeConfig.is_active && !isAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <Card>
                <CardContent className="p-12">
                  <Store className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                  <h1 className="text-3xl font-bold mb-4">Loja Virtual Temporariamente Indisponível</h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    {storeConfig.user_message || 'Nossa loja virtual está temporariamente indisponível. Em breve estará disponível novamente!'}
                  </p>
                  <Button 
                    onClick={() => window.history.back()}
                    variant="outline"
                  >
                    Voltar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Mensagem para admin quando loja está desativada */}
        {!storeConfig.is_active && isAdmin && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="container mx-auto max-w-6xl">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
                <div>
                  <p className="text-yellow-800 font-medium">
                    Modo Admin: A loja virtual está desativada para usuários
                  </p>
                  <p className="text-yellow-700 text-sm">
                    {storeConfig.admin_message || 'Apenas administradores podem visualizar e gerenciar a loja no momento.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Hero Section */}
        <section 
          className="relative h-96 bg-cover bg-center bg-gray-300 flex items-center justify-center"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Loja Virtual</h1>
            <p className="text-xl">Produtos frescos e artesanais direto para sua casa</p>
          </div>
        </section>

        {/* Categories or Products Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            {!selectedCategory ? (
              // Show Categories
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-paradise-blue mb-4">
                    Categorias
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Escolha uma categoria para ver nossos produtos
                  </p>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Carregando categorias...</p>
                  </div>
                ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  {categories.map((category) => (
                    <Card 
                      key={category.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                        <CardContent className="p-0">
                          <div className="aspect-square bg-gradient-to-br from-paradise-blue/20 to-paradise-light-blue/40 rounded-t-lg flex items-center justify-center">
                            {category.image_url ? (
                              <img 
                                src={category.image_url} 
                                alt={category.name}
                                className="w-full h-full object-cover rounded-t-lg"
                              />
                            ) : (
                              <span className="text-4xl text-paradise-blue font-bold">
                                {category.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          
                          <div className="p-6 text-center">
                            <h3 className="text-xl font-bold text-paradise-blue mb-2">
                              {category.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {category.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Show Products
              <>
                <div className="text-center mb-12">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCategory(null)}
                    className="mb-4"
                  >
                    ← Voltar para Categorias
                  </Button>
                  <h2 className="text-3xl font-bold text-paradise-blue mb-4">
                    {categories.find(c => c.id === selectedCategory)?.name || "Produtos"}
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Sabores únicos preparados com ingredientes selecionados. Faça seu pedido pelo WhatsApp!
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {products
                    .filter(product => product.category_id === selectedCategory)
                    .map((product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div 
                          className="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center cursor-pointer"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded-t-lg hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <span className="text-gray-500">{product.name}</span>
                          )}
                        </div>
                        
                        <div className="p-3 sm:p-4 md:p-6">
                          <h3 className="text-lg sm:text-xl font-bold text-paradise-blue mb-2">
                            {product.name}
                          </h3>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <span className="text-xl sm:text-2xl font-bold text-paradise-blue">
                              R$ {product.price.toFixed(2)}
                            </span>
                            <Button 
                              variant="paradise"
                              size="sm"
                              onClick={() => handleWhatsAppOrder(product)}
                              className="w-full sm:w-auto"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Pedir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {products.filter(product => product.category_id === selectedCategory).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhum produto disponível nesta categoria.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-paradise-light-blue/20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-paradise-blue mb-4">
                    Como Fazer Seu Pedido
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-center">
                    <div>
                      <div className="w-12 h-12 bg-paradise-blue text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                        1
                      </div>
                      <p className="font-medium mb-2">Escolha a Categoria</p>
                      <p className="text-sm text-muted-foreground">
                        Navegue pelas categorias e encontre o que deseja
                      </p>
                    </div>
                    
                    <div>
                      <div className="w-12 h-12 bg-paradise-blue text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                        2
                      </div>
                      <p className="font-medium mb-2">Clique em "Pedir"</p>
                      <p className="text-sm text-muted-foreground">
                        Será redirecionado para nosso WhatsApp com o produto
                      </p>
                    </div>
                    
                    <div>
                      <div className="w-12 h-12 bg-paradise-blue text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                        3
                      </div>
                      <p className="font-medium mb-2">Finalize o Pedido</p>
                      <p className="text-sm text-muted-foreground">
                        Confirme detalhes e forma de entrega conosco
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Product Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-paradise-blue">
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {selectedProduct.image_url && (
                <div className="w-full">
                  <img 
                    src={selectedProduct.image_url} 
                    alt={selectedProduct.name}
                    className="w-full h-auto max-h-96 object-contain rounded-lg"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div className="text-3xl font-bold text-paradise-blue">
                  R$ {selectedProduct.price.toFixed(2)}
                </div>
                
                {selectedProduct.description && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Descrição</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}
                
                <Button 
                  variant="paradise"
                  size="lg"
                  onClick={() => {
                    handleWhatsAppOrder(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Fazer Pedido pelo WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LojaVirtual;