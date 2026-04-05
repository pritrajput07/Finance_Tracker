import { prisma } from "./prisma";
import { cookies } from 'next/headers';
import { decrypt } from './session';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) return null;

  const payload = await decrypt(sessionCookie.value);
  if (!payload || !payload.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });
    return user;
  } catch(e) {
    return null;
  }
}
