import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat.js';
import { statusRouter } from './routes/status.js';

export const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// API Routes — mounted with and without /api prefix for full compatibility
// across local Express and Vercel serverless rewrites
app.use('/api/chat', chatRouter);
app.use('/chat', chatRouter);

app.use('/api/status', statusRouter);
app.use('/status', statusRouter);

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Kongu Kural API Server' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', name: 'Kongu Kural API Server' });
});
app.get('/api', (req, res) => {
  res.json({ status: 'ok', name: 'Kongu Kural API Server' });
});

export default app;
