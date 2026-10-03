import React, { useState } from 'react';
import {
  FileQuestion,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAMPLE_PROMPTS } from '../data/sampleData';
import { QuizQuestion, QuizResult } from '../types';

interface QuizModuleProps {
  onSaveResult?: (res: QuizResult) => void;
  compact?: boolean;
}

export const QuizModule: React.FC<QuizModuleProps> = ({ onSaveResult, compact }) => {
  const [topic, setTopic] = useState('The Pythagoras Theorem');
  const [count, setCount] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial questions matching PDF page 14
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      question: 'What does the Pythagorean theorem describe?',
      options: [
        'The relationship between the angles of a triangle.',
        'The relationship between the sides of a right-angled triangle.',
        'The relationship between the area and perimeter of a triangle.',
        'The relationship between the sides of any triangle.',
      ],
      answer: 'The relationship between the sides of a right-angled triangle.',
      explanation: 'The Pythagorean theorem relates the three sides of any right-angled triangle: a² + b² = c².',
      userSelected: 'The relationship between the sides of a right-angled triangle.',
      isAnswerChecked: true,
      isCorrect: true,
    },
    {
      question:
        "If 'a' and 'b' are the lengths of the two shorter sides of a right-angled triangle, and 'c' is the length of the longest side (hypotenuse), what equation represents the Pythagorean theorem?",
      options: ['a + b = c', 'a² + b² = c²', 'a² - b² = c²', '2a + 2b = 2c'],
      answer: 'a² + b² = c²',
      explanation: 'The sum of squares of the two legs equals the square of the hypotenuse.',
      userSelected: 'a² + b² = c²',
      isAnswerChecked: false,
      isCorrect: undefined,
    },
    {
      question: 'Which type of triangle does the Pythagorean theorem apply to?',
      options: [
        'Equilateral triangles',
        'Isosceles triangles',
        'Right-angled triangles',
        'All types of triangles',
      ],
      answer: 'Right-angled triangles',
      explanation: 'The theorem strictly applies exclusively to right-angled triangles containing a 90° angle.',
      userSelected: undefined,
      isAnswerChecked: false,
      isCorrect: undefined,
    },
  ]);

  const handleGenerate = async (customTopic?: string) => {
    const t = (customTopic || topic).trim();
    if (!t) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t, count }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
        throw new Error('Received empty quiz from AI. Please try again.');
      }

      const formatted: QuizQuestion[] = data.quiz.map((q: any) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation || '',
        userSelected: undefined,
        isAnswerChecked: false,
        isCorrect: undefined,
      }));

      setQuestions(formatted);

      if (onSaveResult) {
        onSaveResult({ topic: t, questions: formatted, timestamp: Date.now() });
      }
    } catch (err: any) {
      console.error('Quiz generation failed:', err);
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      if (!updated[qIdx].isAnswerChecked) {
        updated[qIdx] = {
          ...updated[qIdx],
          userSelected: option,
        };
      }
      return updated;
    });
  };

  const handleCheckAnswer = (qIdx: number) => {
    const q = questions[qIdx];
    if (!q.userSelected) return;

    const isCorrect = q.userSelected.trim() === q.answer.trim();

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx] = {
        ...updated[qIdx],
        isAnswerChecked: true,
        isCorrect,
      };
      return updated;
    });
  };

  const handleResetQuiz = () => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        userSelected: undefined,
        isAnswerChecked: false,
        isCorrect: undefined,
      }))
    );
  };

  // Score stats
  const checkedQuestions = questions.filter((q) => q.isAnswerChecked);
  const correctCount = questions.filter((q) => q.isCorrect).length;
  const isAllChecked = questions.length > 0 && checkedQuestions.length === questions.length;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 ${compact ? '' : 'max-w-4xl mx-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileQuestion className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Generate a Quiz
            </h2>
            <p className="text-xs text-slate-500">
              Test your understanding with AI-generated multiple-choice questions & immediate feedback
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          POST /api/quiz
        </span>
      </div>

      {/* Suggested chips */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Try topics from project report:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PROMPTS.quiz.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTopic(item);
                handleGenerate(item);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
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
          handleGenerate();
        }}
        className="space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Pythagoras theorem or paste passage"
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            required
          />

          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
          </select>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Quiz</span>
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

      {/* Quiz questions container (Matching Fig. Page 14 exactly) */}
      {questions.length > 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Quiz:
              </span>
              <span className="ml-2 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {topic}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-medium">
                Answered: {checkedQuestions.length}/{questions.length}
              </span>
              <button
                type="button"
                onClick={handleResetQuiz}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
                title="Reset answers to try again"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3"
              >
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  <span className="text-blue-600 mr-1.5">Q{qIdx + 1}:</span>
                  {q.question}
                </p>

                {/* 4 Options */}
                <div className="space-y-2 pt-1">
                  {q.options.map((option, optIdx) => {
                    const isSelected = q.userSelected === option;
                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleSelectOption(qIdx, option)}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-400 text-blue-950 font-medium'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        } ${q.isAnswerChecked ? 'cursor-default' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIdx}`}
                          checked={isSelected}
                          disabled={q.isAnswerChecked}
                          onChange={() => handleSelectOption(qIdx, option)}
                          className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="flex-1 leading-relaxed">{option}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Actions & Result Badge (Matching Page 14) */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                  {!q.isAnswerChecked ? (
                    <button
                      type="button"
                      disabled={!q.userSelected}
                      onClick={() => handleCheckAnswer(qIdx)}
                      className="inline-flex items-center justify-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="flex-1 space-y-2">
                      {q.isCorrect ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Correct!</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Incorrect. Correct answer: {q.answer}</span>
                        </div>
                      )}

                      {q.explanation && (
                        <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                          <strong>Why?</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quiz Summary Banner */}
          {isAllChecked && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Quiz Completed!</h4>
                  <p className="text-xs text-blue-100">
                    You scored {correctCount} out of {questions.length} (
                    {Math.round((correctCount / questions.length) * 100)}%)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetQuiz}
                className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
