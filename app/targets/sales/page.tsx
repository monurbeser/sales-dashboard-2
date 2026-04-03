'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatTL, monthFields } from '@/lib/formatters';
import { TargetModal } from '@/components/targets/TargetModal';

export default function SalesTargetsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<any>(null);

  const { data: targetsData = [], isLoading } = useQuery({
    queryKey: ['salesTargets'],
    queryFn: async () => {
      const res = await fetch('/api/targets/sales?year=2026');
      if (!res.ok) throw new Error('Network error');
      return res.json();
    },
  });

  const handleEdit = (manager: any, target: any) => {
    setSelectedManager({ manager, target });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Satış Hedefleri (2026)</h1>
          <p className="text-muted-foreground">Satış yöneticileri için yıllık ve aylık hedef dağılımı.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Yönetici Adı</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">Yıllık Toplam Hedef (₺)</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Yükleniyor...</TableCell>
              </TableRow>
            ) : targetsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Target className="h-10 w-10 text-slate-300" />
                    <p>Satış yöneticisi bulunmuyor.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              targetsData.map((row: any) => {
                const total = row.hasTarget ? monthFields.reduce((acc, field) => acc + Number(row.target[field] || 0), 0) : 0;
                
                return (
                  <TableRow key={row.manager.id}>
                    <TableCell className="font-semibold">{row.manager.name}</TableCell>
                    <TableCell>
                      {row.hasTarget ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200 font-medium">Hedef Girildi</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Eksik</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-slate-700">
                      {row.hasTarget ? formatTL(total) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(row.manager, row.target)} className="h-8">
                        {row.hasTarget ? 'Düzenle' : <><Plus className="mr-1 h-3 w-3" /> Hedef Gir</>}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TargetModal 
        isOpen={modalOpen} 
        onOpenChange={setModalOpen} 
        type="sales"
        manager={selectedManager?.manager || null}
        initialData={selectedManager?.target}
      />
    </div>
  );
}
