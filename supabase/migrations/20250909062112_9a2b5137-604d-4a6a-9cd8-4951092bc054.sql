-- Update day_use content to include all necessary fields
UPDATE site_content 
SET content = jsonb_build_object(
  'title', 'Day Use',
  'subtitle', 'Desfrute de um dia completo de lazer',
  'description', 'Aproveite todas as nossas facilidades durante o dia, sem necessidade de hospedagem.',
  'hours', 'Das 8h às 18h',
  'price', 'R$ 80,00 por pessoa',
  'includes', jsonb_build_array('Piscina', 'Área de lazer', 'Estacionamento', 'Wi-Fi'),
  'packages', jsonb_build_array(
    jsonb_build_object(
      'name', 'Day Use Simples',
      'description', 'Acesso às áreas comuns e piscina',
      'price', 'R$ 80,00',
      'duration', '8h às 18h'
    ),
    jsonb_build_object(
      'name', 'Day Use Premium', 
      'description', 'Inclui almoço e bebidas',
      'price', 'R$ 150,00',
      'duration', '8h às 18h'
    )
  )
)
WHERE section_name = 'day_use';