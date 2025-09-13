
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Gift, AlertTriangle, List, Save, Calendar, Users } from "lucide-react";

interface BirthdayConfig {
  id: number;
  is_active: boolean;
  title: string;
  subtitle: string;
  benefits: string[];
  important_info: string[];
  available_month: number;
  available_year: number;
  max_companions: number; // Adicionado
}

const BirthdayModalManager = () => {
  const [config, setConfig] = useState<Partial<BirthdayConfig>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("birthday_modal_config")
      .select("*")
      .eq("is_active", true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
      toast({
        title: "Erro ao carregar configuração",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setConfig(data);
    } else {
      toast({
        title: "Nenhuma configuração ativa encontrada",
        description: "Parece que não há uma configuração de modal de aniversário ativa no banco de dados.",
        variant: "destructive"
      });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleUpdate = async () => {
    if (!config.id) {
      toast({ title: "Erro", description: "ID da configuração não encontrado.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("birthday_modal_config")
      .update({
        title: config.title,
        subtitle: config.subtitle,
        benefits: config.benefits,
        important_info: config.important_info,
        available_month: config.available_month,
        available_year: config.available_year,
        is_active: config.is_active,
        max_companions: config.max_companions, // Adicionado
      })
      .eq("id", config.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Configuração atualizada!",
        description: "As informações do modal de aniversário foram salvas.",
      });
      fetchConfig();
    }
  };

  const handleTextareaChange = (field: 'benefits' | 'important_info', value: string) => {
    setConfig(prev => ({ ...prev, [field]: value.split('\n') }));
  }

  if (loading && Object.keys(config).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-paradise-blue" />
            Gerenciar Modal de Aniversariante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando configuração...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-paradise-blue" />
          Gerenciar Modal de Aniversariante
        </CardTitle>
        <CardDescription>
          Edite os textos, benefícios e regras que aparecem no pop-up de reserva para aniversariantes no site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="is-active"
            checked={config.is_active || false}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is-active">Ativar o modal de aniversário no site</Label>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título Principal</Label>
            <Input
              id="title"
              value={config.title || ""}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Reserva Aniversariante do Mês"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo (Chamada)</Label>
            <Input
              id="subtitle"
              value={config.subtitle || ""}
              onChange={(e) => setConfig(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Ex: 🎂 Entrada GRATUITA para aniversariantes do mês!"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-2">
                 <Label className="flex items-center gap-2 font-semibold"><Calendar/> Período da Promoção</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="available_month">Mês de Validade (1-12)</Label>
                    <Input
                        id="available_month"
                        type="number"
                        min="1"
                        max="12"
                        value={config.available_month || ""}
                        onChange={(e) => setConfig(prev => ({ ...prev, available_month: parseInt(e.target.value) || undefined }))}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="available_year">Ano de Validade</Label>
                    <Input
                        id="available_year"
                        type="number"
                        value={config.available_year || ""}
                        onChange={(e) => setConfig(prev => ({ ...prev, available_year: parseInt(e.target.value) || undefined }))}
                    />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold"><Users/> Acompanhantes</Label>
                 <div className="space-y-2">
                    <Label htmlFor="max_companions">Número Máximo de Acompanhantes</Label>
                    <Input
                        id="max_companions"
                        type="number"
                        min="0"
                        value={config.max_companions ?? 3}
                        onChange={(e) => setConfig(prev => ({ ...prev, max_companions: parseInt(e.target.value) || 0 }))}
                    />
                </div>
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="benefits" className="flex items-center gap-2 font-semibold"><List />Benefícios (um por linha)</Label>
          <Textarea
            id="benefits"
            rows={5}
            value={(config.benefits || []).join('\n')}
            onChange={(e) => handleTextareaChange('benefits', e.target.value)}
            placeholder="Aniversariante entrada GRÁTIS no Day use"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="important_info" className="flex items-center gap-2 font-semibold"><AlertTriangle/>Informações Importantes (uma por linha)</Label>
          <Textarea
            id="important_info"
            rows={5}
            value={(config.important_info || []).join('\n')}
            onChange={(e) => handleTextareaChange('important_info', e.target.value)}
            placeholder="Válido apenas para o mês especificado"
          />
        </div>

        <Button onClick={handleUpdate} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BirthdayModalManager;
