'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatTL } from '@/lib/formatters';
import { InvoiceModal } from '@/components/invoices/InvoiceModal';
import { Input } from '@/components/ui/input';

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('Network error');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Hata oluştu');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura silindi');
    },
    onError: () => toast.error('Silinirken bir hata oluştu'),
  });

  const handleDelete = (id: string, desc: string) => {
    if (confirm(`"${desc}" açıklamaı faturayı silmek istediğinize emin misiniz?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredInvoices = invoices.filter((inv: any) => 
    inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.salesManager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.productManager.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredInvoices.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fatura Yönetimi</h1>
          <p className="text-muted-foreground">Tüm kesilen faturalar ve yöneticilerle ilişkileri.</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Fatura Girişi
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-6">
        <Input 
          placeholder="Açıklama veya Yönetici Ara..." 
          className="max-w-md bg-white border-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm">
          <div className="flex flex-col">
            <span className="text-slate-500 text-xs">Toplam Fatura</span>
            <span className="font-semibold text-slate-800">{filteredInvoices.length} Adet</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-xs">Toplam Tutar</span>
            <span className="font-semibold text-blue-700">{formatTL(totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Satış Yöneticisi</TableHead>
              <TableHead>Ürün Yöneticisi</TableHead>
              <TableHead className="text-right">Tutar (₺)</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Yükleniyor...</TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Receipt className="h-10 w-10 text-slate-300" />
                    <p>Gösterilecek fatura bulunamadı.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-slate-600">
                    {new Date(inv.invoiceDate).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell className="font-medium">{inv.description}</TableCell>
                  <TableCell>{inv.salesManager?.name}</TableCell>
                  <TableCell>{inv.productManager?.name}</TableCell>
                  <TableCell className="text-right font-mono font-medium text-slate-900">
                    {formatTL(inv.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id, inv.description)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InvoiceModal 
        isOpen={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </div>
  );
}
