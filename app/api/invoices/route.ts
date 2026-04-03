import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const invoiceSchema = z.object({
  description: z.string().min(2, 'Açıklama giriniz'),
  amount: z.number().positive('Tutar 0 dan büyük olmalıdır'),
  invoiceDate: z.string().datetime() || z.date(),
  salesManagerId: z.string().min(1, 'Satış Yöneticisi seçiniz'),
  productManagerId: z.string().min(1, 'Ürün Yöneticisi seçiniz'),
});

export async function GET(request: Request) {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { invoiceDate: 'desc' },
      include: {
        salesManager: true,
        productManager: true,
      }
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Faturalar alınamadı' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    body.amount = parseFloat(body.amount);
    
    // Convert date to ISO if it isn't
    if (body.invoiceDate && !body.invoiceDate.includes('T')) {
      body.invoiceDate = new Date(body.invoiceDate).toISOString();
    }

    const data = invoiceSchema.parse(body);

    const newInvoice = await prisma.invoice.create({
      data: {
        description: data.description,
        amount: data.amount,
        invoiceDate: new Date(data.invoiceDate),
        salesManagerId: data.salesManagerId,
        productManagerId: data.productManagerId,
      },
      include: {
        salesManager: true,
        productManager: true,
      }
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Fatura eklenemedi' }, { status: 500 });
  }
}
