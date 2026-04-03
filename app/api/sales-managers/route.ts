import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır.'),
});

export async function GET() {
  try {
    const managers = await prisma.salesManager.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(managers);
  } catch (error) {
    return NextResponse.json({ error: 'Satış yöneticileri alınamadı.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const newManager = await prisma.salesManager.create({
      data: { name: data.name },
    });

    return NextResponse.json(newManager, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Satış yöneticisi eklenemedi.' }, { status: 500 });
  }
}
