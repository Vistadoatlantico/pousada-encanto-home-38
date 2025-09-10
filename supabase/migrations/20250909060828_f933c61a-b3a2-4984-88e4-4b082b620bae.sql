-- Create rooms table for accommodation management
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for room access
CREATE POLICY "Everyone can view active rooms" 
ON public.rooms 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin can manage rooms" 
ON public.rooms 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rooms data
INSERT INTO public.rooms (name, description, price, amenities, display_order) VALUES
('Quarto Standard', 'Quarto confortável para casal', 'R$ 150,00/noite', '{"Cama de casal","Banheiro privativo","Frigobar"}', 1),
('Suíte Premium', 'Suíte espaçosa com varanda', 'R$ 250,00/noite', '{"Cama king size","Varanda","Hidromassagem"}', 2);