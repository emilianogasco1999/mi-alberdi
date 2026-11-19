import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { prisma } from '../database/prisma.service.js';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT_API || 4000}`,
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || 'secret-key-better-auth-mi-alberdi-2026',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  plugins: [
    admin({
      defaultRole: 'vecino',
      adminRoles: ['admin'],
    }),
  ],
  user: {
    additionalFields: {
      telefono: {
        type: 'string',
        required: false,
        input: false,
      },
      puedeProbarPremium: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});
