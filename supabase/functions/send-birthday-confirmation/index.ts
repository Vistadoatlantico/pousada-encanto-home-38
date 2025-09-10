import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, whatsapp, birthDate, guests, preferredDate }: BirthdayReservationRequest = await req.json();

    console.log("Sending confirmation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Paradise Vista do Atlântico <noreply@pousadavistadoatlantico.com.br>",
      to: [email],
      subject: "🎉 Confirmação da Reserva - Promoção Aniversariante do Mês",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px;
            }
            .info-box {
              background-color: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
            }
            .info-box h3 {
              margin-top: 0;
              color: #667eea;
            }
            .info-row {
              margin: 10px 0;
            }
            .info-label {
              font-weight: bold;
              color: #333;
            }
            .benefits {
              background-color: #e8f5e9;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .benefits h3 {
              color: #2e7d32;
              margin-top: 0;
            }
            .benefits ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .benefits li {
              margin: 8px 0;
            }
            .important {
              background-color: #fff3e0;
              border: 1px solid #ff9800;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            }
            .important h3 {
              color: #e65100;
              margin-top: 0;
            }
            .footer {
              background-color: #f4f4f4;
              padding: 20px;
              text-align: center;
              color: #666;
            }
            .button {
              display: inline-block;
              background-color: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 25px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎂 Reserva Confirmada!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Paradise Vista do Atlântico</p>
            </div>
            
            <div class="content">
              <h2>Olá ${name}! 🎉</h2>
              <p>Sua reserva para a <strong>Promoção Aniversariante do Mês</strong> foi recebida com sucesso!</p>
              
              <div class="info-box">
                <h3>📋 Detalhes da Reserva</h3>
                <div class="info-row">
                  <span class="info-label">Nome:</span> ${name}
                </div>
                <div class="info-row">
                  <span class="info-label">Data de Aniversário:</span> ${new Date(birthDate).toLocaleDateString('pt-BR')}
                </div>
                <div class="info-row">
                  <span class="info-label">Data Preferida:</span> ${new Date(preferredDate).toLocaleDateString('pt-BR')}
                </div>
                <div class="info-row">
                  <span class="info-label">Número de Acompanhantes:</span> ${guests} pessoas
                </div>
                <div class="info-row">
                  <span class="info-label">WhatsApp:</span> ${whatsapp}
                </div>
              </div>
              
              <div class="benefits">
                <h3>✅ Benefícios Incluídos</h3>
                <ul>
                  <li>Entrada GRATUITA para o aniversariante</li>
                  <li>Até 3 acompanhantes também entram GRÁTIS</li>
                  <li>Day Use das 10h às 16h</li>
                  <li>Acesso às piscinas</li>
                  <li>Área de lazer completa</li>
                  <li>Área kids</li>
                </ul>
              </div>
              
              <div class="important">
                <h3>⚠️ Informações Importantes</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Apresente um documento com foto na entrada</li>
                  <li>Válido apenas para o mês do aniversário</li>
                  <li>Proibido entrada de bebida, comida e som</li>
                </ul>
              </div>
              
              
              <div style="text-align: center;">
                <a href="https://wa.me/5582982235336" class="button">Falar no WhatsApp</a>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Paradise Vista do Atlântico</strong></p>
              <p>Rua Vista Do Atlântico, QD2, N12, Jacarecica, Maceió-AL</p>
              <p>📞 (82) 98223-5336</p>
              <p style="font-size: 12px; margin-top: 20px;">
                Este e-mail foi enviado automaticamente. Por favor, não responda.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email enviado com sucesso",
      data: emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-birthday-confirmation function:", error);
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

serve(handler);