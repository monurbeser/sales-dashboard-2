import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { formatTLCompact, formatTL, monthFields, months } from '@/lib/formatters';

const targetModeSchema = z.object({
  jan: z.coerce.number().min(0, 'Geçersiz tutar'),
  feb: z.coerce.number().min(0, 'Geçersiz tutar'),
  mar: z.coerce.number().min(0, 'Geçersiz tutar'),
  apr: z.coerce.number().min(0, 'Geçersiz tutar'),
  may: z.coerce.number().min(0, 'Geçersiz tutar'),
  jun: z.coerce.number().min(0, 'Geçersiz tutar'),
  jul: z.coerce.number().min(0, 'Geçersiz tutar'),
  aug: z.coerce.number().min(0, 'Geçersiz tutar'),
  sep: z.coerce.number().min(0, 'Geçersiz tutar'),
  oct: z.coerce.number().min(0, 'Geçersiz tutar'),
  nov: z.coerce.number().min(0, 'Geçersiz tutar'),
  dec: z.coerce.number().min(0, 'Geçersiz tutar'),
  year: z.number()
});

type TargetModalProps = {
  isOpen: boolean;
  onOpenChange: (val: boolean) => void;
  type: 'sales' | 'products';
  manager: { id: string; name: string } | null;
  initialData?: any;
};

export function TargetModal({ isOpen, onOpenChange, type, manager, initialData }: TargetModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof targetModeSchema>>({
    resolver: zodResolver(targetModeSchema),
    defaultValues: {
      year: 2026,
      jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
    }
  });

  useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        year: initialData.year || 2026,
        jan: Number(initialData.jan) || 0,
        feb: Number(initialData.feb) || 0,
        mar: Number(initialData.mar) || 0,
        apr: Number(initialData.apr) || 0,
        may: Number(initialData.may) || 0,
        jun: Number(initialData.jun) || 0,
        jul: Number(initialData.jul) || 0,
        aug: Number(initialData.aug) || 0,
        sep: Number(initialData.sep) || 0,
        oct: Number(initialData.oct) || 0,
        nov: Number(initialData.nov) || 0,
        dec: Number(initialData.dec) || 0,
      });
    } else if (isOpen) {
      form.reset({
        year: 2026, jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      });
    }
  }, [isOpen, initialData, form]);

  const vals = useWatch({ control: form.control });
  const totalAmount = monthFields.reduce((acc, field) => acc + (Number(vals[field]) || 0), 0);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof targetModeSchema>) => {
      if (!manager) return;
      const res = await fetch(`/api/targets/${type}/${manager.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Hata oluştu');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type === 'sales' ? 'salesTargets' : 'productTargets'] });
      toast.success('Hedefler başarıyla kaydedildi');
      onOpenChange(false);
    },
    onError: () => toast.error('Hedefler kaydedilirken bir hata oluştu'),
  });

  const onSubmit = (values: z.infer<typeof targetModeSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{manager?.name} — 2026 Yıllık Hedef Planı</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {monthFields.map((field, idx) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field}
                  render={({ field: formField }) => (
                    <FormItem className="space-y-1">
                      <div className="text-sm font-medium text-slate-500 mb-2">{months[idx]}</div>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₺</span>
                          <Input 
                            type="number" 
                            className="pl-7 font-mono text-right" 
                            {...formField} 
                            onChange={e => formField.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-sm font-medium text-blue-800">Yıllık Toplam Hedef:</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-blue-900 tracking-tight">
                {formatTL(totalAmount)}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
              <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-8">
                Kaydet
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
