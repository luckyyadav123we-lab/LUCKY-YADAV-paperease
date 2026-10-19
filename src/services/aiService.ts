export interface AISummaryResult {
  success: boolean;
  summary: string;
  keyPoints: string[];
  themes: string[];
  wordCount: number;
  readingTimeMinutes: number;
  source?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestedQuestions?: string[];
}

/**
 * Call server-side Gemini 3.8 Flash API to summarize document text.
 */
export async function summarizeDocument(
  text: string,
  options: {
    length?: 'brief' | 'balanced' | 'deep';
    focus?: 'general' | 'action-items' | 'metrics';
    fileName?: string;
  } = {}
): Promise<AISummaryResult> {
  const response = await fetch('/api/ai/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      length: options.length || 'balanced',
      focus: options.focus || 'general',
      fileName: options.fileName || 'Document',
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server returned status ${response.status}`);
  }

  return await response.json();
}

/**
 * Call server-side Gemini 3.8 Flash API to chat with the document content.
 */
export async function chatWithDocument(
  text: string,
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  fileName?: string
): Promise<{ reply: string; suggestedQuestions: string[] }> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      message,
      history: history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        content: h.content,
      })),
      fileName: fileName || 'Document',
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server returned status ${response.status}`);
  }

  const data = await response.json();
  return {
    reply: data.reply || 'No response returned.',
    suggestedQuestions: data.suggestedQuestions || [],
  };
}

/**
 * Generate starter questions for a newly loaded document in Chat PDF.
 */
export async function fetchSuggestedQuestions(
  text: string,
  fileName?: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/ai/suggest-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        fileName: fileName || 'Document',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions;
      }
    }
  } catch {
    // fallback
  }

  return [
    'What is the executive summary of this document?',
    'What are the most critical takeaways?',
    'What are the key dates, metrics, or deadlines?',
    'What conclusions or recommendations are provided?',
  ];
}
