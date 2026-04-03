import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { monthFields, months } from '@/lib/formatters';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || '2026', 10);

  try {
    // 1. All Sales Targets
    const salesTargets = await prisma.salesTarget.findMany({
      where: { year },
      include: { salesManager: true }
    });

    // 2. All Invoices in this year
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: { gte: startOfYear, lte: endOfYear }
      },
      include: {
        salesManager: true,
      },
      orderBy: { invoiceDate: 'asc' }
    });

    // Calculations
    let totalTarget = 0;
    const monthlyData = months.map((m, idx) => ({ name: m, hedef: 0, gerceklesme: 0 }));
    
    // Process targets
    salesTargets.forEach(t => {
      monthFields.forEach((field, i) => {
        const val = Number(t[field]) || 0;
        totalTarget += val;
        monthlyData[i].hedef += val;
      });
    });

    // Process actuals
    let totalActual = 0;
    invoices.forEach(inv => {
      const amount = Number(inv.amount) || 0;
      totalActual += amount;
      const monthIdx = inv.invoiceDate.getMonth();
      monthlyData[monthIdx].gerceklesme += amount;
    });

    // Leaderboard
    const managerStats: Record<string, { id: string, name: string, target: number, actual: number }> = {};
    
    salesTargets.forEach(t => {
      if (!managerStats[t.salesManagerId]) {
        managerStats[t.salesManagerId] = {
          id: t.salesManagerId,
          name: t.salesManager?.name || '',
          target: 0,
          actual: 0
        };
      }
      managerStats[t.salesManagerId].target += monthFields.reduce((sum, f) => sum + Number(t[f]), 0);
    });

    invoices.forEach(inv => {
      if (inv.salesManagerId) {
        if (!managerStats[inv.salesManagerId]) {
          managerStats[inv.salesManagerId] = {
            id: inv.salesManagerId,
            name: inv.salesManager?.name || 'Bilinmeyen',
            target: 0,
            actual: 0
          };
        }
        managerStats[inv.salesManagerId].actual += Number(inv.amount);
      }
    });

    const leaderboard = Object.values(managerStats)
      .map(m => ({
        ...m,
        percent: m.target > 0 ? (m.actual / m.target) * 100 : 0
      }))
      .sort((a, b) => b.percent - a.percent);

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

    // Top 5 invoices
    const topInvoices = [...invoices].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

    return NextResponse.json({
      totalTarget,
      totalActual,
      totalCount: invoices.length,
      monthlyData,
      quarters: quarters.map(q => ({ ...q, percent: q.target > 0 ? (q.actual / q.target) * 100 : 0 })),
      leaderboard,
      topInvoices
    });

  } catch (error) {
    return NextResponse.json({ error: 'Data error' }, { status: 500 });
  }
}
