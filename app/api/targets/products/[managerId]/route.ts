import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const targetSchema = z.object({
  year: z.number().default(2026),
  jan: z.number().default(0),
  feb: z.number().default(0),
  mar: z.number().default(0),
  apr: z.number().default(0),
  may: z.number().default(0),
  jun: z.number().default(0),
  jul: z.number().default(0),
  aug: z.number().default(0),
  sep: z.number().default(0),
  oct: z.number().default(0),
  nov: z.number().default(0),
  dec: z.number().default(0),
});

export async function PUT(request: Request, { params }: { params: { managerId: string } }) {
  try {
    const body = await request.json();
    const data = targetSchema.parse(body);

    const upserted = await prisma.productTarget.upsert({
      where: {
        productManagerId_year: {
          productManagerId: params.managerId,
          year: data.year,
        }
      },
      update: {
        jan: data.jan, feb: data.feb, mar: data.mar, apr: data.apr,
        may: data.may, jun: data.jun, jul: data.jul, aug: data.aug,
        sep: data.sep, oct: data.oct, nov: data.nov, dec: data.dec,
      },
      create: {
        productManagerId: params.managerId,
        year: data.year,
        jan: data.jan, feb: data.feb, mar: data.mar, apr: data.apr,
        may: data.may, jun: data.jun, jul: data.jul, aug: data.aug,
        sep: data.sep, oct: data.oct, nov: data.nov, dec: data.dec,
      }
    });

    return NextResponse.json(upserted);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Hedef güncellenemedi' }, { status: 500 });
  }
}
