import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    user: {
      name: user.name,
      email: user.email,
      preferences: JSON.parse(user.preferences || '{}')
    }
  });
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, email, preferences } = await request.json();
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (preferences) updateData.preferences = JSON.stringify(preferences);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        preferences: JSON.parse(updatedUser.preferences || '{}')
      }
    });
  } catch (error) {
     console.error(error);
     return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
