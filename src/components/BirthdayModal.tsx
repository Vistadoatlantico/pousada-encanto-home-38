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

interface BirthdayConfig {
  id: number;
  is_active: boolean;
  title: string;
  subtitle: string;
  benefits: string[];
  important_info: string[];
  available_month: number;
  available_year: number;
  max_companions: number;
}

const BirthdayModal = ({ isOpen, onClose }: BirthdayModalProps) => {
  const { toast } = useToast();
  const [visitDate, setVisitDate] = useState<Date>();
  const [config, setConfig] = useState<BirthdayConfig | null>(null);
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
    const cpf = value.replace(/\D/g, '');
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return cpf.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    if (cpf.length <= 9) return cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length <= 2) return phone;
    if (phone.length <= 7) return phone.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    return phone.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
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
    
    if (!formData.fullName || !formData.email || !formData.cpf || !formData.birthDate || !formData.whatsapp || !visitDate) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }

    const numCompanions = parseInt(formData.companions) || 0;
    if (numCompanions > 0 && companionNames.some(name => !name.trim())) {
      toast({ title: "Nomes dos acompanhantes obrigatórios", description: "Por favor, preencha o nome de todos os acompanhantes.", variant: "destructive" });
      return;
    }

    const isoBirthDate = toISODate(formData.birthDate);
    if (!isoBirthDate) {
      toast({ title: "Data de nascimento inválida", description: "Use o formato DD/MM/AAAA.", variant: "destructive" });
      return;
    }

    try {
      const { data: existingReservation } = await supabase.from('birthday_reservations').select('id').eq('cpf', formData.cpf).maybeSingle();
      if (existingReservation) {
        toast({ title: "CPF já cadastrado", description: "Já existe uma reserva aniversariante cadastrada com este CPF.", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from('birthday_reservations').insert([{
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
        toast({ title: "Erro ao enviar reserva", description: error.message, variant: "destructive" });
        return;
      }
      
      await supabase.functions.invoke('send-birthday-confirmation', {
          body: {
            name: formData.fullName,
            email: formData.email,
            whatsapp: formData.whatsapp,
            birthDate: isoBirthDate,
            guests: parseInt(formData.companions) || 0,
            preferredDate: visitDate ? format(visitDate, 'yyyy-MM-dd') : ''
          }
      });

      toast({ title: "Reserva solicitada!", description: "Sua reserva foi enviada com sucesso. Você receberá um e-mail de confirmação!" });

      setFormData({ fullName: '', email: '', cpf: '', birthDate: '', whatsapp: '', companions: '' });
      setCompanionNames([]);
      setVisitDate(undefined);
      onClose();
    } catch (error) {
      toast({ title: "Erro inesperado", description: "Ocorreu um erro ao enviar a reserva. Tente novamente.", variant: "destructive" });
    }
  };

  const maxCompanions = config?.max_companions ?? 3;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <button onClick={onClose} className="absolute -top-2 -right-2 p-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"><X className="w-4 h-4" /></button>
          <DialogTitle className="text-center text-paradise-blue text-xl font-bold flex items-center justify-center gap-2">
            <Gift className="w-6 h-6" />
            {config?.title || 'Reserva Aniversariante do Mês'}
            <Gift className="w-6 h-6" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-700 font-medium mb-2">{config?.subtitle || 'Carregando...'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base font-semibold"><Calendar className="w-5 h-5" />Dados do Aniversariante</div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="fullName">Nome Completo do Aniversariante *</Label>
                  <Input id="fullName" placeholder="Nome completo do aniversariante" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">E-mail para Verificação *</Label>
                  <Input id="email" type="email" placeholder="seuemail@exemplo.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">✓ Enviaremos uma confirmação para este e-mail</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cpf">CPF do Aniversariante *</Label>
                    <Input id="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={(e) => handleCPFChange(e.target.value)} maxLength={14} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input id="birthDate" type="text" inputMode="numeric" placeholder="dd/mm/aaaa" value={formData.birthDate} onChange={(e) => handleBirthDateChange(e.target.value)} maxLength={10} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="whatsapp">Número para Contato (WhatsApp) *</Label>
                  <Input id="whatsapp" placeholder="(82) 99999-9999" value={formData.whatsapp} onChange={(e) => handlePhoneChange(e.target.value)} maxLength={15} className="mt-1" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base font-semibold"><Users className="w-5 h-5" />Detalhes da Visita</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="companions">Número de Acompanhantes (máx. {maxCompanions})</Label>
                  <Select value={formData.companions} onValueChange={(value) => handleInputChange('companions', value)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Nenhum acompanhante" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxCompanions + 1 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {i === 0 ? 'Nenhum acompanhante' : `${i} acompanhante${i > 1 ? 's' : ''}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="visitDate">Data da Visita *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !visitDate && "text-muted-foreground")}>
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
                          const availableMonth = (config?.available_month ?? 9) - 1;
                          const availableYear = config?.available_year ?? 2025;
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date.getMonth() !== availableMonth || date.getFullYear() !== availableYear || date < today;
                        }}
                        initialFocus
                        className="pointer-events-auto"
                        defaultMonth={new Date(config?.available_year ?? 2025, (config?.available_month ?? 9) - 1)}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-paradise-blue mt-1">
                    Disponível apenas em {config?.available_month ? `${config.available_month}/${config.available_year}` : 'Carregando...'}
                  </p>
                </div>
              </div>
              
              {parseInt(formData.companions) > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Users className="w-4 h-4" />Nomes dos Acompanhantes</div>
                  {companionNames.map((name, index) => (
                    <div key={index}>
                      <Label htmlFor={`companion-${index}`}>{index + 1}º Acompanhante *</Label>
                      <Input id={`companion-${index}`} placeholder={`Nome do ${index + 1}º acompanhante`} value={name} onChange={(e) => handleCompanionNameChange(index, e.target.value)} className="mt-1" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-paradise-blue font-semibold mb-3"><Gift className="w-5 h-5" />Seus Benefícios GRATUITOS</div>
              <ul className="space-y-2 text-sm text-blue-700">
                {config?.benefits?.length ? config.benefits.map((benefit: string, index: number) => <li key={index}>• {benefit}</li>) : <li>Carregando benefícios...</li>}
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-3"><AlertTriangle className="w-5 h-5" />Informações Importantes</div>
              <ul className="space-y-2 text-sm text-yellow-800">
                {config?.important_info?.length ? config.important_info.map((info: string, index: number) => (
                  <li key={index} className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />{info}</li>
                )) : <li>Carregando informações...</li>}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
              <Button type="submit" className="flex-1 bg-paradise-blue hover:bg-paradise-blue/90"><Gift className="w-4 h-4 mr-2" />Reservar GRÁTIS</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BirthdayModal;