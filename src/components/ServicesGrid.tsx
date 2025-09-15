import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ImageCarousel = ({ images, alt }: { images: string[], alt: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (images.length || 1));
  }, [images.length]);

  useEffect(() => {
    if (images.length > 1) {
      const intervalId = setInterval(nextSlide, 3000);
      return () => clearInterval(intervalId);
    }
  }, [images.length, nextSlide]);

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
          alt={`${alt} - slide ${index + 1}`}
          className={`w-full h-full object-cover absolute transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
    </div>
  );
};

interface Service {
  id: string;
  title: string;
  description: string;
  image_urls: string[] | string | null;
  sort_order: number;
}

const ServicesGrid = () => {
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await supabase
          .from('services')
          .select('id, title, description, image_urls, sort_order')
          .eq('active', true)
          .order('sort_order');
        
        if (data) {
          setServices(data);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);
  
  const getServiceRoute = (title: string) => {
    const routes: { [key: string]: string } = {
      'Day Use': '/day-use',
      'Hospedagem': '/hospedagem', 
      'Área VIP': '/area-vip',
      'SPA': '/spa',
      'Café da Manhã': '/cafe-da-manha',
      'Bar & Restaurante': '/bar-restaurante'
    };
    return routes[title] || '/servicos';
  };
  
  const handleServiceClick = (service: Service) => {
    const route = getServiceRoute(service.title);
    navigate(route);
  };
  
  const normalizeUrls = (field: any): string[] => {
    if (Array.isArray(field)) {
        return field.filter(u => typeof u === 'string' && u);
    }
    if (typeof field === 'string') {
        if (field.startsWith('[') && field.endsWith(']')) {
            try {
                const parsed = JSON.parse(field);
                return Array.isArray(parsed) ? parsed.filter(u => typeof u === 'string' && u) : [];
            } catch (e) {
                return [];
            }
        }
        return field.trim() ? [field] : [];
    }
    return [];
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
          {services.map((service) => {
            const images = normalizeUrls(service.image_urls);

            return (
              <Card 
                key={service.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer animate-fade-in hover-scale"
                onClick={() => handleServiceClick(service)}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageCarousel images={images} alt={service.title} />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-paradise-blue mb-3 text-center">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed text-center">
                    {service.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
