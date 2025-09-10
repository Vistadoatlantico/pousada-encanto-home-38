import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Store, Settings } from 'lucide-react';

const StoreConfigManager = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    is_active: true,
    admin_message: '',
    user_message: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'store_config')
        .single();

      if (error) throw error;

      if (data?.content) {
        setConfig(data.content as any);
      }
    } catch (error) {
      console.error('Error fetching store config:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações da loja",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          section_name: 'store_config',
          content: config
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações da loja atualizadas com sucesso"
      });
    } catch (error) {
      console.error('Error saving store config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações da loja",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Carregando configurações...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Configurações da Loja Virtual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Label className="text-base font-medium">Status da Loja Virtual</Label>
            <p className="text-sm text-muted-foreground">
              {config.is_active ? 'A loja está ativa e visível para todos os usuários' : 'A loja está desativada e visível apenas para admins'}
            </p>
          </div>
          <Switch
            checked={config.is_active}
            onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-message">Mensagem para Admins (quando desativada)</Label>
            <Textarea
              id="admin-message"
              placeholder="Mensagem que será exibida para admins quando a loja estiver desativada"
              value={config.admin_message}
              onChange={(e) => setConfig({ ...config, admin_message: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-message">Mensagem para Usuários (quando desativada)</Label>
            <Textarea
              id="user-message"
              placeholder="Mensagem que será exibida para usuários quando a loja estiver desativada"
              value={config.user_message}
              onChange={(e) => setConfig({ ...config, user_message: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <Button onClick={saveConfig} disabled={saving} className="w-full">
          <Settings className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StoreConfigManager;