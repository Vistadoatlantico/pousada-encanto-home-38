-- Adicionar campo para imagem de fundo e galeria de imagens na tabela site_content
-- O campo 'content' já é JSONB, então podemos adicionar os novos campos dentro dele

-- Atualizar o conteúdo da página cafe_da_manha para incluir os novos campos
UPDATE site_content 
SET content = jsonb_set(
  COALESCE(content, '{}'::jsonb),
  '{gallery_images}',
  '[]'::jsonb
)
WHERE section_name = 'cafe_da_manha' 
  AND NOT (content ? 'gallery_images');

UPDATE site_content 
SET content = jsonb_set(
  COALESCE(content, '{}'::jsonb),
  '{background_image_url}',
  'null'::jsonb
)
WHERE section_name = 'cafe_da_manha' 
  AND NOT (content ? 'background_image_url');