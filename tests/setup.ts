import 'dotenv/config';
import prisma from '../src/config/database';

beforeAll(async () => {
  // Clean up existing data
  await prisma.$executeRaw`TRUNCATE TABLE "ApiUsage" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Analysis" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "FinancialDocument" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "IndustryBenchmark" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BatchJob" RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
