import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Gift, Users, Phone, Mail, FileText, Filter, Check, X, Clock, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from 'xlsx';
import { Label } from "@/components/ui/label";

interface BirthdayReservation {
  id: string;
  full_name: string;
  email: string;
  cpf: string;
  birth_date: string;
  whatsapp: string;
  companions: number;
  companion_names?: Json;
  visit_date: string;
  status: string;
  notes?: string;
  created_at: string;
}

const BirthdayReservationsManager = () => {
  const [reservations, setReservations] = useState<BirthdayReservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<BirthdayReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<BirthdayReservation | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, statusFilter, searchTerm, visitDate]);

  const fetchReservations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('birthday_reservations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Erro ao carregar reservas",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setReservations(data || []);
    }
    setLoading(false);
  };

  const filterReservations = () => {
    let filtered = reservations;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(res => res.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(res => 
        res.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.cpf.includes(searchTerm)
      );
    }

    if (visitDate) {
        const targetDate = new Date(visitDate);
        filtered = filtered.filter(res => {
            const reservationDate = new Date(res.visit_date);
            return (
                reservationDate.getUTCFullYear() === targetDate.getUTCFullYear() &&
                reservationDate.getUTCMonth() === targetDate.getUTCMonth() &&
                reservationDate.getUTCDate() === targetDate.getUTCDate()
            );
        });
    }

    setFilteredReservations(filtered);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('birthday_reservations')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Status atualizado com sucesso!",
      });
      fetchReservations();
    }
  };

  const updateNotes = async (id: string) => {
    const { error } = await supabase
      .from('birthday_reservations')
      .update({ notes: editingNotes })
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao salvar observações",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Observações salvas com sucesso!",
      });
      setSelectedReservation(null);
      setEditingNotes('');
      fetchReservations();
    }
  };

  const deleteReservation = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar a reserva de ${name}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const { error } = await supabase
      .from('birthday_reservations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao deletar reserva",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Reserva deletada com sucesso!",
        description: `A reserva de ${name} foi removida.`,
      });
      fetchReservations();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Aprovada', variant: 'default' as const, icon: Check },
      rejected: { label: 'Rejeitada', variant: 'destructive' as const, icon: X },
      completed: { label: 'Concluída', variant: 'outline' as const, icon: Check }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
        return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
        return 'Data inválida';
    }
  };

  const getStats = () => {
    const total = reservations.length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const approved = reservations.filter(r => r.status === 'approved').length;
    const completed = reservations.filter(r => r.status === 'completed').length;
    
    return { total, pending, approved, completed };
  };

  const exportToExcel = () => {
    if (filteredReservations.length === 0) {
        toast({
            title: 'Nenhuma reserva para exportar',
            description: 'A seleção atual não contém reservas para serem exportadas.',
            variant: 'destructive'
        });
        return;
    }

    const dataToExport = filteredReservations.map(res => ({
      'Aniversariante': res.full_name,
      'CPF': res.cpf,
      'Email': res.email,
      'WhatsApp': res.whatsapp,
      'Data de Nascimento': formatDate(res.birth_date),
      'Data da Visita': formatDate(res.visit_date),
      'Acompanhantes': res.companions,
      'Nomes dos Acompanhantes': Array.isArray(res.companion_names) ? res.companion_names.join(', ') : '',
      'Status': res.status,
      'Data da Reserva': formatDate(res.created_at),
      'Observações': res.notes || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservas de Aniversário');

    worksheet['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, 
      { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 40 },
    ];

    const dateSuffix = visitDate ? format(new Date(visitDate), 'yyyy-MM-dd') : 'geral';
    XLSX.writeFile(workbook, `reservas_aniversariantes_${dateSuffix}.xlsx`);

    toast({
      title: 'Exportação Concluída',
      description: `${dataToExport.length} reservas foram exportadas para o arquivo Excel.`,
    });
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-paradise-blue" />
            Reservas de Aniversariantes
          </h2>
          <p className="text-muted-foreground">Gerencie todas as reservas de aniversário do mês</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Gift className="w-8 h-8 text-paradise-blue" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <Check className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-4 h-4" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovadas</SelectItem>
                  <SelectItem value="rejected">Rejeitadas</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <Label className="text-sm">Data da Visita</Label>
                <Input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={exportToExcel} className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar para Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas ({filteredReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando reservas...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aniversariante</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Data Nasc.</TableHead>
                    <TableHead>Data Visita</TableHead>
                    <TableHead>Acompanhantes</TableHead>
                    <TableHead>Nomes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Reserva</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reservation.full_name}</p>
                          <p className="text-sm text-muted-foreground">CPF: {reservation.cpf}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {reservation.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {reservation.whatsapp}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(reservation.birth_date)}</TableCell>
                      <TableCell>{formatDate(reservation.visit_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {reservation.companions}
                        </div>
                      </TableCell>
                      <TableCell>
                        {reservation.companion_names && Array.isArray(reservation.companion_names) && reservation.companion_names.length > 0 ? (
                          <div className="space-y-1">
                            {(reservation.companion_names as string[]).map((name: string, index: number) => (
                              <div key={index} className="text-sm">
                                {index + 1}. {name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                      <TableCell>{formatDate(reservation.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setEditingNotes(reservation.notes || '');
                            }}
                            title="Ver detalhes"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {reservation.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updateStatus(reservation.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                                title="Aprovar"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateStatus(reservation.id, 'rejected')}
                                title="Rejeitar"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          {reservation.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(reservation.id, 'completed')}
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                              title="Marcar como concluída"
                            >
                              Concluir
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteReservation(reservation.id, reservation.full_name)}
                            title="Deletar reserva"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredReservations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhuma reserva encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {selectedReservation && (
        <Card className="fixed inset-0 z-50 overflow-auto bg-background p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Detalhes da Reserva</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedReservation(null);
                  setEditingNotes('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Dados do Aniversariante</h4>
                  <div className="space-y-2">
                    <p><strong>Nome:</strong> {selectedReservation.full_name}</p>
                    <p><strong>Email:</strong> {selectedReservation.email}</p>
                    <p><strong>CPF:</strong> {selectedReservation.cpf}</p>
                    <p><strong>Data de Nascimento:</strong> {formatDate(selectedReservation.birth_date)}</p>
                    <p><strong>WhatsApp:</strong> {selectedReservation.whatsapp}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Detalhes da Visita</h4>
                  <div className="space-y-2">
                    <p><strong>Data da Visita:</strong> {formatDate(selectedReservation.visit_date)}</p>
                    <p><strong>Acompanhantes:</strong> {selectedReservation.companions}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedReservation.status)}</p>
                    <p><strong>Data da Reserva:</strong> {formatDate(selectedReservation.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Observações
              </h4>
              <Textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Adicione observações sobre esta reserva..."
                rows={4}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button onClick={() => updateNotes(selectedReservation.id)}>
                  Salvar Observações
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedReservation(null);
                    setEditingNotes('');
                  }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BirthdayReservationsManager;
