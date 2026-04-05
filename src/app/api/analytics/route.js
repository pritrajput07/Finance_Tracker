import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { startOfMonth, endOfMonth, subWeeks, format, startOfWeek, endOfWeek } from 'date-fns';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: 'expense'
      },
      include: {
        category: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // 1. Spending Trends (Last 4 weeks)
    const trends = [];
    for (let i = 3; i >= 0; i--) {
      const s = startOfWeek(subWeeks(new Date(), i));
      const e = endOfWeek(s);
      const weekSum = transactions
        .filter(t => t.date >= s && t.date <= e)
        .reduce((sum, t) => sum + t.amount, 0);
      
      trends.push({
        name: `Week ${4 - i}`,
        value: weekSum
      });
    }

    // 2. Allocation
    const allocationMap = {};
    let totalExpense = 0;
    transactions.forEach(t => {
      const catName = t.category?.name || 'Uncategorized';
      allocationMap[catName] = (allocationMap[catName] || 0) + t.amount;
      totalExpense += t.amount;
    });

    const allocation = Object.entries(allocationMap).map(([name, value]) => ({
      name,
      value: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
      color: transactions.find(t => t.category?.name === name)?.category?.color || '#464555'
    }));

    // 3. Dynamic Insights & Forecast
    const insights = await prisma.insight.findMany({
      where: { userId: user.id },
      take: 3
    });

    const forecast = {
      title: "Financial Forecast",
      message: `Based on your current trajectory, your projected monthly expense is ₹${totalExpense.toFixed(2)}. Maintain your current allocation for maximum efficiency.`
    };

    return NextResponse.json({
      trends,
      allocation,
      insights,
      forecast
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
