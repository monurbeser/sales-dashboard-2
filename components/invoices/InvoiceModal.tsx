import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const invoiceSchema = z.object({
  description: z.string().min(2, 'Açıklama giriniz'),
  amount: z.coerce.number().positive('Tutar 0 dan büyük olmalıdır'),
  invoiceDate: z.string().min(1, 'Tarih seçiniz'),
  salesManagerId: z.string().min(1, 'Satış Yöneticisi seçiniz'),
  productManagerId: z.string().min(1, 'Ürün Yöneticisi seçiniz'),
});

type InvoiceModalProps = {
  isOpen: boolean;
  onOpenChange: (val: boolean) => void;
};

export function InvoiceModal({ isOpen, onOpenChange }: InvoiceModalProps) {
  const queryClient = useQueryClient();

  const { data: salesManagers = [] } = useQuery({
    queryKey: ['salesManagers'],
    queryFn: async () => {
      const res = await fetch('/api/sales-managers');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: productManagers = [] } = useQuery({
    queryKey: ['productManagers'],
    queryFn: async () => {
      const res = await fetch('/api/product-managers');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      description: '',
      amount: 0,
      invoiceDate: new Date().toISOString().split('T')[0],
      salesManagerId: '',
      productManagerId: '',
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof invoiceSchema>) => {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Hata oluştu');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura başarıyla eklendi');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('Fatura eklenirken bir hata oluştu'),
  });

  const onSubmit = (values: z.infer<typeof invoiceSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) form.reset();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Fatura Ekle</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
               <FormItem>
                 <FormLabel>Fatura Açıklaması</FormLabel>
                 <FormControl><Input placeholder="Örn: Lisans Bedeli" {...field} /></FormControl>
                 <FormMessage />
               </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salesManagerId"
              render={({ field }) => (
               <FormItem>
                 <FormLabel>Satış Yöneticisi</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                   <FormControl>
                     <SelectTrigger>
                       <SelectValue placeholder="Seçiniz..." />
                     </SelectTrigger>
                   </FormControl>
                   <SelectContent>
                     {Array.isArray(salesManagers) && salesManagers.map((m: any) => (
                       <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 <FormMessage />
               </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productManagerId"
              render={({ field }) => (
               <FormItem>
                 <FormLabel>Ürün Yöneticisi</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                   <FormControl>
                     <SelectTrigger>
                       <SelectValue placeholder="Seçiniz..." />
                     </SelectTrigger>
                   </FormControl>
                   <SelectContent>
                     {Array.isArray(productManagers) && productManagers.map((m: any) => (
                       <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 <FormMessage />
               </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                 <FormItem>
                   <FormLabel>Tutar (₺)</FormLabel>
                   <FormControl><Input type="number" {...field} /></FormControl>
                   <FormMessage />
                 </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                 <FormItem>
                   <FormLabel>Fatura Tarihi</FormLabel>
                   <FormControl><Input type="date" {...field} /></FormControl>
                   <FormMessage />
                 </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
              <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 text-white hover:bg-blue-700">
                Kaydet
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
