import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StateAnalytics {
  state: string;
  visits: number;
  percentage: number;
}

interface AnalyticsData {
  totalVisits: number;
  stateData: StateAnalytics[];
  recentVisits: any[];
}

export const VisitorAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisits: 0,
    stateData: [],
    recentVisits: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get total visits
      const { count: totalVisits } = await supabase
        .from('visitor_analytics')
        .select('*', { count: 'exact', head: true });

      // Get state analytics
      const { data: stateVisits } = await supabase
        .from('visitor_analytics')
        .select('state')
        .not('state', 'is', null);

      // Count visits by state
      const stateCounts: { [key: string]: number } = {};
      stateVisits?.forEach(visit => {
        if (visit.state) {
          stateCounts[visit.state] = (stateCounts[visit.state] || 0) + 1;
        }
      });

      // Convert to array and calculate percentages
      const stateData = Object.entries(stateCounts)
        .map(([state, visits]) => ({
          state,
          visits,
          percentage: totalVisits ? Math.round((visits / totalVisits) * 100) : 0
        }))
        .sort((a, b) => b.visits - a.visits);

      // Get recent visits
      const { data: recentVisits } = await supabase
        .from('visitor_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setAnalytics({
        totalVisits: totalVisits || 0,
        stateData,
        recentVisits: recentVisits || []
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Carregando analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Visitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{analytics.totalVisits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estados Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{analytics.stateData.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado Mais Acessado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-primary">
              {analytics.stateData[0]?.state || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">
              {analytics.stateData[0]?.visits || 0} visitas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitas por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.stateData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="state" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visits" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ranking de Estados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.stateData.slice(0, 10).map((item, index) => (
              <div key={item.state} className="flex justify-between items-center p-2 border-b">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-primary">#{index + 1}</span>
                  <span>{item.state}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{item.visits} visitas</span>
                  <span className="text-sm text-muted-foreground">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.recentVisits.map((visit, index) => (
              <div key={visit.id} className="flex justify-between items-center p-2 border-b text-sm">
                <div>
                  <span className="font-medium">{visit.state || 'Estado não identificado'}</span>
                  {visit.city && <span className="text-muted-foreground"> - {visit.city}</span>}
                </div>
                <div className="text-muted-foreground">
                  {new Date(visit.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};