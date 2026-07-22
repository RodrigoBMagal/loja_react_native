import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';

export const createApp = (): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/docs.json', (_req: Request, res: Response) => res.json(swaggerSpec));

  app.use('/auth', authRoutes);
  app.use('/products', productsRoutes);

  app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

  // Handler central de erros não tratados (fallback de segurança).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  });

  return app;
};

export default createApp;
