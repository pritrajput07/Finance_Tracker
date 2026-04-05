import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const insights = await prisma.insight.findMany({
      where: { userId: user.id },
      orderBy: { calculatedAt: 'desc' }
    });

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Insights GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
