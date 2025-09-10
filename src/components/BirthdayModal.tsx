import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, CalendarDays, Gift, Users, Clock, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BirthdayModal = ({ isOpen, onClose }: BirthdayModalProps) => {
  const { toast } = useToast();
  const [visitDate, setVisitDate] = useState<Date>();
  const [config, setConfig] = useState<any>(null);
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cpf: '',
    birthDate: '',
    whatsapp: '',
    companions: ''
  });

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('birthday_modal_config')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (data) {
        setConfig(data);
      }
    };
    
    fetchConfig();
  }, []);

  useEffect(() => {
    const numCompanions = parseInt(formData.companions) || 0;
    setCompanionNames(Array(numCompanions).fill(''));
  }, [formData.companions]);

  const handleCompanionNameChange = (index: number, name: string) => {
    const newNames = [...companionNames];
    newNames[index] = name;
    setCompanionNames(newNames);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const cpf = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (cpf.length <= 3) {
      return cpf;
    } else if (cpf.length <= 6) {
      return cpf.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    } else if (cpf.length <= 9) {
      return cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const phone = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (phone.length <= 2) {
      return phone;
    } else if (phone.length <= 7) {
      return phone.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else {
      return phone.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    handleInputChange('cpf', formatted);
  };

  const formatBirthDate = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    if (digits.length <= 2) return dd;
    if (digits.length <= 4) return `${dd}/${mm}`;
    return `${dd}/${mm}/${yyyy}`;
  };

  const toISODate = (ddmmyyyy: string) => {
    const m = ddmmyyyy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleBirthDateChange = (value: string) => {
    const formatted = formatBirthDate(value);
    handleInputChange('birthDate', formatted);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleInputChange('whatsapp', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.fullName || !formData.email || !formData.cpf || !formData.birthDate || !formData.whatsapp || !visitDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validação dos nomes dos acompanhantes
    const numCompanions = parseInt(formData.companions) || 0;
    if (numCompanions > 0 && companionNames.some(name => !name.trim())) {
      toast({
        title: "Nomes dos acompanhantes obrigatórios",
        description: "Por favor, preencha o nome de todos os acompanhantes.",
        variant: "destructive"
      });
      return;
    }

    const isoBirthDate = toISODate(formData.birthDate);
    if (!isoBirthDate) {
      toast({
        title: "Data de nascimento inválida",
        description: "Use o formato DD/MM/AAAA.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar se já existe uma reserva com este CPF
      const { data: existingReservation } = await supabase
        .from('birthday_reservations')
        .select('id')
        .eq('cpf', formData.cpf)
        .maybeSingle();

      if (existingReservation) {
        toast({
          title: "CPF já cadastrado",
          description: "Já existe uma reserva aniversariante cadastrada com este CPF.",
          variant: "destructive"
        });
        return;
      }

      // Salvar no banco de dados
      const { error } = await supabase
        .from('birthday_reservations')
        .insert([{
          full_name: formData.fullName,
          email: formData.email,
          cpf: formData.cpf,
          birth_date: isoBirthDate,
          whatsapp: formData.whatsapp,
          companions: parseInt(formData.companions) || 0,
          companion_names: companionNames.filter(name => name.trim()),
          visit_date: visitDate ? format(visitDate, 'yyyy-MM-dd') : '',
          status: 'pending'
        }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "CPF já cadastrado",
            description: "Já existe uma reserva aniversariante cadastrada para este CPF.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro ao enviar reserva",
            description: error.message,
            variant: "destructive"
          });
        }
        return;
      }

      // Send confirmation email
      try {
        console.log('Sending confirmation email...');
        const emailResponse = await supabase.functions.invoke('send-birthday-confirmation', {
          body: {
            name: formData.fullName,
            email: formData.email,
            whatsapp: formData.whatsapp,
            birthDate: isoBirthDate,
            guests: parseInt(formData.companions) || 0,
            preferredDate: visitDate ? format(visitDate, 'yyyy-MM-dd') : ''
          }
        });

        console.log('Email response:', emailResponse);

        if (emailResponse.error) {
          console.error('Error sending confirmation email:', emailResponse.error);
          toast({
            title: "Reserva solicitada!",
            description: "Sua reserva foi enviada com sucesso. Entraremos em contato via WhatsApp para confirmar.",
          });
        } else {
          console.log('Confirmation email sent successfully');
          toast({
            title: "Reserva solicitada!",
            description: "Sua reserva foi enviada com sucesso. Você receberá um e-mail de confirmação!",
          });
        }
      } catch (emailError) {
        console.error('Error calling email function:', emailError);
        toast({
          title: "Reserva solicitada!",
          description: "Sua reserva foi enviada com sucesso. Entraremos em contato via WhatsApp para confirmar.",
        });
      }

      
      // Resetar formulário e fechar modal
      setFormData({
        fullName: '',
        email: '',
        cpf: '',
        birthDate: '',
        whatsapp: '',
        companions: ''
      });
      setCompanionNames([]);
      setVisitDate(undefined);
      onClose();
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao enviar a reserva. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <DialogTitle className="text-center text-paradise-blue text-xl font-bold flex items-center justify-center gap-2">
            <Gift className="w-6 h-6" />
            {config?.title || 'Reserva Aniversariante do Mês'}
            <Gift className="w-6 h-6" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefícios */}
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-700 font-medium mb-2">
              {config?.subtitle || '🎂 Entrada GRATUITA para aniversariantes do mês! 🎁 Até 3 acompanhantes também entram grátis!'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Aniversariante */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base font-semibold">
                <Calendar className="w-5 h-5" />
                Dados do Aniversariante
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="fullName">Nome Completo do Aniversariante *</Label>
                  <Input
                    id="fullName"
                    placeholder="Nome completo do aniversariante"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail para Verificação *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ✓ Enviaremos uma confirmação para este e-mail
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cpf">CPF do Aniversariante *</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => handleCPFChange(e.target.value)}
                      maxLength={14}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/aaaa"
                      value={formData.birthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      maxLength={10}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp">Número para Contato (WhatsApp) *</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(82) 99999-9999"
                    value={formData.whatsapp}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={15}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Detalhes da Visita */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base font-semibold">
                <Users className="w-5 h-5" />
                Detalhes da Visita
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="companions">Número de Acompanhantes (máx. 3)</Label>
                  <Select value={formData.companions} onValueChange={(value) => handleInputChange('companions', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Nenhum acompanhante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Nenhum acompanhante</SelectItem>
                      <SelectItem value="1">1 acompanhante</SelectItem>
                      <SelectItem value="2">2 acompanhantes</SelectItem>
                      <SelectItem value="3">3 acompanhantes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="visitDate">Data da Visita *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !visitDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {visitDate ? format(visitDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={visitDate}
                        onSelect={setVisitDate}
                        disabled={(date) => {
                          // Use config for available month/year
                          const availableMonth = (config?.available_month ?? 9) - 1; // Convert to 0-indexed
                          const availableYear = config?.available_year ?? 2025;
                          return date.getMonth() !== availableMonth || date.getFullYear() !== availableYear || date < new Date();
                        }}
                        initialFocus
                        className="pointer-events-auto"
                        defaultMonth={new Date(config?.available_year ?? 2025, (config?.available_month ?? 9) - 1)}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-paradise-blue mt-1">
                    Disponível apenas em {config?.available_month ? `${config.available_month}/${config.available_year}` : 'setembro/2025'}
                  </p>
                </div>
              </div>
              
              {/* Nomes dos Acompanhantes */}
              {parseInt(formData.companions) > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users className="w-4 h-4" />
                    Nomes dos Acompanhantes
                  </div>
                  {companionNames.map((name, index) => (
                    <div key={index}>
                      <Label htmlFor={`companion-${index}`}>
                        {index + 1}º Acompanhante *
                      </Label>
                      <Input
                        id={`companion-${index}`}
                        placeholder={`Nome do ${index + 1}º acompanhante`}
                        value={name}
                        onChange={(e) => handleCompanionNameChange(index, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Benefícios GRATUITOS */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-paradise-blue font-semibold mb-3">
                <Gift className="w-5 h-5" />
                Seus Benefícios GRATUITOS
              </div>
              <ul className="space-y-2 text-sm text-blue-700">
                {config?.benefits ? (
                  config.benefits.map((benefit: string, index: number) => (
                    <li key={index}>• {benefit}</li>
                  ))
                ) : (
                  <>
                    <li>• Aniversariante entrada GRÁTIS no Day use</li>
                    <li>• Traga até 3 amigos também GRÁTIS</li>
                    <li>• Das 10h às 16h para aproveitar o dia todo</li>
                    <li>• Piscinas para day use, Área de lazer, Área kids e muito mais</li>
                  </>
                )}
              </ul>
            </div>

            {/* Informações Importantes */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-3">
                <AlertTriangle className="w-5 h-5" />
                Informações Importantes
              </div>
              <ul className="space-y-2 text-sm text-yellow-800">
                {config?.important_info ? (
                  config.important_info.map((info: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {info}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Válido apenas para o mês especificado
                    </li>
                    <li className="flex items-start gap-2">
                      <CalendarDays className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Agendamento obrigatório com antecedência
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Documentos de identificação necessários
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Não é válido em feriados especiais
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-paradise-blue hover:bg-paradise-blue/90"
              >
                <Gift className="w-4 h-4 mr-2" />
                Reservar GRÁTIS
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BirthdayModal;