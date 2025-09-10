-- Create table to store services page content
CREATE TABLE public.services_page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Nossos Serviços',
  description TEXT NOT NULL DEFAULT 'Serviços especiais para momentos únicos. Clique no serviço desejado para fazer seu pedido via WhatsApp.',
  categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.services_page_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view services page content" 
ON public.services_page_content 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage services page content" 
ON public.services_page_content 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Insert default data
INSERT INTO public.services_page_content (title, description, categories) VALUES (
  'Nossos Serviços',
  'Serviços especiais para momentos únicos. Clique no serviço desejado para fazer seu pedido via WhatsApp.',
  '[
    {
      "id": "massagem",
      "name": "Serviços de Massagem",
      "description": "Revitalize-se com nossos tratamentos exclusivos. Oferecemos massagens relaxantes, tratamentos corporais e uma experiência completa de bem-estar com paz e vista para o mar.",
      "image": "/lovable-uploads/c63d63cc-8ee3-400b-b6c7-6e4466636f3f.png",
      "serviceCount": 1,
      "services": [
        {
          "id": "1",
          "name": "RELAXAMENTO",
          "description": "Massagem relaxante completa",
          "price": "R$ 33,00",
          "duration": "00:00:02"
        }
      ]
    },
    {
      "id": "decoracao",
      "name": "Serviços de Decoração",
      "description": "Transforme seus momentos especiais com nossa decoração personalizada. Criamos ambientes únicos para celebrações inesquecíveis.",
      "image": "/lovable-uploads/c63d63cc-8ee3-400b-b6c7-6e4466636f3f.png",
      "serviceCount": 0,
      "services": []
    }
  ]'::jsonb
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_services_page_content_updated_at
BEFORE UPDATE ON public.services_page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();