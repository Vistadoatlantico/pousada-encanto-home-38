-- Create site_content table for dynamic content management
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Policies for site_content
CREATE POLICY "Everyone can view site content" 
ON public.site_content 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage site content" 
ON public.site_content 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Insert default content for hero section
INSERT INTO public.site_content (section_name, content) VALUES 
('hero', '{
  "logo_text": "Paradise",
  "subtitle": "Vista do Atlântico",
  "main_title": "CONFIRA NOSSAS OFERTAS",
  "cta_text": "Reserve agora!",
  "background_image_url": null
}'::jsonb);

-- Insert default content for other pages
INSERT INTO public.site_content (section_name, content) VALUES 
('cafe_da_manha', '{
  "title": "Café da Manhã",
  "subtitle": "Comece o dia com sabor",
  "description": "Desfrute de um delicioso café da manhã com vista para o mar.",
  "image_url": null
}'::jsonb),
('hospedagem', '{
  "title": "Hospedagem",
  "subtitle": "Conforto e tranquilidade",
  "description": "Quartos confortáveis com vista para o oceano.",
  "image_url": null
}'::jsonb),
('day_use', '{
  "title": "Day Use",
  "subtitle": "Relaxe sem pressa",
  "description": "Aproveite nossas instalações durante o dia.",
  "image_url": null
}'::jsonb),
('area_vip', '{
  "title": "Área VIP",
  "subtitle": "Exclusividade e requinte",
  "description": "Espaço exclusivo para momentos especiais.",
  "image_url": null
}'::jsonb),
('localizacao', '{
  "title": "Localização",
  "subtitle": "Paradise Vista do Atlântico",
  "description": "Encontre-nos no melhor local de Maceió.",
  "address": "Endereço completo aqui",
  "email": "contato@paradisehotel.com",
  "rating": "4.2 ⭐⭐⭐⭐",
  "reviews_count": "1.204 avaliações"
}'::jsonb);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fix services table - add missing columns and update existing data
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing services to have proper name field
UPDATE public.services SET name = title WHERE name IS NULL;