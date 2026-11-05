import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga el .env de la raíz del monorepo y el local de apps/api
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT_API: z.coerce.number().default(4000),
  PORT_WEB: z.coerce.number().default(3000),
  INTERNAL_API_URL: z.string().default('http://127.0.0.1:4000'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DATABASE_URL: z
    .string()
    .default(
      'postgresql://mialberdi_user:mialberdi_password_secret@localhost:5432/mi_alberdi_db?schema=public',
    ),
  JWT_SECRET: z.string().default('super_secret_jwt_key_mi_alberdi_2026'),
  JWT_REFRESH_SECRET: z.string().default('super_secret_jwt_refresh_key_mi_alberdi_2026'),
  ACCESS_TOKEN_EXPIRES: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES: z.string().default('7d'),
  S3_ENDPOINT: z.string().default('http://localhost:9000'),
  S3_ACCESS_KEY: z.string().default('mialberdi_minio_admin'),
  S3_SECRET_KEY: z.string().default('mialberdi_minio_secret'),
  S3_BUCKET: z.string().default('mi-alberdi-archivos'),
  S3_REGION: z.string().default('us-east-1'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas en apps/api:', parsed.error.format());
  process.exit(1);
}

export const envs = parsed.data;
