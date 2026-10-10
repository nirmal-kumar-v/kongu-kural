import { Router, Request, Response } from 'express';
import { processChatQuery } from '../services/chatOrchestrator.js';

export const chatRouter = Router();

chatRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Question message is required.' });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({ error: 'Question is too long (maximum 2,000 characters).' });
      return;
    }

    const safeHistory = Array.isArray(history)
      ? history.filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
      : [];

    const response = await processChatQuery(message, safeHistory);
    res.json(response);
  } catch (error: any) {
    console.error('[ChatRoute] Error handling query:', error);
    res.status(500).json({
      error: error.message || 'An internal error occurred while processing your request.',
    });
  }
});
