import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    // Get all budgets for the user
    const budgets = await prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: true }
    });

    // Get all expenses for the selected timeframe
    const expenses = await prisma.transaction.findMany({
      where: { 
        userId: user.id, 
        type: 'expense', 
        date: { gte: startDate }
      }
    });

    let totalBudget = 0;
    let totalSpent = 0;
    
    // Group expenses by category mapped in budget
    const categoryAllocations = budgets.map(budget => {
      // In year view, maybe should show monthly average or total? Usually total for that timeframe.
      totalBudget += budget.amountLimit;
      
      const spent = expenses
        .filter(e => e.categoryId === budget.categoryId)
        .reduce((sum, current) => sum + current.amount, 0);
        
      totalSpent += spent;

      return {
        id: budget.id,
        name: budget.category.name,
        color: budget.category.color,
        spent,
        total: budget.amountLimit
      };
    });

    return NextResponse.json({
        totalBudget,
        totalSpent,
        remaining: totalBudget - totalSpent,
        categoryAllocations
    });

  } catch (error) {
    console.error("Budgets GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { categoryId, amountLimit } = await request.json();

    if (!categoryId || !amountLimit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find existing budget for this category
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        categoryId: categoryId
      }
    });

    let budget;
    if (existingBudget) {
      budget = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { amountLimit: parseFloat(amountLimit) }
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: categoryId,
          amountLimit: parseFloat(amountLimit)
        }
      });
    }

    return NextResponse.json(budget);


  } catch (error) {
    console.error("Budgets POST Error:", error);
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
      return NextResponse.json({ error: "Missing budget ID" }, { status: 400 });
    }

    const budget = await prisma.budget.findUnique({
      where: { id }
    });

    if (!budget || budget.userId !== user.id) {
      return NextResponse.json({ error: "Budget not found or unauthorized" }, { status: 404 });
    }

    await prisma.budget.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Budgets DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


