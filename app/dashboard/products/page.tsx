'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target, TrendingUp, FileText, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatTL, formatTLCompact, formatPercent } from '@/lib/formatters';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 font-medium">{entry.name}:</span>
            <span className="font-mono text-slate-900">{formatTL(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProductsDashboard() {
  const [selectedManager, setSelectedManager] = useState<string>('');

  const { data: managers = [] } = useQuery({
    queryKey: ['productManagers'],
    queryFn: async () => {
      const res = await fetch('/api/product-managers');
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && !selectedManager) setSelectedManager(data[0].id);
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['productAnalytics', selectedManager],
    queryFn: async () => {
      if (!selectedManager) return null;
      const res = await fetch(`/api/analytics/products/${selectedManager}?year=2026`);
      if (!res.ok) throw new Error('Network err');
      return res.json();
    },
    enabled: !!selectedManager
  });

  if (managers.length === 0) {
    return <div className="flex h-[50vh] items-center justify-center text-slate-500">Kayıtlı ürün yöneticisi bulunmuyor.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kişisel Dashboard (Ürün)</h1>
          <p className="text-muted-foreground">Ürün yöneticisi bazlı hedef ve gerçekleşmeler.</p>
        </div>

        <div className="w-64">
          <Select value={selectedManager} onValueChange={setSelectedManager}>
            <SelectTrigger className="bg-white shadow-sm font-semibold">
              <SelectValue placeholder="Yönetici Seçin" />
            </SelectTrigger>
            <SelectContent>
              {managers.map((m: any) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center text-slate-500">Yükleniyor...</div>
      ) : !analytics ? null : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Kişisel Hedef</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-slate-900">{formatTL(analytics.totalTarget)}</div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-emerald-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Kapsam İçi Tutar</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-slate-900">{formatTL(analytics.totalActual)}</div>
              </CardContent>
            </Card>

            <Card className={`border-l-4 shadow-sm ${analytics.totalTarget > 0 && (analytics.totalActual / analytics.totalTarget) >= 1 ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Gerçekleşme %</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {analytics.totalTarget > 0 ? formatPercent(analytics.totalActual / analytics.totalTarget) : '%0'}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">İlgili Fatura</CardTitle>
                <FileText className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-slate-900">{analytics.totalCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
            <Card className="lg:col-span-3 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Aylık Ürün Hedefi vs Gerçekleşme (₺)</CardTitle>
              </CardHeader>
              <CardContent className="h-[380px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analytics.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                    <YAxis tickFormatter={(val) => formatTLCompact(val)} axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="hedef" name="Kişisel Hedef" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="gerceklesme" name="Kapsam Tutar" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Çeyrek Performansı</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {analytics.quarters.map((q: any) => (
                  <div key={q.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-700">{q.name}</span>
                      <span className={`text-xs font-bold ${q.percent >= 100 ? 'text-emerald-600' : q.percent >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                        {formatPercent(q.percent / 100)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${q.percent >= 100 ? 'bg-emerald-500' : q.percent >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(q.percent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-mono text-slate-500">
                      <span>H: {formatTLCompact(q.target)}</span>
                      <span>G: {formatTLCompact(q.actual)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Fatura Geçmişi (Ürün Kapsamında)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>İlgili Satış Yöneticisi</TableHead>
                    <TableHead className="text-right">Tutar (₺)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topInvoices.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-slate-600">
                        {new Date(inv.invoiceDate).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell className="font-medium">{inv.description}</TableCell>
                      <TableCell>{inv.salesManager?.name || '-'}</TableCell>
                      <TableCell className="text-right font-mono font-medium text-slate-900">
                        {formatTL(inv.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {analytics.topInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 h-24">Satış bulunmuyor.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
