-- Create table for birthday modal configuration
CREATE TABLE public.birthday_modal_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  available_month INTEGER NOT NULL DEFAULT 9, -- September (month 9)
  available_year INTEGER NOT NULL DEFAULT 2025,
  title TEXT NOT NULL DEFAULT 'Reserva Aniversariante do Mês',
  subtitle TEXT NOT NULL DEFAULT '🎂 Entrada GRATUITA para aniversariantes do mês! 🎁 Até 3 acompanhantes também entram grátis!',
  benefits JSONB NOT NULL DEFAULT '["Aniversariante entrada GRÁTIS no Day use", "Traga até 3 amigos também GRÁTIS", "Das 10h às 16h para aproveitar o dia todo", "Piscinas para day use, Área de lazer, Área kids e muito mais"]',
  important_info JSONB NOT NULL DEFAULT '["Válido apenas para o mês especificado", "Agendamento obrigatório com antecedência", "Documentos de identificação necessários", "Não é válido em feriados especiais"]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.birthday_modal_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view birthday modal config" 
ON public.birthday_modal_config 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin can manage birthday modal config" 
ON public.birthday_modal_config 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Insert default configuration
INSERT INTO public.birthday_modal_config (
  available_month, 
  available_year, 
  title, 
  subtitle, 
  benefits, 
  important_info
) VALUES (
  9, 
  2025,
  'Reserva Aniversariante do Mês',
  '🎂 Entrada GRATUITA para aniversariantes do mês! 🎁 Até 3 acompanhantes também entram grátis!',
  '["Aniversariante entrada GRÁTIS no Day use", "Traga até 3 amigos também GRÁTIS", "Das 10h às 16h para aproveitar o dia todo", "Piscinas para day use, Área de lazer, Área kids e muito mais"]',
  '["Válido apenas para o mês especificado", "Agendamento obrigatório com antecedência", "Documentos de identificação necessários", "Não é válido em feriados especiais"]'
);

-- Add companion names column to birthday_reservations
ALTER TABLE public.birthday_reservations 
ADD COLUMN companion_names JSONB DEFAULT '[]';

-- Create trigger for updating timestamps
CREATE TRIGGER update_birthday_modal_config_updated_at
BEFORE UPDATE ON public.birthday_modal_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();