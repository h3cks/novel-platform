import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
// Update this path to match your custom output directory from the schema
import { PrismaClient } from '../generated/prisma'

// 1. Initialize a connection pool using the pg driver
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// 2. Wrap the pool in the Prisma adapter
const adapter = new PrismaPg(pool)

// 3. Pass the adapter to the PrismaClient constructor
export const prisma = new PrismaClient({ adapter })