import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Service {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
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
          .select('*')
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

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer animate-fade-in hover-scale"
              onClick={() => handleServiceClick(service)}
            >
              {service.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image_url} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-paradise-blue mb-3 text-center">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-center">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;