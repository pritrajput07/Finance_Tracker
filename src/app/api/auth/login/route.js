import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/session';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // In production you would use bcrypt.compare(password, user.passwordHash)
    if (!user || user.passwordHash !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    await createSession(user.id);
    
    return NextResponse.json({ success: true, user: { name: user.name, email: user.email } }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
    await deleteSession();
    return NextResponse.json({ success: true });
}
