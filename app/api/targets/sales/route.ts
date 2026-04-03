import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearStr = searchParams.get('year') || '2026';
  const year = parseInt(yearStr, 10);

  try {
    const targets = await prisma.salesTarget.findMany({
      where: { year },
      include: {
        salesManager: true,
      },
    });
    
    const managers = await prisma.salesManager.findMany({
      orderBy: { name: 'asc'}
    });
    
    // Merge targets with managers to show those without targets
    const merged = managers.map(manager => {
      const target = targets.find(t => t.salesManagerId === manager.id);
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
