import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

// 1. Створюємо інстанс
const prisma = new PrismaClient({ adapter })

// 2. Робимо дефолтний експорт (для import prisma from '...')
export default prisma;

// За бажанням можна залишити іменований експорт для інших файлів, якщо десь використовується import { prisma }
export { prisma };