import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  duration?: string;
  image?: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  image: string;
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
          setCategories((data.categories as any) || []);
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

  // If a category is selected, show the category detail view
  if (categoryParam && selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-paradise-blue via-paradise-blue to-paradise-blue/80">
        <Header />
        
        <section className="pt-16 sm:pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="mr-4 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            </div>
            
            <div className="text-center text-white mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Relaxamento total com nossos serviços exclusivos
              </h1>
            </div>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <p className="text-center text-muted-foreground mb-8 leading-relaxed">
                  {selectedCategory.description}
                </p>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Nossos serviços:</h2>
                  
                  {selectedCategory.services.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-4">
                      {selectedCategory.services.map((service) => (
                        <div 
                          key={service.id} 
                          className="bg-white border rounded-lg p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleServiceClick(service)}
                        >
                          {/* Layout para mobile (2x2) */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            {service.image ? (
                              <div className="w-full h-24 sm:w-24 sm:h-20 rounded overflow-hidden flex-shrink-0">
                                <img 
                                  src={service.image} 
                                  alt={service.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-24 sm:w-24 sm:h-20 bg-paradise-blue rounded flex items-center justify-center">
                                <span className="text-white text-lg">🔹</span>
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="flex flex-col">
                                <h3 className="font-bold text-sm sm:text-lg text-foreground mb-1 leading-tight">
                                  {service.name}
                                </h3>
                                {service.duration && (
                                  <p className="text-xs sm:text-sm text-paradise-blue font-medium mb-1 sm:mb-2">
                                    {service.duration}
                                  </p>
                                )}
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none mb-2">
                                  {service.description}
                                </p>
                                <div className="mt-auto">
                                  <span className="text-lg sm:text-2xl font-bold text-paradise-blue">
                                    {service.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum serviço disponível nesta categoria no momento.</p>
                    </div>
                  )}
                </div>

                {selectedCategory.services.length > 0 && (
                  <div className="text-center">
                    <Button 
                      onClick={() => handleWhatsAppContact(selectedCategory.services[0].name, selectedCategory.services[0].price)}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold"
                    >
                      🟢 Agendar via WhatsApp
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Service Detail Modal */}
        <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-paradise-blue">
                {selectedService?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedService && (
              <div className="space-y-6">
                {selectedService.image && (
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <img 
                      src={selectedService.image} 
                      alt={selectedService.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold text-paradise-blue">
                      {selectedService.price}
                    </span>
                    {selectedService.duration && (
                      <span className="text-muted-foreground">
                        Duração: {selectedService.duration}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedService.description}
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={() => {
                        handleWhatsAppContact(selectedService.name, selectedService.price);
                        closeServiceModal();
                      }}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold"
                    >
                      🟢 Agendar via WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    );
  }

  // Default view - show categories
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <section className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center mb-4 sm:mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="mr-2 sm:mr-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              {pageContent.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              {pageContent.description}
            </p>
          </div>
        </div>
      </section>

      <section className="pb-8 sm:pb-12 md:pb-16 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando serviços...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {categories.map((category) => (
              <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/95 backdrop-blur-sm">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.serviceCount} serviços disponíveis
                  </p>
                  
                  <Button 
                    onClick={() => handleViewServices(category.id)}
                    variant="paradise" 
                    className="w-full"
                  >
                    Ver Serviços
                  </Button>
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