import React, { useState } from 'react';
import { FileText, Send, Loader2, Copy, Check, Sparkles, Zap } from 'lucide-react';
import { SAMPLE_PROMPTS } from '../data/sampleData';
import { VoiceReader } from './VoiceReader';
import { SummaryResult } from '../types';

interface SummaryModuleProps {
  onSaveResult?: (res: SummaryResult) => void;
  compact?: boolean;
}

export const SummaryModule: React.FC<SummaryModuleProps> = ({ onSaveResult, compact }) => {
  const [text, setText] = useState(SAMPLE_PROMPTS.summary[0].text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [result, setResult] = useState<{
    summary: string;
    keyTakeaways?: string[];
    oneLiner?: string;
    originalLength: number;
    summaryLength: number;
  } | null>({
    summary:
      "The Industrial Revolution changed the world by shifting it from farming to factories. New machines, like James Watt's steam engine, made things faster and easier to produce. While this boosted economies, it also created problems like bad working conditions, child labor, pollution, and overcrowded cities. Even with these problems, the Industrial Revolution shaped the modern world, affecting how we travel, communicate, work, and trade.",
    keyTakeaways: [
      'Transitioned economies from manual agrarian labor to steam-powered industrial factories',
      "Catalyzed by breakthrough inventions like James Watt's steam engine",
      'Spawned harsh social challenges including child labor and rapid urban crowding',
      'Established the foundation for modern transport, commerce, and communication',
    ],
    oneLiner: 'The Industrial Revolution transformed global civilization from agriculture to machine-driven industrialization.',
    originalLength: SAMPLE_PROMPTS.summary[0].text.length,
    summaryLength: 466,
  });

  const handleSummarize = async (customText?: string) => {
    const t = (customText || text).trim();
    if (!t) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      const newResult = {
        summary: data.summary,
        keyTakeaways: data.keyTakeaways,
        oneLiner: data.oneLiner,
        originalLength: data.originalLength || t.length,
        summaryLength: data.summaryLength || (data.summary || '').length,
      };

      setResult(newResult);

      if (onSaveResult) {
        onSaveResult({
          originalText: t,
          ...newResult,
          timestamp: Date.now(),
        });
      }
    } catch (err: any) {
      console.error('Summarize request failed:', err);
      setError(err.message || 'Failed to summarize text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.summary) return;
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const compressionPercent = result
    ? Math.max(0, Math.round((1 - result.summaryLength / result.originalLength) * 100))
    : 0;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 ${compact ? '' : 'max-w-4xl mx-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Summarize a Paragraph
            </h2>
            <p className="text-xs text-slate-500">
              Transform dense educational passages into concise, easy-to-digest revision notes
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          POST /api/summarize
        </span>
      </div>

      {/* Suggested sample buttons */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
          <Sparkles className="w-3 h-3 text-sky-500" />
          <span>Load sample passages:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PROMPTS.summary.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setText(item.text);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-800 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSummarize();
        }}
        className="space-y-3"
      >
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Paste long content or educational passage here to summarize..."
            className="w-full px-4 py-3 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all placeholder:text-slate-400"
            required
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mt-1">
            <span>Length: {text.length} characters ({text.trim().split(/\s+/).filter(Boolean).length} words)</span>
            <button
              type="button"
              onClick={() => setText('')}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <span>Summarize</span>
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

      {/* Result Container (Matching Fig. EDUGENIE Summarize screenshot from PDF) */}
      {result && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 transition-all space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Summary:
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                <Zap className="w-3 h-3 text-sky-600" />
                {compressionPercent}% More Concise
              </span>
            </div>
            <div className="flex items-center gap-2">
              <VoiceReader text={result.summary} />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
                title="Copy summary"
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

          {/* One-Liner */}
          {result.oneLiner && (
            <div className="p-2.5 rounded-lg bg-sky-50/80 border border-sky-100 text-xs font-semibold text-sky-900">
              📌 {result.oneLiner}
            </div>
          )}

          {/* Summary Paragraph */}
          <div className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
            {result.summary}
          </div>

          {/* Key Takeaways */}
          {result.keyTakeaways && result.keyTakeaways.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                Key Takeaways:
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {result.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-sky-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
