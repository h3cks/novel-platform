import prisma from '../prisma/client';

export async function getProfileById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      emailConfirmed: true,
      createdAt: true,
    },
  });
  return user ?? null;
}

export async function updateProfile(userId: number, data: { displayName?: string | null; avatarUrl?: string | null }) {
  const toUpdate: any = {};
  if (typeof data.displayName !== 'undefined') toUpdate.displayName = data.displayName;
  if (typeof data.avatarUrl !== 'undefined') toUpdate.avatarUrl = data.avatarUrl;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: toUpdate,
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      emailConfirmed: true,
      createdAt: true,
    },
  });
  return updated;
}
