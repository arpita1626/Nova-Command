import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { app as backendApp } from './backend/src/app';
import { seedDatabase } from './backend/prisma/seed';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Seed the in-memory database
  try {
    await seedDatabase();
    console.log('[Database] In-memory database seeded successfully.');
  } catch (err) {
    console.error('[Database] Failed to seed database:', err);
  }

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Mount backend API routes (Express app handling /api/*)
  app.use(backendApp);

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] NOVA COMMAND unified full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
