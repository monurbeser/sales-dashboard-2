import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { monthFields, months } from '@/lib/formatters';

export async function GET(request: Request, { params }: { params: { managerId: string } }) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || '2026', 10);
  const { managerId } = params;

  try {
    const manager = await prisma.productManager.findUnique({ where: { id: managerId } });
    if (!manager) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const target = await prisma.productTarget.findFirst({
      where: { productManagerId: managerId, year }
    });

    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
    const invoices = await prisma.invoice.findMany({
      where: {
        productManagerId: managerId,
        invoiceDate: { gte: startOfYear, lte: endOfYear }
      },
      include: { salesManager: true },
      orderBy: { invoiceDate: 'desc' }
    });

    let totalTarget = 0;
    const monthlyData = months.map((m, idx) => ({ name: m, hedef: 0, gerceklesme: 0 }));

    if (target) {
      monthFields.forEach((field, i) => {
        const val = Number(target[field]) || 0;
        totalTarget += val;
        monthlyData[i].hedef = val;
      });
    }

    let totalActual = 0;
    invoices.forEach(inv => {
      const amount = Number(inv.amount) || 0;
      totalActual += amount;
      const monthIdx = inv.invoiceDate.getMonth();
      monthlyData[monthIdx].gerceklesme += amount;
    });

    // Q1-Q4 logic
    const quarters = [
        { name: '1. Çeyrek', target: 0, actual: 0 },
        { name: '2. Çeyrek', target: 0, actual: 0 },
        { name: '3. Çeyrek', target: 0, actual: 0 },
        { name: '4. Çeyrek', target: 0, actual: 0 },
    ];
  
    monthlyData.forEach((m, idx) => {
      const qIdx = Math.floor(idx / 3);
      quarters[qIdx].target += m.hedef;
      quarters[qIdx].actual += m.gerceklesme;
    });

    return NextResponse.json({
      manager,
      totalTarget,
      totalActual,
      totalCount: invoices.length,
      monthlyData,
      quarters: quarters.map(q => ({ ...q, percent: q.target > 0 ? (q.actual / q.target) * 100 : 0 })),
      topInvoices: invoices.slice(0, 10)
    });

  } catch (error) {
    return NextResponse.json({ error: 'Data error' }, { status: 500 });
  }
}
