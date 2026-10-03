import React, { useState } from 'react';
import { Lightbulb, Send, Loader2, Copy, Check, Sparkles, Compass } from 'lucide-react';
import { SAMPLE_PROMPTS } from '../data/sampleData';
import { VoiceReader } from './VoiceReader';
import { ExplainResult } from '../types';

interface ExplainModuleProps {
  onSaveResult?: (res: ExplainResult) => void;
  compact?: boolean;
}

export const ExplainModule: React.FC<ExplainModuleProps> = ({ onSaveResult, compact }) => {
  const [topic, setTopic] = useState('Photosynthesis');
  const [level, setLevel] = useState('School Student (Clear & Simple)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [result, setResult] = useState<{
    topic: string;
    explanation: string;
    analogy?: string;
    keyPoints?: string[];
    simpleDefinition?: string;
  } | null>({
    topic: 'Photosynthesis',
    simpleDefinition: 'Photosynthesis is how plants use sunlight, water, and air to make their own food and release oxygen.',
    explanation:
      'Photosynthesis is the wonderful natural process plants use to make food and grow. Plants absorb water from the soil through their roots and catch carbon dioxide gas from the air using tiny pores in their leaves. Special green pigments called chlorophyll trap energy from sunlight to cook these ingredients together, creating nourishing sugar (glucose) and releasing fresh oxygen into the air for us to breathe!',
    analogy:
      'Think of a plant leaf as a tiny solar-powered kitchen: the sunlight is the oven heat, water and carbon dioxide are the raw recipe ingredients, and delicious plant food is the cake baked fresh every sunny day!',
    keyPoints: [
      'Takes place primarily in chloroplasts using green chlorophyll',
      'Requires three main ingredients: Sunlight, Water, and Carbon Dioxide',
      'Produces two valuable outputs: Sugar (Glucose) for food and Oxygen gas for the atmosphere',
    ],
  });

  const handleExplain = async (customTopic?: string) => {
    const t = (customTopic || topic).trim();
    if (!t) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: t, level }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      const newResult = {
        topic: t,
        explanation: data.explanation,
        analogy: data.analogy,
        keyPoints: data.keyPoints,
        simpleDefinition: data.simpleDefinition,
      };
      setResult(newResult);

      if (onSaveResult) {
        onSaveResult({ ...newResult, timestamp: Date.now() });
      }
    } catch (err: any) {
      console.error('Explanation request failed:', err);
      setError(err.message || 'Failed to explain topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.explanation) return;
    const fullText = `${result.topic}\n\n${result.explanation}${result.analogy ? `\n\nAnalogy:\n${result.analogy}` : ''}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 ${compact ? '' : 'max-w-4xl mx-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Need an Explanation?
            </h2>
            <p className="text-xs text-slate-500">
              Break down complex concepts into simple, readable language for beginners
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          POST /api/explain
        </span>
      </div>

      {/* Suggested chips */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Try topics from project report:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PROMPTS.explain.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTopic(item);
                handleExplain(item);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
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
          handleExplain();
        }}
        className="space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Photosynthesis, Quantum computing, Binary Search Algorithm"
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder:text-slate-400"
            required
          />

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
          >
            <option value="School Student (Clear & Simple)">School Student Mode</option>
            <option value="Beginner / Foundational">Beginner Mode</option>
            <option value="High School / College">Intermediate Academic</option>
          </select>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <span>Explain</span>
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

      {/* Result Container (Matching Fig. EDUGENIE Explanation screenshot from PDF) */}
      {result && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 transition-all space-y-4">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Explanation:
              </span>
              <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {result.topic}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <VoiceReader text={result.explanation} />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
                title="Copy explanation"
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

          {/* Simple Definition */}
          {result.simpleDefinition && (
            <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-100 text-xs text-blue-900 font-medium leading-relaxed">
              💡 <strong>Quick Definition:</strong> {result.simpleDefinition}
            </div>
          )}

          {/* Main Explanation */}
          <div className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
            {result.explanation}
          </div>

          {/* Analogy Box */}
          {result.analogy && (
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold block mb-1 flex items-center gap-1.5 text-amber-800">
                <Compass className="w-3.5 h-3.5" />
                Real-World Analogy:
              </span>
              {result.analogy}
            </div>
          )}

          {/* Key Points */}
          {result.keyPoints && result.keyPoints.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                Key Takeaways:
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {result.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{pt}</span>
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
