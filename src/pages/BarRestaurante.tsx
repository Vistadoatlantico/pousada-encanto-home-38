import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, MapPin, Phone, X } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image?: string;
}

interface BarRestauranteContent {
  title: string;
  subtitle: string;
  description: string;
  background_image?: string;
  opening_hours: {
    restaurant: string;
    bar: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
  };
  location: string;
  menu_categories: {
    name: string;
    items: MenuItem[];
  }[];
  gallery_items: { url: string; type: 'image' | 'video' }[];
  specialties: string[];
}

const BarRestaurante = () => {
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [content, setContent] = useState<BarRestauranteContent>({
    title: "Bar e Restaurante",
    subtitle: "Sabores únicos com vista paradisíaca",
    description: "Desfrute de uma experiência gastronômica inesquecível em nosso restaurante com vista para a natureza",
    opening_hours: {
      restaurant: "Café da manhã: 6h às 10h | Almoço: 12h às 15h | Jantar: 18h às 22h",
      bar: "Diariamente das 10h às 23h"
    },
    contact: {
      phone: "(11) 99999-9999",
      whatsapp: "(11) 99999-9999"
    },
    location: "Hotel Paradise - Vista para a natureza",
    menu_categories: [],
    gallery_items: [],
    specialties: []
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'bar_restaurante')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.content && typeof data.content === 'object') {
        const fetchedContent = data.content as unknown as Partial<BarRestauranteContent>;
        setContent(prev => ({
          ...prev,
          ...fetchedContent,
          menu_categories: Array.isArray(fetchedContent.menu_categories) ? fetchedContent.menu_categories : prev.menu_categories,
          gallery_items: Array.isArray(fetchedContent.gallery_items) ? fetchedContent.gallery_items : prev.gallery_items,
          specialties: Array.isArray(fetchedContent.specialties) ? fetchedContent.specialties : prev.specialties
        }));
      }
    } catch (error) {
      console.error('Error fetching bar restaurante content:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section with Overlay Card */}
      <section className="relative pt-16 sm:pt-20 pb-12 sm:pb-16 md:pb-24 min-h-screen bg-gradient-to-r from-paradise-blue to-accent">
        {content.background_image && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${content.background_image})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        )}
        
        {/* Main Content Card */}
        <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
            
            {/* Left Card - Content */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-6 sm:p-8">
                <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
                  {content.description}
                </p>
                
                {/* Diferenciais */}
                {content.specialties.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-paradise-blue mb-4">
                      Nossos diferenciais:
                    </h3>
                    <ul className="space-y-2">
                      {content.specialties.map((specialty, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-paradise-blue rounded-full flex-shrink-0"></div>
                          <span>{specialty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* CTA Button */}
                <Button 
                  onClick={() => setIsMenuModalOpen(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-base"
                >
                  Ver Cardápio
                </Button>
                
                {/* Contact Info */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div>
                      <p className="font-semibold text-paradise-blue">Horários:</p>
                      <p>{content.opening_hours.restaurant}</p>
                      <p>{content.opening_hours.bar}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-paradise-blue">Contato:</p>
                      <p>Tel: {content.contact.phone}</p>
                      <p>WhatsApp: {content.contact.whatsapp}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Right Card - Gallery */}
            {content.gallery_items.length > 0 && (
              <div className="space-y-4">
                {content.gallery_items.slice(0, 4).map((item, index) => (
                  <Card key={index} className="bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          className="w-full h-48 object-cover"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={`Ambiente ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Fallback Image Card */}
            {content.gallery_items.length === 0 && (
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center min-h-[400px]">
                    <p className="text-gray-500">Adicione imagens ou vídeos no painel administrativo</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
          </div>
        </div>
      </section>

      {/* Additional Gallery Section */}
      {content.gallery_items.length > 4 && (
        <section className="py-8 sm:py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-paradise-blue mb-6 sm:mb-8">
              Mais do nosso ambiente
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {content.gallery_items.slice(4).map((item, index) => (
                <div key={index + 4} className="aspect-square overflow-hidden rounded-lg shadow-card">
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={`Ambiente ${index + 5}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menu Modal */}
      <Dialog open={isMenuModalOpen} onOpenChange={setIsMenuModalOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0">
          <DialogHeader className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">Cardápio</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuModalOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 h-[calc(95vh-80px)] overflow-auto p-4">
            <div className="space-y-6">
              {/* Comidas Menu */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-paradise-blue mb-4">Pratos</h3>
                <img
                  src="/lovable-uploads/db629691-f1fe-4f95-afd2-d45926f40ff2.png"
                  alt="Cardápio de Comidas"
                  className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
                />
              </div>
              {/* Bebidas Menu */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-paradise-blue mb-4">Bebidas</h3>
                <img
                  src="/lovable-uploads/7c6430b5-d6b5-4682-b46c-0548f70f5518.png"
                  alt="Cardápio de Bebidas"
                  className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default BarRestaurante;