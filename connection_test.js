import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Running connection test...");

    const testQuery = await prisma.user.findMany();
    console.log("MongoDB connected successfully with Prisma!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

export default prisma;
