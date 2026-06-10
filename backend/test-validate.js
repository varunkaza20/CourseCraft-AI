import express from 'express';
import { validateProgramGenerate } from './backend/src/middleware/validate.middleware.js';

const app = express();
app.use(express.json());

app.post('/generate', validateProgramGenerate, (req, res) => {
  res.json({ success: true });
});

app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ error: err.message });
});

app.listen(3001, async () => {
  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('http://localhost:3001/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programName: 'Test Program',
        difficultyLevel: 'beginner',
        numberOfWeeks: 5,
        includesCapstone: false
      })
    });
    const data = await res.json();
    console.log("RESPONSE:", data);
  } catch (e) {
    console.error("FETCH ERROR:", e);
  }
  process.exit(0);
});
