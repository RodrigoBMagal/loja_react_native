import 'dotenv/config';
import { createApp } from './app';
import { prisma } from './lib/prisma';

const PORT = Number(process.env.PORT) || 3000;

const start = async () => {
  try {
    // Garante que a conexão com o banco de dados está saudável antes de subir o servidor.
    await prisma.$connect();

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 Swagger docs available at http://localhost:${PORT}/docs`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar o servidor:', err);
    process.exit(1);
  }
};

start();
