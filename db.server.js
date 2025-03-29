import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("MongoDB connected successfully with Prisma!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

testConnection();

export default prisma;

