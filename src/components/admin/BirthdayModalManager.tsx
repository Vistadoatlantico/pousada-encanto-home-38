import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Gift, Settings, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BirthdayModalManager = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [importantInfo, setImportantInfo] = useState<string[]>([]);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('birthday_modal_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
        setBenefits(Array.isArray(data.benefits) ? data.benefits as string[] : []);
        setImportantInfo(Array.isArray(data.important_info) ? data.important_info as string[] : []);
      } else {
        // Criar configuração padrão se não existir
        await createDefaultConfig();
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configuração do modal de aniversariante",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultConfig = async () => {
    const defaultConfig = {
      available_month: 9,
      available_year: 2025,
      title: 'Reserva Aniversariante do Mês',
      subtitle: '🎂 Entrada GRATUITA para aniversariantes do mês! 🎁 Até 3 acompanhantes também entram grátis!',
      benefits: [
        'Aniversariante entrada GRÁTIS no Day use',
        'Traga até 3 amigos também GRÁTIS',
        'Das 10h às 16h para aproveitar o dia todo',
        'Piscinas para day use, Área de lazer, Área kids e muito mais'
      ],
      important_info: [
        'Válido apenas para o mês especificado',
        'Agendamento obrigatório com antecedência',
        'Documentos de identificação necessários',
        'Não é válido em feriados especiais'
      ],
      is_active: true
    };

    const { data, error } = await supabase
      .from('birthday_modal_config')
      .insert([defaultConfig])
      .select()
      .single();

    if (!error && data) {
      setConfig(data);
      setBenefits(Array.isArray(data.benefits) ? data.benefits as string[] : []);
      setImportantInfo(Array.isArray(data.important_info) ? data.important_info as string[] : []);
    }
  };

  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addBenefit = () => {
    setBenefits([...benefits, '']);
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const addImportantInfo = () => {
    setImportantInfo([...importantInfo, '']);
  };

  const removeImportantInfo = (index: number) => {
    setImportantInfo(importantInfo.filter((_, i) => i !== index));
  };

  const updateImportantInfo = (index: number, value: string) => {
    const newInfo = [...importantInfo];
    newInfo[index] = value;
    setImportantInfo(newInfo);
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const updatedConfig = {
        ...config,
        benefits: benefits.filter(b => b.trim()),
        important_info: importantInfo.filter(i => i.trim())
      };

      const { error } = await supabase
        .from('birthday_modal_config')
        .update(updatedConfig)
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração do modal atualizada com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            <CardTitle>Configurar Modal de Aniversariante</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            Carregando configuração...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          <CardTitle>Configurar Modal de Aniversariante</CardTitle>
        </div>
        <CardDescription>
          Configure os textos, data disponível e benefícios do modal de reserva de aniversariante
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configurações Gerais */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold">
            <Settings className="w-4 h-4" />
            Configurações Gerais
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título do Modal</Label>
              <Input
                id="title"
                value={config?.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder="Título do modal"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={config?.is_active || false}
                onCheckedChange={(checked) => handleConfigChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Modal Ativo</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="subtitle">Subtítulo/Descrição</Label>
            <Textarea
              id="subtitle"
              value={config?.subtitle || ''}
              onChange={(e) => handleConfigChange('subtitle', e.target.value)}
              placeholder="Descrição que aparece no topo do modal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="available_month">Mês Disponível</Label>
              <Select
                value={config?.available_month?.toString() || '9'}
                onValueChange={(value) => handleConfigChange('available_month', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Janeiro</SelectItem>
                  <SelectItem value="2">Fevereiro</SelectItem>
                  <SelectItem value="3">Março</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Maio</SelectItem>
                  <SelectItem value="6">Junho</SelectItem>
                  <SelectItem value="7">Julho</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="available_year">Ano Disponível</Label>
              <Input
                id="available_year"
                type="number"
                value={config?.available_year || 2025}
                onChange={(e) => handleConfigChange('available_year', parseInt(e.target.value))}
                min="2024"
                max="2030"
              />
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <Gift className="w-4 h-4" />
              Benefícios GRATUITOS
            </div>
            <Button size="sm" variant="outline" onClick={addBenefit}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
          
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={benefit}
                  onChange={(e) => updateBenefit(index, e.target.value)}
                  placeholder="Descrição do benefício"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeBenefit(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Informações Importantes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <Settings className="w-4 h-4" />
              Informações Importantes
            </div>
            <Button size="sm" variant="outline" onClick={addImportantInfo}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
          
          <div className="space-y-2">
            {importantInfo.map((info, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={info}
                  onChange={(e) => updateImportantInfo(index, e.target.value)}
                  placeholder="Informação importante"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeImportantInfo(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={saveConfig} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdayModalManager;