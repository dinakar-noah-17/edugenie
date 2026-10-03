import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Helper to initialize Gemini client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const MODEL_NAME = 'gemini-3.8-flash';

// Clean JSON code fences helper (as specified in PDF)
function cleanJsonBlock(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i, '$1').trim();
}

// Resilient generateContent with retry and model fallback
async function generateContentWithRetry(ai: GoogleGenAI, params: any): Promise<any> {
  const modelsToTry = [params.model || MODEL_NAME, 'gemini-3.1-flash-lite'];
  let lastError;

  for (const model of modelsToTry) {
    try {
      return await ai.models.generateContent({
        ...params,
        model,
      });
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 'UNAVAILABLE' ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('Resource has been exhausted');
      if (isTransient) {
        console.warn(`Model ${model} encountered transient high demand (${err.message}), trying alternative model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Health check
app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    name: 'EduGenie AI Backend',
  });
});

// 1. QnA Module (/qa and /api/qa)
// Scenario: A student asks a general or academic question (e.g., "Which is the largest ocean?")
const handleQA = async (req: Request, res: Response) => {
  try {
    const question = (req.body?.question || req.query?.question) as string;
    if (!question || !question.trim()) {
      res.status(400).json({ error: 'Please provide a question.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your secrets.',
      });
      return;
    }

    const prompt = `You are EduGenie, a friendly, encouraging, and highly knowledgeable AI learning assistant for students.
Answer the following question clearly, concisely, and accurately.
Include brief context or fascinating facts if helpful, but keep the core answer direct and easy to remember for a learner.

Question: "${question}"`;

    const response = await generateContentWithRetry(ai, {
      model: MODEL_NAME,
      contents: prompt,
    });

    const answer = response.text?.trim() || 'No answer generated.';
    res.json({
      question,
      answer,
    });
  } catch (error: any) {
    console.error('Error in QnA:', error);
    res.status(500).json({
      error: `Error in QnA: ${error.message || 'Unknown error occurred'}`,
    });
  }
};

app.get('/qa', handleQA);
app.post('/qa', handleQA);
app.get('/api/qa', handleQA);
app.post('/api/qa', handleQA);

// 2. Explanation Module (/explain and /api/explain)
// Breaks down complex concepts into simple, readable explanations for school students or foundational learners
const handleExplain = async (req: Request, res: Response) => {
  try {
    const topic = (req.body?.topic || req.query?.topic) as string;
    const level = (req.body?.level || 'School student (clear & simple)') as string;

    if (!topic || !topic.trim()) {
      res.status(400).json({ error: 'Please provide a topic to explain.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your secrets.',
      });
      return;
    }

    const prompt = `You are EduGenie's concept explanation engine.
Explain the concept of "${topic}" in a simple, clear, and relatable way for a ${level}.
Focus on clarity and brevity so learners with minimal background knowledge grasp essential concepts without feeling overwhelmed.

Provide your output in valid JSON with:
1. "explanation": A concise, engaging 1-2 paragraph explanation broken down into intuitive terms.
2. "analogy": A memorable everyday real-world analogy to visualize the concept.
3. "keyPoints": An array of 3-4 bullet point takeaways.
4. "simpleDefinition": A 1-sentence crystal clear definition.`;

    const response = await generateContentWithRetry(ai, {
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            analogy: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            simpleDefinition: { type: Type.STRING },
          },
          required: ['explanation', 'analogy', 'keyPoints', 'simpleDefinition'],
        },
      },
    });

    const rawText = response.text || '{}';
    let data;
    try {
      data = JSON.parse(cleanJsonBlock(rawText));
    } catch {
      data = {
        explanation: rawText,
        analogy: '',
        keyPoints: [],
        simpleDefinition: '',
      };
    }

    res.json({
      topic,
      explanation: data.explanation,
      analogy: data.analogy,
      keyPoints: data.keyPoints,
      simpleDefinition: data.simpleDefinition,
    });
  } catch (error: any) {
    console.error('Error in Explanation:', error);
    res.status(500).json({
      error: `Error in Explanation: ${error.message || 'Unknown error occurred'}`,
    });
  }
};

app.post('/explain', handleExplain);
app.get('/explain', handleExplain);
app.post('/api/explain', handleExplain);
app.get('/api/explain', handleExplain);

// 3. Quiz Module (/quiz and /api/quiz)
// Generates multiple choice questions (MCQs) each with 4 options and a correct answer
const handleQuiz = async (req: Request, res: Response) => {
  try {
    const text = (req.body?.text || req.body?.topic || req.query?.text || req.query?.topic) as string;
    const count = Math.min(Math.max(Number(req.body?.count) || 3, 1), 10);

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Please provide text or a topic for the quiz.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your secrets.',
      });
      return;
    }

    const prompt = `You are a quiz generator.
From the following topic or passage, create exactly ${count} multiple-choice questions (MCQs).
Each question should include:
- A "question" string
- A list of exactly 4 "options" (strings)
- A correct "answer" that MUST exactly match one of the 4 options
- A brief 1-sentence "explanation" explaining why that answer is correct

Topic/Passage:
"${text}"`;

    const response = await generateContentWithRetry(ai, {
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              answer: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ['question', 'options', 'answer', 'explanation'],
          },
        },
      },
    });

    const raw = response.text || '[]';
    let quizList;
    try {
      quizList = JSON.parse(cleanJsonBlock(raw));
    } catch {
      quizList = [];
    }

    res.json({
      quiz: quizList,
      topic: text,
    });
  } catch (error: any) {
    console.error('Error in Quiz Generation:', error);
    res.status(500).json({
      error: `Error in Quiz Generation: ${error.message || 'Unknown error occurred'}`,
    });
  }
};

app.post('/quiz', handleQuiz);
app.get('/quiz', handleQuiz);
app.post('/api/quiz', handleQuiz);
app.get('/api/quiz', handleQuiz);

// 4. Summarization Module (/summarize and /api/summarize)
// Summarizes long paragraphs into concise, easy-to-understand versions for quick revision
const handleSummarize = async (req: Request, res: Response) => {
  try {
    const text = (req.body?.text || req.query?.text) as string;
    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Please provide text to summarize.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your secrets.',
      });
      return;
    }

    const prompt = `Summarize the following text in simple, clear language for quick revision.
Ensure core information is retained while eliminating redundancy, helping learners absorb key points efficiently.

Provide your output in valid JSON with:
1. "summary": A concise, crystal-clear paragraph summary.
2. "keyTakeaways": An array of 3-5 bullet point takeaways.
3. "oneLiner": A memorable single-sentence wrap-up.

Text to summarize:
"${text}"`;

    const response = await generateContentWithRetry(ai, {
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            oneLiner: { type: Type.STRING },
          },
          required: ['summary', 'keyTakeaways', 'oneLiner'],
        },
      },
    });

    const raw = response.text || '{}';
    let data;
    try {
      data = JSON.parse(cleanJsonBlock(raw));
    } catch {
      data = {
        summary: raw,
        keyTakeaways: [],
        oneLiner: '',
      };
    }

    res.json({
      summary: data.summary,
      keyTakeaways: data.keyTakeaways,
      oneLiner: data.oneLiner,
      originalLength: text.length,
      summaryLength: (data.summary || '').length,
    });
  } catch (error: any) {
    console.error('Error in Summarization:', error);
    res.status(500).json({
      error: `Error in Summary: ${error.message || 'Unknown error occurred'}`,
    });
  }
};

app.post('/summarize', handleSummarize);
app.get('/summarize', handleSummarize);
app.post('/api/summarize', handleSummarize);
app.get('/api/summarize', handleSummarize);

// 5. Learning Recommendations Module (/learn/recommendations and /api/learn/recommendations)
// Creates structured roadmap from beginner to advanced with timelines, key topics, resources & adaptive tips
const handleLearningRecommendations = async (req: Request, res: Response) => {
  try {
    const topic = (req.body?.topic || req.query?.topic) as string;
    if (!topic || !topic.trim()) {
      res.status(400).json({ error: 'Please provide a topic for learning recommendations.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your secrets.',
      });
      return;
    }

    const prompt = `You are an AI tutor. The student wants to learn about: ${topic}.
Suggest a structured and adaptive learning path including key topics, order of learning, and resources.
Include beginner, intermediate, and advanced levels with estimated timelines (e.g. 1-2 weeks, 2-3 weeks, 3-4 weeks), key topics, and practical resources (tutorials, online documentation, practice platforms, books, videos).
Also include practical "Adaptive Learning Tips" for mastering the subject.

Format your response as a rich, structured markdown document matching the EduGenie standard report (with bold headers **I. Beginner Level: ...**, **(Estimated Time: ...)**, * **Key Topics:**, * **Resources:**, **Adaptive Learning Tips:**).`;

    const response = await generateContentWithRetry(ai, {
      model: MODEL_NAME,
      contents: prompt,
    });

    const markdownText = response.text?.trim() || 'Could not generate learning path.';

    res.json({
      topic,
      recommendation: markdownText,
    });
  } catch (error: any) {
    console.error('Error in Learning Recommendations:', error);
    res.status(500).json({
      error: `Error in Learning Recommendations: ${error.message || 'Unknown error occurred'}`,
    });
  }
};

app.get('/learn/recommendations', handleLearningRecommendations);
app.post('/learn/recommendations', handleLearningRecommendations);
app.get('/api/learn/recommendations', handleLearningRecommendations);
app.post('/api/learn/recommendations', handleLearningRecommendations);

// Static frontend serving or Vite middleware
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start EduGenie server:', err);
});
