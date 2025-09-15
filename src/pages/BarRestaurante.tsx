import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface BarRestauranteContent {
  title: string;
  subtitle: string;
  description: string;
  background_image?: string;
  opening_hours: { restaurant: string; bar: string; };
  contact: { phone: string; whatsapp: string; };
  location: string;
  menu: { food_menu_url?: string; drink_menu_url?: string; }; // New menu structure
  gallery_items: { url: string; type: 'image' | 'video' }[];
  specialties: string[];
}

const BarRestaurante = () => {
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [content, setContent] = useState<BarRestauranteContent>({
    title: "Bar e Restaurante",
    subtitle: "Sabores únicos com vista paradisíaca",
    description: "Desfrute de uma experiência gastronômica inesquecível em nosso restaurante.",
    opening_hours: { restaurant: "", bar: "" },
    contact: { phone: "", whatsapp: "" },
    location: "",
    menu: {}, // Initialize new menu structure
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
          // Ensure nested objects are properly initialized
          opening_hours: fetchedContent.opening_hours || prev.opening_hours,
          contact: fetchedContent.contact || prev.contact,
          menu: fetchedContent.menu || prev.menu,
          gallery_items: Array.isArray(fetchedContent.gallery_items) ? fetchedContent.gallery_items : [],
          specialties: Array.isArray(fetchedContent.specialties) ? fetchedContent.specialties : []
        }));
      }
    } catch (error) {
      console.error('Error fetching bar/restaurante content:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="relative pt-20 pb-16 min-h-[60vh] flex items-center justify-center text-white">
        {content.background_image && (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${content.background_image})` }}>
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        )}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{content.title}</h1>
          <p className="text-lg md:text-2xl mt-4 max-w-2xl mx-auto">{content.subtitle}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
               <Card>
                 <CardContent className="p-8">
                   <h2 className="text-2xl font-bold text-paradise-blue mb-4">Uma Experiência Gastronômica Inesquecível</h2>
                   <p className="text-muted-foreground leading-relaxed">{content.description}</p>
                 </CardContent>
               </Card>

              {content.specialties && content.specialties.length > 0 && (
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold text-paradise-blue mb-4">Nossos Diferenciais</h3>
                    <ul className="space-y-3">
                      {content.specialties.map((item, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 bg-paradise-blue rounded-full"/>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                   <Button onClick={() => setIsMenuModalOpen(true)} className="w-full bg-orange-500 hover:bg-orange-600">Ver Cardápio</Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-paradise-blue mb-2">Horários</h4>
                    <p><strong>Restaurante:</strong> {content.opening_hours.restaurant}</p>
                    <p><strong>Bar:</strong> {content.opening_hours.bar}</p>
                  </div>
                   <hr/>
                  <div>
                    <h4 className="font-semibold text-paradise-blue mb-2">Contato</h4>
                    <p><strong>Telefone:</strong> {content.contact.phone}</p>
                    <p><strong>WhatsApp:</strong> {content.contact.whatsapp}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {content.gallery_items && content.gallery_items.length > 0 && (
        <section className="py-16 bg-muted/40">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-paradise-blue mb-8">Galeria de Fotos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {content.gallery_items.map((item, index) => (
                <div key={index} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-lg">
                  {item.type === 'video' ? (
                    <video src={item.url} className="w-full h-full object-cover" controls playsInline loop muted />
                  ) : (
                    <img src={item.url} alt={`Galeria ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Dialog open={isMenuModalOpen} onOpenChange={setIsMenuModalOpen}>
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0">
          <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
            <DialogTitle>Nosso Cardápio</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuModalOpen(false)}><X className="h-4 w-4" /></Button>
          </DialogHeader>
          <div className="h-[calc(90vh-65px)] overflow-y-auto p-4 space-y-8">
            {content.menu.food_menu_url && (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-paradise-blue mb-4">Pratos</h3>
                <img src={content.menu.food_menu_url} alt="Cardápio de Comidas" className="w-full rounded-lg shadow-md"/>
              </div>
            )}
            {content.menu.drink_menu_url && (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-paradise-blue mb-4">Bebidas</h3>
                <img src={content.menu.drink_menu_url} alt="Cardápio de Bebidas" className="w-full rounded-lg shadow-md"/>
              </div>
            )}
             {!content.menu.food_menu_url && !content.menu.drink_menu_url && (
                <p className="text-center text-muted-foreground pt-10">O cardápio ainda não foi adicionado.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default BarRestaurante;
