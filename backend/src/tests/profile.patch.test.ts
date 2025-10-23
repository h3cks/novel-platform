
import request from 'supertest';
import app from '../app';
import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET, BCRYPT_SALT_ROUNDS } from '../config';
import { $Enums } from '../generated/prisma';
import UserRole = $Enums.UserRole;

type TestUser = {
  id: number;
  email: string;
  username: string;
  password: string;
  role: UserRole,
};

async function createTestUser(email: string, username: string, password: string, role = 'READER'): Promise<TestUser> {
  const hashed = await bcrypt.hash(password, Number(BCRYPT_SALT_ROUNDS));
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashed,
      role: 'READER',
      emailConfirmed: true,
    },
  });
  return {
    id: user.id,
    email: user.email!,
    username: user.username!,
    password,
    role: user.role,
  };
}

function makeJwtForUser(userId: number, role = 'READER') {
  // Подавати Secret як any/explicit тип, щоб TS не лаявся
  return sign({ sub: userId, role }, JWT_SECRET as any, { expiresIn: '7d' });
}

describe('PATCH /profile (integration)', () => {
  const emailsToCleanup: string[] = [];
  let userA: TestUser;
  let tokenA: string;

  beforeAll(async () => {
    // Створюємо тестового користувача
    userA = await createTestUser(`test-a+${Date.now()}@example.com`, `testa${Date.now()}`, 'Password123!');
    emailsToCleanup.push(userA.email);
    tokenA = makeJwtForUser(userA.id, userA.role);
  });

  afterAll(async () => {
    // Cleanup: видаляємо тестові облікові записи
    await prisma.user.deleteMany({
      where: { email: { in: emailsToCleanup } },
    });
    await prisma.$disconnect();
  });

  it('returns 401 if Authorization header is missing', async () => {
    const res = await request(app)
      .patch('/profile')
      .send({ displayName: 'New Name' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(401);
    // body can be {error: 'Unauthorized'} as per auth.middleware
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for invalid avatarUrl', async () => {
    const res = await request(app)
      .patch('/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ avatarUrl: 'not-a-valid-url' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    // перевіряємо повідомлення про помилку (як у контролері)
    expect(res.body).toHaveProperty('error');
    expect(String(res.body.error).toLowerCase()).toMatch(/avatarurl|avatar/);
  });

  it('updates displayName and avatarUrl successfully', async () => {
    const payload = {
      displayName: 'My Test Name',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    const res = await request(app)
      .patch('/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    const returnedUser = res.body.user;
    expect(returnedUser).toHaveProperty('id', userA.id);
    expect(returnedUser).toHaveProperty('displayName', payload.displayName);
    expect(returnedUser).toHaveProperty('avatarUrl', payload.avatarUrl);

    // Verify DB updated
    const dbUser = await prisma.user.findUnique({ where: { id: userA.id } });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.displayName).toBe(payload.displayName);
    expect(dbUser!.avatarUrl).toBe(payload.avatarUrl);
  });

  it('partial update: updating only displayName does not change avatarUrl', async () => {
    const newDisplay = 'Another Name';
    // first read current avatarUrl from DB
    const before = await prisma.user.findUnique({ where: { id: userA.id } });
    expect(before).not.toBeNull();
    const previousAvatar = before!.avatarUrl;

    const res = await request(app)
      .patch('/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ displayName: newDisplay })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.user.displayName).toBe(newDisplay);
    expect(res.body.user.avatarUrl).toBe(previousAvatar);

    const after = await prisma.user.findUnique({ where: { id: userA.id } });
    expect(after).not.toBeNull();
    expect(after!.displayName).toBe(newDisplay);
    expect(after!.avatarUrl).toBe(previousAvatar);
  });
});
