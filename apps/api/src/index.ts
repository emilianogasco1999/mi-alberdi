import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { envs } from '@config/environment.js';
import { auditContextMiddleware } from '@core/presentation/middlewares/auditContext.middleware.js';
import { generalRateLimiter } from '@core/presentation/middlewares/rateLimiter.middleware.js';
import { errorHandler } from '@core/presentation/middlewares/errorHandler.middleware.js';
import { AuthRoutes } from '@features/auth/presentation/routes/auth.routes.js';
import { TaxonomiaRoutes } from '@features/taxonomia/presentation/routes/taxonomia.routes.js';
import { StorageRoutes } from '@features/storage/presentation/routes/storage.routes.js';
import { NegociosRoutes } from '@features/negocios/presentation/routes/negocios.routes.js';
import { CatalogoRoutes } from '@features/catalogo/presentation/routes/catalogo.routes.js';
import { DescubrimientoRoutes } from '@features/descubrimiento/presentation/routes/descubrimiento.routes.js';
import { MembresiasRoutes } from '@features/membresias/presentation/routes/membresias.routes.js';
import { AnaliticaRoutes } from '@features/analitica/presentation/routes/analitica.routes.js';

const app = express();

// Necesario detrás de proxies inversos o Docker para que express-rate-limit lea X-Forwarded-For
app.set('trust proxy', 1);

app.use(
  cors({
    origin: envs.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(generalRateLimiter);
app.use(auditContextMiddleware);

// Configuración Swagger OpenAPI
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mi Alberdi API',
      version: '1.0.0',
      description: 'API REST de la plataforma comercial y de oficios de Juan Bautista Alberdi',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/features/**/presentation/docs/*.ts'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'mi-alberdi-api', status: 'healthy' });
});

// Rutas de Módulos (Features)
app.use('/api/auth', AuthRoutes());
app.use('/api/taxonomia', TaxonomiaRoutes());
app.use('/api/storage', StorageRoutes());
app.use('/api/negocios', NegociosRoutes());
app.use('/api/catalogo', CatalogoRoutes());
app.use('/api/descubrimiento', DescubrimientoRoutes());
app.use('/api/membresias', MembresiasRoutes());
app.use('/api/analitica', AnaliticaRoutes());

// Manejador centralizado de errores
app.use(errorHandler);

app.listen(envs.PORT_API, () => {
  console.log(`🚀 [Mi Alberdi API] corriendo en http://localhost:${envs.PORT_API}`);
  console.log(`📚 [Swagger Docs] disponible en http://localhost:${envs.PORT_API}/api-docs`);
});
