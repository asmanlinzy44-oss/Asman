import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Gemini Admin Copilot Autonomous Agent Endpoint
app.post('/api/copilot/chat', async (req: Request, res: Response): Promise<void> => {
  const { message, history } = req.body;
  const userText = (message || '').trim();

  if (!userText) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    const ai = new GoogleGenAI();
    const prompt = `You are the official Gemini AI Copilot inside the Paper Express Administrator Console for Sri Lankan G.C.E. Advanced Level Science Stream (Physical Science: Combined Mathematics, Physics, Chemistry; Biological Science: Biology, Physics, Chemistry).
You have full administrator rights to execute uploads, manage folders, post announcements, and answer academic/administrative queries.

Administrator Message: "${userText}"

Context / Recent History: ${JSON.stringify((history || []).slice(-4))}

CRITICAL BEHAVIOR GUIDELINES:
1. CASUAL CHAT & GREETINGS:
   If the admin says something casual like "hi", "hello", "hey", "vanakkam", "epdi irukinga", "who are you", "what can you do", "enna panre":
   - Respond NATURALLY, WARMLY, INTELLIGENTLY, and CASUALLY. DO NOT repeat a rigid canned block of instructions.
   - Greet them back politely in Tamil / Tanglish / English, ask how you can help them today with uploading papers or managing the library.
   - Set intent: "CHAT".

2. UPLOAD REQUESTS:
   If the admin wants to upload or add an exam paper, marking scheme, pilot paper, term test, or study resource:
   - Identify:
     * Subject: Combined Mathematics | Physics | Chemistry | Biology
     * Stream: maths | bio
     * Year: 1981–2027 (default to 2024 if not specified)
     * Category: "past-papers" (National A/L) | "pilot-papers" (e.g. Moratuwa) | "fwc-papers" (FWC Thondaimanaru / School Term Tests) | "theory-notes" (NIE books, theory handbooks, MCQs)
     * Document format: Question Paper vs Official Marking Scheme / Answers
     * Google Drive link: Extract any https://drive.google.com/... or cloud link.
   - If Drive link is missing:
     * Politely explain the exact document and folder you recognized, and ask for the Drive link.
     * Set intent: "UPLOAD_NEEDS_LINK".
   - If Drive link is present:
     * Generate bilingual title in English and Tamil.
     * Set intent: "UPLOAD".

3. FOLDER / VAULT NAVIGATION:
   If admin says "open physics folder", "show pilot vault", "goto biology resources":
   - Set intent: "OPEN_FOLDER".

4. SITE ANNOUNCEMENT:
   If admin says "put live notice: ...", "set announcement: ...":
   - Extract notice text and set intent: "ANNOUNCEMENT".

5. DELETION:
   If admin says "delete 2019 physics paper":
   - Extract subject and year, set intent: "DELETE".

Respond ONLY with valid JSON:
{
  "thoughtProcess": "1. Query Intent... 2. Subject & Stream... 3. Drive Link Validation... 4. Execution Plan...",
  "intent": "CHAT" | "UPLOAD" | "UPLOAD_NEEDS_LINK" | "OPEN_FOLDER" | "DELETE" | "ANNOUNCEMENT",
  "reply": "Your intelligent, natural, helpful response in Tamil / Tanglish / English",
  "uploadData": {
    "titleEn": "G.C.E. A/L 2024 Biology Marking Scheme",
    "titleTa": "க.பொ.த உயர்தரம் 2024 உயிரியல் விடைக் குறிப்பு",
    "subject": "Biology",
    "stream": "bio",
    "category": "past-papers",
    "year": 2024,
    "driveLink": "extracted drive link or empty string",
    "isMarkingScheme": true,
    "schoolOrSource": "Department of Examinations, Sri Lanka"
  },
  "folderData": {
    "subject": "physics",
    "tab": "papers"
  },
  "announcementText": "text if any",
  "deleteTarget": {
    "subject": "physics",
    "year": 2019
  },
  "suggestedPrompts": ["Next action 1", "Next action 2"]
}`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API response timeout')), 10000)
    );

    const response: any = await Promise.race([generatePromise, timeoutPromise]);

    if (response && response.text) {
      let rawJson = response.text.trim();
      if (rawJson.startsWith('```')) {
        rawJson = rawJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      }
      const data = JSON.parse(rawJson);
      res.json(data);
      return;
    }

    res.status(500).json({ error: 'Empty response from Gemini' });
  } catch (err: any) {
    console.error('Gemini copilot server error:', err);
    res.status(500).json({ 
      error: err.message || 'Gemini processing failed',
      fallbackRequired: true 
    });
  }
});

// Setup Vite development middleware or production static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Paper Express Server with Gemini Copilot running on port ${PORT}`);
  });
}

startServer();
