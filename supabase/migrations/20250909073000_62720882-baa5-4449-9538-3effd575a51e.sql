-- Criar tabela para reservas de aniversariantes
CREATE TABLE public.birthday_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE NOT NULL,
  whatsapp TEXT NOT NULL,
  companions INTEGER DEFAULT 0,
  visit_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.birthday_reservations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Qualquer um pode inserir uma reserva (público pode fazer reserva)
CREATE POLICY "Anyone can create birthday reservations" 
ON public.birthday_reservations 
FOR INSERT 
WITH CHECK (true);

-- Apenas admins podem visualizar, editar e excluir reservas
CREATE POLICY "Admin can manage birthday reservations" 
ON public.birthday_reservations 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 
  FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_birthday_reservations_updated_at
BEFORE UPDATE ON public.birthday_reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();