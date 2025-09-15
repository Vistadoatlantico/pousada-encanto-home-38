import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

// A simple, auto-playing carousel component
const ImageCarousel = ({ images, alt }: { images: string[], alt: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length > 1) {
      const intervalId = setInterval(nextSlide, 3000); // Change slide every 3 seconds
      return () => clearInterval(intervalId);
    }
  }, [images, nextSlide]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Sem imagem</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`${alt} - ${index + 1}`}
          className={`w-full h-full object-cover absolute transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
    </div>
  );
};

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  duration?: string;
  images?: string[];
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  images: string[];
  serviceCount: number;
  services: ServiceItem[];
}

const Servicos = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [pageContent, setPageContent] = useState({ title: 'Nossos Serviços', description: 'Serviços especiais para momentos únicos.' });
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const { data } = await supabase
          .from('services_page_content')
          .select('*')
          .single();
        
        if (data) {
          setPageContent({ title: data.title, description: data.description });
          
          // Backward compatibility for images
          const parsedCategories = (data.categories as any[] || []).map(cat => ({
            ...cat,
            images: Array.isArray(cat.images) ? cat.images : (cat.image ? [cat.image] : []),
            services: (cat.services as any[] || []).map(srv => ({
              ...srv,
              images: Array.isArray(srv.images) ? srv.images : (srv.image ? [srv.image] : []),
            }))
          }));
          setCategories(parsedCategories);
        }
      } catch (error) {
        console.error('Error fetching services page content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, []);

  const selectedCategory = categories.find(cat => cat.id === categoryParam);

  const handleViewServices = (categoryId: string) => {
    navigate(`/servicos?category=${categoryId}`);
  };

  const handleBack = () => {
    if (categoryParam) {
      navigate('/servicos');
    } else {
      navigate('/');
    }
  };

  const handleWhatsAppContact = (serviceName: string, price: string) => {
    const message = `Olá! Gostaria de agendar o serviço: ${serviceName} - ${price}`;
    const whatsappUrl = `https://wa.me/5582982235336?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleServiceClick = (service: ServiceItem) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsServiceModalOpen(false);
    setSelectedService(null);
  };

  // Category Detail View
  if (categoryParam && selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-paradise-blue via-paradise-blue to-paradise-blue/80">
        <Header />
        
        <section className="pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <Button variant="ghost" size="sm" onClick={handleBack} className="mb-6 text-white hover:bg-white/20">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            
            <div className="text-center text-white mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{selectedCategory.name}</h1>
            </div>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <p className="text-center text-muted-foreground mb-8 leading-relaxed">
                  {selectedCategory.description}
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {selectedCategory.services.map((service) => (
                    <div key={service.id} className="bg-white border rounded-lg p-3 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleServiceClick(service)}>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 rounded-lg overflow-hidden">
                           <ImageCarousel images={service.images || []} alt={service.name} />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="font-bold text-lg text-foreground mb-1">{service.name}</h3>
                          {service.duration && <p className="text-sm text-paradise-blue font-medium mb-2">{service.duration}</p>}
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{service.description}</p>
                          <span className="text-xl font-bold text-paradise-blue">{service.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-paradise-blue">{selectedService?.name}</DialogTitle>
            </DialogHeader>
            {selectedService && (
              <div className="space-y-4">
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <ImageCarousel images={selectedService.images || []} alt={selectedService.name} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-paradise-blue">{selectedService.price}</span>
                  {selectedService.duration && <span className="text-muted-foreground">Duração: {selectedService.duration}</span>}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Descrição</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedService.description}</p>
                </div>
                <Button onClick={() => handleWhatsAppContact(selectedService.name, selectedService.price)} className="w-full bg-green-500 hover:bg-green-600 text-white">
                  Agendar via WhatsApp
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    );
  }

  // Categories Listing View
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mb-6"><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">{pageContent.title}</h1>
            <p className="text-lg text-muted-foreground">{pageContent.description}</p>
          </div>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="container mx-auto">
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Card key={category.id} className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                   <div className="aspect-[4/3] overflow-hidden">
                      <ImageCarousel images={category.images} alt={category.name} />
                   </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{category.serviceCount} serviços disponíveis</p>
                    <Button onClick={() => handleViewServices(category.id)} variant="paradise" className="w-full">Ver Serviços</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Servicos;