-- Insert sample categories
INSERT INTO public.categories (name, description, display_order, is_active) VALUES
('Doces', 'Deliciosos doces artesanais, bolos e sobremesas', 1, true),
('Salgados', 'Salgados frescos, pães de queijo e quitutes', 2, true),
('Bebidas', 'Sucos naturais, cafés especiais e refrescos', 3, true),
('Pães', 'Pães artesanais feitos diariamente', 4, true);

-- Insert sample products
INSERT INTO public.products (name, description, price, category_id, display_order, is_active, stock_quantity) 
SELECT 
  'Bolo de Chocolate',
  'Delicioso bolo de chocolate artesanal',
  45.00,
  c.id,
  1,
  true,
  10
FROM public.categories c WHERE c.name = 'Doces';

INSERT INTO public.products (name, description, price, category_id, display_order, is_active, stock_quantity) 
SELECT 
  'Pão de Queijo',
  'Pão de queijo mineiro tradicional',
  2.50,
  c.id,
  1,
  true,
  50
FROM public.categories c WHERE c.name = 'Salgados';

INSERT INTO public.products (name, description, price, category_id, display_order, is_active, stock_quantity) 
SELECT 
  'Brigadeiro Gourmet',
  'Brigadeiros artesanais diversos sabores',
  3.50,
  c.id,
  2,
  true,
  30
FROM public.categories c WHERE c.name = 'Doces';

INSERT INTO public.products (name, description, price, category_id, display_order, is_active, stock_quantity) 
SELECT 
  'Suco de Laranja',
  'Suco natural de laranja',
  8.00,
  c.id,
  1,
  true,
  20
FROM public.categories c WHERE c.name = 'Bebidas';

INSERT INTO public.products (name, description, price, category_id, display_order, is_active, stock_quantity) 
SELECT 
  'Pão Francês',
  'Pão francês quentinho',
  0.80,
  c.id,
  1,
  true,
  100
FROM public.categories c WHERE c.name = 'Pães';