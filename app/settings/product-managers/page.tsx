'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, Edit2, Plus, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const schema = z.object({
  name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır.'),
});

type Manager = {
  id: string;
  name: string;
  createdAt: string;
};

export default function ProductManagersPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  const { data: managers = [], isLoading } = useQuery<Manager[]>({
    queryKey: ['productManagers'],
    queryFn: async () => {
      const res = await fetch('/api/product-managers');
      if (!res.ok) throw new Error('Network error');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (val: z.infer<typeof schema>) => {
      const res = await fetch('/api/product-managers', {
        method: 'POST',
        body: JSON.stringify(val),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Hata oluştu');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productManagers'] });
      toast.success('Ürün Yöneticisi eklendi');
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => toast.error('Eklenirken bir hata oluştu'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof schema> }) => {
      const res = await fetch(`/api/product-managers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Hata oluştu');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productManagers'] });
      toast.success('Ürün Yöneticisi güncellendi');
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: () => toast.error('Güncellenirken bir hata oluştu'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/product-managers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Hata oluştu');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productManagers'] });
      toast.success('Ürün Yöneticisi silindi');
    },
    onError: () => toast.error('Silinirken bir hata oluştu. Faturaları veya hedefleri olabilir.'),
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (m: Manager) => {
    setEditingId(m.id);
    form.setValue('name', m.name);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`${name} isimli yöneticiyi silmek istediğinize emin misiniz?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ürün Yöneticileri</h1>
          <p className="text-muted-foreground">Organizasyondaki ürün yöneticilerini tanımlayın.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(val) => {
          setIsDialogOpen(val);
          if (!val) {
            setEditingId(null);
            form.reset({ name: '' });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ürün Yöneticisi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Yöneticiyi Düzenle' : 'Yeni Ürün Yöneticisi Ekle'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Soyad</FormLabel>
                      <FormControl>
                        <Input placeholder="Örn: Zeynep Arslan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-blue-600 text-white hover:bg-blue-700">
                    {editingId ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[80px]">No</TableHead>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Yükleniyor...</TableCell>
              </TableRow>
            ) : managers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Briefcase className="h-10 w-10 text-slate-300" />
                    <p>Henüz ürün yöneticisi bulunmuyor.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              managers.map((m, idx) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-slate-500">{idx + 1}</TableCell>
                  <TableCell className="font-semibold">{m.name}</TableCell>
                  <TableCell>{new Date(m.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}>
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id, m.name)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
