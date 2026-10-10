import { Router, Request, Response } from 'express';
import { getKnowledge } from '../services/knowledgeService.js';
import { getGeminiKeys, getGroqKeys, config } from '../config.js';

export const statusRouter = Router();

statusRouter.get('/', (req: Request, res: Response): void => {
  try {
    const knowledge = getKnowledge();
    const geminiKeys = getGeminiKeys();
    const groqKeys = getGroqKeys();

    res.json({
      status: 'online',
      knowledgeFile: {
        path: 'college-info.txt',
        exists: !knowledge.isEmpty || knowledge.rawText.length > 0,
        isEmpty: knowledge.isEmpty,
        lastModified: knowledge.lastModified,
        characters: knowledge.rawText.length,
        totalChunks: knowledge.chunks.length,
        sections: knowledge.sections,
      },
      providers: {
        gemini: {
          configuredKeysCount: geminiKeys.length,
          model: config.geminiModel,
          ready: geminiKeys.length > 0,
        },
        groq: {
          configuredKeysCount: groqKeys.length,
          model: config.groqModel,
          ready: groqKeys.length > 0,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching status' });
  }
});
