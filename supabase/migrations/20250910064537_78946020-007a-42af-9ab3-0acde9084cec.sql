INSERT INTO site_content (section_name, content) 
VALUES ('duvidas', '{
  "title": "Dúvidas",
  "subtitle": "Encontre respostas para as perguntas mais frequentes",
  "background_image_url": "/lovable-uploads/aa2819d6-6c02-49fc-ac57-ef647bc5a3a4.png",
  "faq_description": "Tire suas dúvidas antes de sua visita ao Paradise Vista do Atlântico",
  "contact_title": "Não encontrou sua resposta?",
  "contact_description": "Entre em contato conosco e teremos prazer em ajudá-lo",
  "contact_email": "diretoria@pousadavistadoatlantico.com.br",
  "whatsapp": "5582982235336",
  "phone": "5582982235336",
  "faqs": [
    {
      "id": "1",
      "question": "Qual é o horário de funcionamento?",
      "answer": "Funcionamos das 8h às 22h todos os dias da semana.",
      "category": "geral"
    },
    {
      "id": "2", 
      "question": "Preciso fazer reserva?",
      "answer": "Recomendamos fazer reserva, especialmente em finais de semana e feriados.",
      "category": "reservas"
    },
    {
      "id": "3",
      "question": "Qual é a política de cancelamento?",
      "answer": "Cancelamentos podem ser feitos até 24h antes sem cobrança de taxa.",
      "category": "reservas"
    }
  ]
}')
ON CONFLICT (section_name) 
DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = now()