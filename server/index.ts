import { app } from './app.js';
import { config } from './config.js';

// Start Express server for local development and self-hosted environments
app.listen(config.port, () => {
  console.log(`[Kongu Kural] Backend server running on http://localhost:${config.port}`);
  console.log(`[Kongu Kural] Watching knowledge file at: ${config.collegeInfoPath}`);
});

export default app;
