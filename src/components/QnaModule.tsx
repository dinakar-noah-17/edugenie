import React, { useState } from 'react';
import { HelpCircle, Send, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { SAMPLE_PROMPTS } from '../data/sampleData';
import { VoiceReader } from './VoiceReader';
import { QnaResult } from '../types';

interface QnaModuleProps {
  onSaveResult?: (res: QnaResult) => void;
  compact?: boolean;
}

export const QnaModule: React.FC<QnaModuleProps> = ({ onSaveResult, compact }) => {
  const [question, setQuestion] = useState('Which is the largest ocean?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ question: string; answer: string } | null>({
    question: 'Which is the largest ocean?',
    answer: 'The Pacific Ocean is the largest ocean on Earth. It covers more than 60 million square miles (about 155 million square kilometers) and accounts for about 46% of Earth’s water surface area.',
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      const newResult = { question: q, answer: data.answer };
      setResult(newResult);

      if (onSaveResult) {
        onSaveResult({ ...newResult, timestamp: Date.now() });
      }
    } catch (err: any) {
      console.error('Q&A request failed:', err);
      setError(err.message || 'Failed to fetch answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.answer) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 ${compact ? '' : 'max-w-4xl mx-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Ask EduGenie a Question
            </h2>
            <p className="text-xs text-slate-500">
              Get direct, accurate, and student-friendly answers powered by Gemini
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          POST /api/qa
        </span>
      </div>

      {/* Suggested chips */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span>Try sample questions from project brief:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PROMPTS.qa.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuestion(item);
                handleAsk(item);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Which is the largest ocean?"
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
            required
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Get Answer</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result Container (Matching Fig. EDUGENIE screenshot from PDF) */}
      {result && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/70">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Answer:
            </span>
            <div className="flex items-center gap-2">
              <VoiceReader text={result.answer} />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
                title="Copy answer to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
            {result.answer}
          </div>
        </div>
      )}
    </div>
  );
};
