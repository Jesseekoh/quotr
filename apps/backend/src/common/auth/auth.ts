// This file is only responsible for creating the necessary auth configuration for better-auth to create the nessessary tables in the database. It is not used anywhere else in the application. The actual auth configuration is done in the app.module.ts file.

import { betterAuth } from 'better-auth';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: { enabled: true },
});

export default auth;
