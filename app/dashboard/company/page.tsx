'use client';

import { useQuery } from '@tanstack/react-query';
import { Target, TrendingUp, FileText, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, LineChart, Line, ComposedChart } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export default function CompanyDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['companyAnalytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/company?year=2026');
      if (!res.ok) throw new Error('Network err');
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="flex h-[80vh] items-center justify-center text-slate-500">Dashboard yükleniyor...</div>;
  }

  if (!analytics) return null;

  const overallPercent = analytics.totalTarget > 0 ? (analytics.totalActual / analytics.totalTarget) * 100 : 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Genel Dashboard</h1>
        <p className="text-muted-foreground">Şirket geneli satış hedefleri ve konsolide fatura gerçekleşmeleri (2026).</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Yıllık Toplam Hedef</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-900">{formatTL(analytics.totalTarget)}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Yıllık Gerçekleşme</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-900">{formatTL(analytics.totalActual)}</div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-sm ${overallPercent >= 100 ? 'border-l-emerald-500' : overallPercent >= 80 ? 'border-l-amber-500' : 'border-l-red-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Gerçekleşme Oranı</CardTitle>
            <CheckCircle2 className={`h-4 w-4 ${overallPercent >= 100 ? 'text-emerald-500' : overallPercent >= 80 ? 'text-amber-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-900">{formatPercent(overallPercent * 100)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Toplam Fatura Sayısı</CardTitle>
            <FileText className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-900">{analytics.totalCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        {/* Main Bar Chart */}
        <Card className="lg:col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Aylık Hedef vs Gerçekleşme (₺)</CardTitle>
            <CardDescription>Ocak - Aralık 2026 değerleri ve karşılaştırması</CardDescription>
          </CardHeader>
          <CardContent className="h-[380px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <YAxis tickFormatter={(val) => formatTLCompact(val)} axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="hedef" name="Aylık Hedef" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="gerceklesme" name="Gerçekleşme" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quarters Card */}
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
                    {formatPercent(q.percent * 100)}
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

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Satış Yöneticisi Liderlik Tablosu</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Yönetici</TableHead>
                  <TableHead className="text-right">Oran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.leaderboard.slice(0, 5).map((l: any, idx: number) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium text-slate-500">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {formatTLCompact(l.actual)} / {formatTLCompact(l.target)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`font-bold ${l.percent >= 100 ? 'text-emerald-600' : l.percent >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                        {formatPercent(l.percent * 100)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Son Büyük Faturalar</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Müşteri Yöneticisi</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topInvoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium max-w-[120px] truncate">{inv.description}</TableCell>
                    <TableCell className="text-sm text-slate-600">{inv.salesManager.name}</TableCell>
                    <TableCell className="text-right font-mono font-medium text-slate-900">
                      {formatTLCompact(inv.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
