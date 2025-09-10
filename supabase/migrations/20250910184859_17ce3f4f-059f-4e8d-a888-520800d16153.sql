-- Add store configuration to control virtual store visibility
INSERT INTO public.site_content (section_name, content) 
VALUES ('store_config', '{"is_active": true, "admin_message": "Loja Virtual em Manutenção", "user_message": "Nossa loja virtual está temporariamente indisponível. Em breve estará disponível novamente!"}')
ON CONFLICT (section_name) DO UPDATE SET 
content = EXCLUDED.content;