import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/api.ts';
import { telemetrySimulator } from './src/server/simulator.ts';
import { dbStore } from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // JSON & URL-encoded parsing (allow up to 50MB for CSV datasets)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // REST API routes
  app.use('/api', apiRouter);

  // WebSocket Server for live telemetry
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);

    // Initial greeting & snapshot
    ws.send(
      JSON.stringify({
        type: 'INITIAL_STATE',
        data: {
          onlineDevices: dbStore.devices.filter((d) => d.connectionStatus === 'online').length,
          totalDevices: dbStore.devices.length,
          criticalAlertsCount: dbStore.alerts.filter((a) => a.severity === 'Critical' && a.status === 'New').length,
          activeModel: 'v1.0.0-HG-CICIDS',
          timestamp: new Date().toISOString(),
        },
      })
    );

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch (err) {
        // ignore malformed message
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });
  });

  // Wire telemetry simulator broadcaster
  const broadcast = (event: { type: string; data: any }) => {
    const payload = JSON.stringify(event);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  };

  telemetrySimulator.setBroadcaster(broadcast);
  telemetrySimulator.start();

  // Vite middleware in dev or static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[HEARTGUARD IDS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal: Failed to start HeartGuard IDS server:', err);
  process.exit(1);
});
