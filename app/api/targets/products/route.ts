import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearStr = searchParams.get('year') || '2026';
  const year = parseInt(yearStr, 10);

  try {
    const targets = await prisma.productTarget.findMany({
      where: { year },
    });
    
    const managers = await prisma.productManager.findMany({
      orderBy: { name: 'asc'}
    });
    
    const merged = managers.map(manager => {
      const target = targets.find(t => t.productManagerId === manager.id);
      return {
        manager,
        target: target || null,
        hasTarget: !!target
      };
    });

    return NextResponse.json(merged);
  } catch (error) {
    return NextResponse.json({ error: 'Hedefler alınamadı' }, { status: 500 });
  }
}
