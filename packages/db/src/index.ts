// lib/prisma.ts or src/client.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from './generated/prisma/client.js';

// 1. Create a function to instantiate the client
const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });
};

// 2. Declare a global variable for reusability (necessary for development hot reloads)
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// 3. Use the existing client if available, otherwise create a new one
const prisma = globalThis.prisma ?? prismaClientSingleton();

// 4. Store the client globally in development mode
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;