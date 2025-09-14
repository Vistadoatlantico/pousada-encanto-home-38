
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

// Inicialize o cliente Resend para envio de e-mails
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Configuração dos cabeçalhos CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BirthdayReservationRequest {
  name: string;
  email: string;
  whatsapp: string;
  birthDate: string;
  guests: number;
  preferredDate: string;
}

// Função principal que lida com as requisições
const handler = async (req: Request): Promise<Response> => {
  // Trata requisições CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicialize o cliente Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Extrai os dados da reserva do corpo da requisição
    const { name, email, whatsapp, birthDate, guests, preferredDate }: BirthdayReservationRequest = await req.json();

    // Busca a configuração ativa da promoção de aniversário no Supabase
    const { data: config, error: configError } = await supabaseAdmin
      .from('birthday_modal_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError) {
      console.error("Error fetching birthday config:", configError);
      // Fallback para um e-mail mais simples se a configuração falhar
    }

    // Gera as listas de benefícios e informações importantes dinamicamente
    const benefitsList = config?.benefits
      ? config.benefits.map((item: string) => `<li>${item}</li>`).join('')
      : `<li>Entrada GRATUITA para o aniversariante</li>
         <li>Até 3 acompanhantes também entram GRÁTIS</li>
         <li>Day Use das 10h às 16h</li>
         <li>Acesso às piscinas, área de lazer e área kids</li>`;

    const importantInfoList = config?.important_info
      ? config.important_info.map((item: string) => `<li>${item}</li>`).join('')
      : `<li>Apresente um documento com foto na entrada</li>
         <li>Válido apenas para o mês do aniversário</li>
         <li>Proibido entrada de bebida, comida e som</li>`;


    console.log("Sending confirmation email to:", email);

    // Envia o e-mail usando Resend
    const emailResponse = await resend.emails.send({
      from: "Paradise Vista do Atlântico <noreply@pousadavistadoatlantico.com.br>",
      to: [email],
      subject: "🎉 Confirmação da Reserva - Promoção Aniversariante do Mês",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #6a82fb 0%, #fc5c7d 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .info-box { background-color: #f8f9fa; border-left: 4px solid #6a82fb; padding: 15px; margin: 25px 0; }
            .info-box h3 { margin-top: 0; color: #6a82fb; }
            .info-row { margin: 12px 0; }
            .info-label { font-weight: bold; color: #333; }
            .section-box { border-radius: 8px; padding: 20px; margin: 25px 0; }
            .benefits { background-color: #e8f5e9; }
            .benefits h3 { color: #2e7d32; margin-top: 0; }
            .important { background-color: #fff3e0; }
            .important h3 { color: #e65100; margin-top: 0; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin: 8px 0; color: #555; }
            .footer { background-color: #f4f4f4; padding: 20px; text-align: center; color: #666; }
            .button { display: inline-block; background-color: #25D366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎂 Reserva Confirmada!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Paradise Vista do Atlântico</p>
            </div>
            <div class="content">
              <h2>Olá, ${name}! 🎉</h2>
              <p>Sua solicitação de reserva para a <strong>Promoção Aniversariante do Mês</strong> foi recebida com sucesso!</p>
              
              <div class="info-box">
                <h3>📋 Detalhes da Solicitação</h3>
                <div class="info-row"><span class="info-label">Nome:</span> ${name}</div>
                <div class="info-row"><span class="info-label">Data de Aniversário:</span> ${new Date(birthDate).toLocaleDateString('pt-BR')}</div>
                <div class="info-row"><span class="info-label">Data da Visita:</span> ${new Date(preferredDate).toLocaleDateString('pt-BR')}</div>
                <div class="info-row"><span class="info-label">Acompanhantes:</span> ${guests}</div>
                <div class="info-row"><span class="info-label">WhatsApp:</span> ${whatsapp}</div>
              </div>
              
              <div class="section-box benefits">
                <h3>✅ Seus Benefícios</h3>
                <ul>${benefitsList}</ul>
              </div>
              
              <div class="section-box important">
                <h3>⚠️ Fique Atento</h3>
                <ul>${importantInfoList}</ul>
              </div>
              
              <div style="text-align: center;">
                <p>Dúvidas? Fale conosco diretamente no WhatsApp!</p>
                <a href="https://wa.me/5582982235336?text=Olá!%20Gostaria%20de%20tirar%20uma%20dúvida%20sobre%20minha%20reserva%20de%20aniversariante." class="button">Falar no WhatsApp</a>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Paradise Vista do Atlântico</strong></p>
              <p>Rua Vista Do Atlântico, QD2, N12, Jacarecica, Maceió-AL</p>
              <p>Este é um e-mail automático. Para contato, use nosso WhatsApp.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Retorna uma resposta de sucesso
    return new Response(JSON.stringify({ 
      success: true, 
      message: "E-mail de confirmação enviado com sucesso!",
      data: emailResponse 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-birthday-confirmation function:", error);
    // Retorna uma resposta de erro
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Inicia o servidor Deno
serve(handler);

