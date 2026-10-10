import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { chatRouter } from './routes/chat.js';
import { statusRouter } from './routes/status.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/status', statusRouter);

// Health check root
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Kongu Kural API Server' });
});

// Start Express server
app.listen(config.port, () => {
  console.log(`[Kongu Kural] Backend server running on http://localhost:${config.port}`);
  console.log(`[Kongu Kural] Watching knowledge file at: ${config.collegeInfoPath}`);
});
