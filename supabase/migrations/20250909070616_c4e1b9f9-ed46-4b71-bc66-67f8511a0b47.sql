-- Create carousel_images table for managing hero carousel images
CREATE TABLE public.carousel_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

-- Create policies for carousel_images
CREATE POLICY "Everyone can view active carousel images" 
ON public.carousel_images 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin can manage carousel images" 
ON public.carousel_images 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_carousel_images_updated_at
BEFORE UPDATE ON public.carousel_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default carousel images
INSERT INTO public.carousel_images (image_url, alt_text, display_order, is_active) VALUES
('https://pjzdvmqxavqmtmxaupxo.supabase.co/storage/v1/object/public/images/hero-pool.jpg', 'Piscina Paradise Vista do Atlântico', 1, true),
('https://pjzdvmqxavqmtmxaupxo.supabase.co/storage/v1/object/public/images/area-vip.jpg', 'Área VIP Paradise Vista do Atlântico', 2, true),
('https://pjzdvmqxavqmtmxaupxo.supabase.co/storage/v1/object/public/images/bar-restaurante.jpg', 'Bar e Restaurante Paradise Vista do Atlântico', 3, true),
('https://pjzdvmqxavqmtmxaupxo.supabase.co/storage/v1/object/public/images/spa.jpg', 'SPA Paradise Vista do Atlântico', 4, true),
('https://pjzdvmqxavqmtmxaupxo.supabase.co/storage/v1/object/public/images/hospedagem.jpg', 'Hospedagem Paradise Vista do Atlântico', 5, true);