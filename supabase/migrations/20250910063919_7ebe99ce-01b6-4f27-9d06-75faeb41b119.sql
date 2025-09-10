INSERT INTO site_content (section_name, content) 
VALUES ('spa', '{
  "title": "SPA",
  "subtitle": "Relaxamento e bem-estar", 
  "description": "Relaxamento total com nossos serviços exclusivos",
  "services": [
    {
      "name": "Massagem Relaxante",
      "description": "Massagem completa para relaxamento",
      "duration": "01:00:00",
      "price": "R$ 80,00",
      "image": "/lovable-uploads/296a86d1-243c-456c-ad61-18e93f379595.png"
    }
  ],
  "packages": [],
  "heroImage": "",
  "galleryImages": [],
  "hours": "Das 9h às 19h",
  "benefits": ["Ambiente tranquilo", "Profissionais qualificados", "Produtos premium", "Vista relaxante"]
}')
ON CONFLICT (section_name) 
DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = now()