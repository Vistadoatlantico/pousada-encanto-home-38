-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Create policies for image uploads
CREATE POLICY "Admin can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Admin can update images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admin can delete images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);

-- Create profiles table for admin roles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create hero section content table
CREATE TABLE public.hero_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_text TEXT NOT NULL DEFAULT 'Paradise',
  subtitle TEXT NOT NULL DEFAULT 'Vista do Atlântico',
  main_title TEXT NOT NULL DEFAULT 'CONFIRA NOSSAS OFERTAS',
  cta_text TEXT NOT NULL DEFAULT 'Reserve agora!',
  background_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;

-- Create policies for hero content
CREATE POLICY "Everyone can view hero content" 
ON public.hero_content 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can update hero content" 
ON public.hero_content 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create about section content table
CREATE TABLE public.about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Paradise Vista do Atlântico: Seu Refúgio em Maceió',
  main_text TEXT NOT NULL,
  highlight_text TEXT NOT NULL,
  footer_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Create policies for about content
CREATE POLICY "Everyone can view about content" 
ON public.about_content 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can update about content" 
ON public.about_content 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for services
CREATE POLICY "Everyone can view active services" 
ON public.services 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admin can manage services" 
ON public.services 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create location content table
CREATE TABLE public.location_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Nossa Localização',
  cta_text TEXT NOT NULL DEFAULT 'VEJA COMO CHEGAR →',
  location_name TEXT NOT NULL DEFAULT 'Paradise Vista do Atlântico',
  address TEXT NOT NULL,
  rating TEXT NOT NULL DEFAULT '4.2 ⭐⭐⭐⭐',
  reviews_count TEXT NOT NULL DEFAULT '1.204 avaliações',
  description TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT 'contato@paradisehotel.com',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.location_content ENABLE ROW LEVEL SECURITY;

-- Create policies for location content
CREATE POLICY "Everyone can view location content" 
ON public.location_content 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can update location content" 
ON public.location_content 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default content
INSERT INTO public.hero_content (logo_text, subtitle, main_title, cta_text) 
VALUES ('Paradise', 'Vista do Atlântico', 'CONFIRA NOSSAS OFERTAS', 'Reserve agora!');

INSERT INTO public.about_content (title, main_text, highlight_text, footer_text)
VALUES (
  'Paradise Vista do Atlântico: Seu Refúgio em Maceió',
  'Descubra a Paradise Vista do Atlântico, onde o descanso, o lazer e a beleza natural de Maceió se encontram. Nossa pousada não é apenas um lugar para dormir; é um refúgio completo para quem busca momentos inesquecíveis, com total conforto e privacidade. A nossa estrutura foi pensada para tornar sua estadia única e cheia de experiências especiais.',
  'O Paradise Vista Do Atlântico oferece muito mais que apenas uma local para passar as noites.',
  'Aqui você poderá desfrutar de momentos únicos e repleto de lazer e diversão!'
);

INSERT INTO public.services (title, description, sort_order) VALUES 
('Day Use', 'Aproveite a estrutura do Paradise Vista do Atlântico mesmo sem se hospedar. Du domingo a Domingo, o Day Use oferece todas...', 1),
('Hospedagem', 'Quartos confortáveis e com vista para o mar. Com diversas opções de acomodações, nossa pousada oferece a tranquilidade e...', 2),
('Área VIP', 'Exclusividade e sofisticação em um espaço único. Com piscina, jacuzzi privativo e uma vista deslumbrante, nossa Área...', 3),
('SPA', 'Relaxamento total com nossos serviços exclusivos. Revitalize o corpo e tratamentos de bem estar e relaxamento no nosso SPA...', 4),
('Café da Manhã', 'Comece o dia com energia! Nosso café da manhã oferece uma variedade de opções frescas e deliciosas, com frutas tropicais...', 5),
('Bar & Restaurante', 'Sabores que encantam! Delicie-se com o melhor da gastronomia regional em nosso restaurante, ou relaxe com uma bebida no...', 6);

INSERT INTO public.location_content (title, cta_text, location_name, address, description, email)
VALUES (
  'Nossa Localização',
  'VEJA COMO CHEGAR →',
  'Paradise Vista do Atlântico',
  'R. Vista do Atlântico, Quadra 02, Tv 09, Jacarecica, Maceió - AL, 57038',
  'Pousada Paradise Vista do Atlântico oferece acomodação, restaurante, piscina ao ar livre, jardim e bar. Praia de Jacarecica fica a 2,5 km de distância. Pousada Paradise Vista do Atlântico disponibiliza Wi-Fi e estacionamento privativo de graça. Existe um espaço kids que oferece diversas atividades, bem como um parquinho infantil. Pousada Paradise Vista do Atlântico fica a 6,3 km do Terminal Rodoviário de Maceió e a 8,1 km de Piscinas Naturais da Praia de Pajuçara. O Aeroporto de Aeroporto Internacional de Maceió - Zumbi Dos Palmares fica a 21 km de acomodação.',
  'contato@paradisehotel.com'
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_hero_content_updated_at
BEFORE UPDATE ON public.hero_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_about_content_updated_at
BEFORE UPDATE ON public.about_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_location_content_updated_at
BEFORE UPDATE ON public.location_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();