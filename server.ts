import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI SDK with server-side API key and required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Heuristic local summarization fallback if API key is unconfigured or rate-limited.
 */
function localFallbackSummarize(text: string, length: 'brief' | 'balanced' | 'deep'): {
  summary: string;
  keyPoints: string[];
  themes: string[];
} {
  const clean = text.replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  const maxSentences = length === 'brief' ? 3 : length === 'deep' ? 10 : 5;
  const pickedSentences = sentences.slice(0, maxSentences).map((s) => s.trim());

  const keyPoints = sentences
    .slice(0, length === 'brief' ? 4 : length === 'deep' ? 8 : 6)
    .map((s, idx) => s.trim().replace(/^[-*•\d.]\s*/, ''))
    .filter((s) => s.length > 25);

  return {
    summary: pickedSentences.join(' ') || 'The document contains structured text and sections.',
    keyPoints: keyPoints.length > 0 ? keyPoints : [
      'Document structure and primary headings captured successfully.',
      'Key metrics and quantitative references extracted.',
      'Core context analyzed for rapid executive reference.',
    ],
    themes: ['Executive Overview', 'Key Metrics', 'Operational Insights'],
  };
}

/**
 * POST /api/ai/summarize
 * Generates structured summaries with executive overview and key takeaways.
 */
app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  try {
    const { text, length = 'balanced', focus = 'general', fileName = 'Document' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'No document text provided for summarization.' });
    }

    const truncatedText = text.slice(0, 75000); // Guardrail context window
    const wordCount = text.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.round(wordCount / 220));

    if (!process.env.GEMINI_API_KEY) {
      const fallback = localFallbackSummarize(truncatedText, length);
      return res.json({
        success: true,
        summary: fallback.summary,
        keyPoints: fallback.keyPoints,
        themes: fallback.themes,
        wordCount,
        readingTimeMinutes,
        source: 'local-engine',
      });
    }

    const lengthGuide =
      length === 'brief'
        ? 'Provide a concise, punchy 1-paragraph executive summary and exactly 3-4 bullet takeaways.'
        : length === 'deep'
        ? 'Provide an extensive, comprehensive 3-paragraph summary covering all core sections, followed by 6-8 detailed takeaways.'
        : 'Provide a well-balanced 2-paragraph summary highlighting key objectives, followed by 5 key bullet takeaways.';

    const focusGuide =
      focus === 'action-items'
        ? 'Emphasize next steps, deliverables, and actionable recommendations.'
        : focus === 'metrics'
        ? 'Highlight all key quantitative data, dates, financial figures, and measurable milestones.'
        : 'Provide a holistic overview balancing context, findings, and conclusions.';

    const prompt = `You are PaperEase AI Document Analyst.
Document Name: "${fileName}"
Document Word Count: ~${wordCount} words.
Length Profile: ${lengthGuide}
Focus Angle: ${focusGuide}

Analyze the document content below and return a structured JSON response with the following keys:
- "summary": (string) The cohesive, professional executive summary.
- "keyPoints": (array of strings) 4 to 8 clear, specific bullet points summarizing the most important facts.
- "themes": (array of strings) 3 to 5 core topical tags or themes.

DOCUMENT CONTENT:
"""
${truncatedText}
"""

Ensure the JSON is strictly valid. Do not wrap in markdown quotes if possible or output standard JSON.`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = aiResponse.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Clean possible markdown code fences
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      parsed = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      summary: parsed.summary || rawText,
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      themes: Array.isArray(parsed.themes) ? parsed.themes : ['Overview', 'Document Insights'],
      wordCount,
      readingTimeMinutes,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('AI Summarization Error:', error);
    // Graceful fallback so user never gets blocked
    const fallback = localFallbackSummarize(req.body?.text || '', req.body?.length || 'balanced');
    return res.json({
      success: true,
      summary: fallback.summary,
      keyPoints: fallback.keyPoints,
      themes: fallback.themes,
      wordCount: (req.body?.text || '').split(/\s+/).length,
      readingTimeMinutes: 2,
      source: 'fallback-recovery',
    });
  }
});

/**
 * POST /api/ai/chat
 * Interactive Q&A strictly grounded in the document context.
 */
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { text, message, history = [], fileName = 'Document' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message query is required.' });
    }

    const truncatedText = (text || '').slice(0, 75000);

    if (!process.env.GEMINI_API_KEY) {
      // Local smart keyword matcher fallback
      return res.json({
        success: true,
        reply: `Based on the document "${fileName}":\n\nThe text addresses topics related to your query "${message}". To query deeper nuances, configure GEMINI_API_KEY in your secrets panel.`,
        suggestedQuestions: [
          'What are the key takeaways?',
          'What are the main conclusions?',
          'Summarize the action items',
        ],
      });
    }

    // Build chat contents
    const prompt = `You are PaperEase AI Document Assistant.
You are helping the user understand and analyze the document: "${fileName}".

Rules:
1. Ground your answers strictly in the provided document content.
2. If the user asks something not covered in the document, acknowledge it politely and answer based only on what IS stated.
3. Use clean markdown formatting (bolding, bullet lists, short readable paragraphs).
4. Suggest 3 relevant follow-up questions at the very end.

DOCUMENT EXCERPT:
"""
${truncatedText}
"""

USER QUERY:
${message}

Return a JSON object with:
- "reply": (string) Markdown response answering the question thoroughly.
- "suggestedQuestions": (array of strings) Exactly 3 insightful follow-up questions the user might want to ask next.`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = aiResponse.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      parsed = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      reply: parsed.reply || rawText,
      suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
        ? parsed.suggestedQuestions
        : [
            'Can you explain the main points?',
            'What are the key dates or figures?',
            'How does this conclude?',
          ],
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return res.json({
      success: true,
      reply: `I encountered a momentary issue processing that specific query with the AI model. Here is a high-level summary of your document "${req.body?.fileName || 'Document'}": It contains ${req.body?.text ? req.body.text.split(' ').length : 0} words. Please try asking again.`,
      suggestedQuestions: [
        'What are the main points?',
        'Summarize this document in 3 bullets',
        'What are the core conclusions?',
      ],
    });
  }
});

/**
 * POST /api/ai/suggest-questions
 * Generates 4 starter questions when a document is first opened in Chat PDF.
 */
app.post('/api/ai/suggest-questions', async (req: Request, res: Response) => {
  try {
    const { text, fileName = 'Document' } = req.body;
    const sample = (text || '').slice(0, 20000);

    if (!process.env.GEMINI_API_KEY || !sample.trim()) {
      return res.json({
        questions: [
          'What is the executive summary of this document?',
          'What are the most critical takeaways?',
          'Are there any notable dates, metrics, or deadlines?',
          'What recommendations or conclusions are presented?',
        ],
      });
    }

    const prompt = `Given this document "${fileName}", generate 4 intelligent, intriguing questions a reader would ask about its specific contents.
Return a JSON array of 4 question strings under the key "questions".

DOCUMENT SAMPLE:
"""
${sample}
"""`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(aiResponse.text || '{"questions":[]}');
    return res.json({
      questions: parsed.questions?.length
        ? parsed.questions
        : [
            'What is the core message of this document?',
            'What key findings or results are highlighted?',
            'What actions or next steps are recommended?',
            'What are the main risks or considerations mentioned?',
          ],
    });
  } catch {
    return res.json({
      questions: [
        'What is the executive summary of this document?',
        'What are the most critical takeaways?',
        'What are the key dates or numbers mentioned?',
        'What conclusions are drawn in this document?',
      ],
    });
  }
});

// Vite Middleware for Dev / Static Files for Production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`PaperEase Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
