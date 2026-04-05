import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  description: z.string().min(1).max(255),
  categoryId: z.string().optional().nullable(),
  date: z.string().optional().transform(val => val ? new Date(val) : new Date())
});

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const take = parseInt(searchParams.get('take') || '10', 10);
    const cursor = searchParams.get('cursor');
    const range = searchParams.get('range') || 'all';

    const now = new Date();
    let startDate;

    if (range !== 'all') {
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
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        description: { contains: search },
        ...(startDate ? { date: { gte: startDate } } : {})
      },
      orderBy: { date: 'desc' },
      take: take + 1, // Fetch one extra to check if there is a next page
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: { category: true }
    });

    let nextCursor = null;
    if (transactions.length > take) {
      const nextItem = transactions.pop();
      nextCursor = nextItem.id;
    }

    return NextResponse.json({
      transactions: transactions.map(t => ({
        id: t.id,
        name: t.description,
        category: t.category?.name || 'Uncategorized',
        amount: t.type === 'income' ? `+₹${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-₹${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        time: new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
        type: t.type
      })),
      nextCursor
    });

  } catch (error) {
    console.error("Transactions GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const result = transactionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", details: result.error.errors }, { status: 400 });
    }

    const { amount, type, description, categoryId, date } = result.data;

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        type,
        description,
        categoryId,
        date
      }
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Transactions POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction || transaction.userId !== user.id) {
      return NextResponse.json({ error: "Transaction not found or unauthorized" }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Transactions DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

