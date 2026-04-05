import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';

    const now = new Date();
    let startDate;

    switch (range) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        const tempDate = new Date(now);
        const day = tempDate.getDay();
        const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1); 
        startDate = new Date(tempDate.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 1. Total Balance (Lifetime)
    const allIncome = await prisma.transaction.aggregate({
      where: { userId: user.id, type: 'income' },
      _sum: { amount: true }
    });
    
    const allExpense = await prisma.transaction.aggregate({
      where: { userId: user.id, type: 'expense' },
      _sum: { amount: true }
    });

    const totalBalance = (allIncome._sum.amount || 0) - (allExpense._sum.amount || 0);

    // 2. Period Earnings & Spending
    const periodIncome = await prisma.transaction.aggregate({
      where: { userId: user.id, type: 'income', date: { gte: startDate } },
      _sum: { amount: true }
    });

    const periodExpense = await prisma.transaction.aggregate({
      where: { userId: user.id, type: 'expense', date: { gte: startDate } },
      _sum: { amount: true }
    });

    // 3. Momentum Data (Dynamic based on range)
    const momentumData = [];
    if (range === 'year') {
      // Show last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startD = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endD = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const inc = await prisma.transaction.aggregate({
          where: { userId: user.id, type: 'income', date: { gte: startD, lte: endD } },
          _sum: { amount: true }
        });
        const exp = await prisma.transaction.aggregate({
          where: { userId: user.id, type: 'expense', date: { gte: startD, lte: endD } },
          _sum: { amount: true }
        });
        momentumData.push({
          name: d.toLocaleString('en-US', { month: 'short' }),
          value: (inc._sum.amount || 0) - (exp._sum.amount || 0)
        });
      }
    } else if (range === 'month' || range === 'week') {
      // Show last 7-30 days
      const days = range === 'month' ? 30 : 7;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const inc = await prisma.transaction.aggregate({
          where: { userId: user.id, type: 'income', date: { gte: d, lt: nextD } },
          _sum: { amount: true }
        });
        const exp = await prisma.transaction.aggregate({
          where: { userId: user.id, type: 'expense', date: { gte: d, lt: nextD } },
          _sum: { amount: true }
        });
        momentumData.push({
          name: d.toLocaleString('en-US', { day: '2-digit', month: 'short' }),
          value: (inc._sum.amount || 0) - (exp._sum.amount || 0)
        });
      }
    } else {
      // day: Show hourly or just a single point? Let's show last 7 days for 'day' to keep chart useful, or just current day.
      // Actually, let's just default to last 30 days if it's 'day' for momentum chart.
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const inc = await prisma.transaction.aggregate({
          where: { userId: user.id, type: 'income', date: { gte: d, lt: nextD } },
          _sum: { amount: true }
        });
        const exp = await prisma.transaction.aggregate({
          where: { userId: user.id, type: 'expense', date: { gte: d, lt: nextD } },
          _sum: { amount: true }
        });
        momentumData.push({
          name: d.toLocaleString('en-US', { day: '2-digit', month: 'short' }),
          value: (inc._sum.amount || 0) - (exp._sum.amount || 0)
        });
      }
    }

    // 4. Recent Transactions (filtered by period if selected, or just last 4)
    const recentTransactions = await prisma.transaction.findMany({
      where: { 
        userId: user.id,
        ...(range !== 'all' ? { date: { gte: startDate } } : {})
      },
      orderBy: { date: 'desc' },
      take: 5,
      include: { category: true }
    });

    return NextResponse.json({
        totalBalance,
        periodIncome: periodIncome._sum.amount || 0,
        periodExpense: periodExpense._sum.amount || 0,
        momentumData,
        recentTransactions: recentTransactions.map(t => ({
          id: t.id,
          name: t.description,
          category: t.category?.name || 'Uncategorized',
          amount: t.type === 'income' ? `+₹${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-₹${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          time: new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
          type: t.type
        }))
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

